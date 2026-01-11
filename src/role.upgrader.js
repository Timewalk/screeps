/**
 * Role: Upgrader (Static/Fat)
 *
 * Walks to container near controller, parks there, upgrades forever.
 * Similar pattern to harvesters - stationary once in position.
 *
 * Memory:
 *   - containerId: assigned container near controller
 */

const roleUpgrader = {
    /**
     * @param {Creep} creep
     */
    run(creep) {
        const controller = creep.room.controller;
        if (!controller) return;

        // Find or assign a container near the controller
        if (!creep.memory.containerId) {
            const container = controller.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            })[0];
            if (container) {
                creep.memory.containerId = container.id;
            }
        }

        const container = Game.getObjectById(creep.memory.containerId);

        // If we have a container, use stationary pattern
        if (container) {
            this.runStationary(creep, controller, container);
        } else {
            // Fallback: mobile upgrader (no container yet)
            this.runMobile(creep, controller);
        }
    },

    /**
     * Stationary upgrader - sit at container, withdraw, upgrade
     */
    runStationary(creep, controller, container) {
        // Must be adjacent to container AND in range 3 of controller
        const nearContainer = creep.pos.isNearTo(container);
        const inUpgradeRange = creep.pos.inRangeTo(controller, 3);

        if (!nearContainer) {
            creep.travelTo(container);
            return;
        }
        if (!inUpgradeRange) {
            creep.travelTo(controller, { range: 3 });
            return;
        }

        // We're in position - withdraw and upgrade
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            creep.withdraw(container, RESOURCE_ENERGY);
        }

        if (creep.store[RESOURCE_ENERGY] > 0) {
            creep.upgradeController(controller);
        }
    },

    /**
     * Mobile upgrader fallback - for when no container exists yet
     */
    runMobile(creep, controller) {
        // Simple state machine
        if (creep.memory.upgrading && creep.isEmpty) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.isFull) {
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                creep.travelTo(controller, { range: 3 });
            }
        } else {
            // Get energy from containers or dropped
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_CONTAINER &&
                             s.store[RESOURCE_ENERGY] > 0
            });
            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(container);
                }
                return;
            }

            // Dropped energy
            const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
            });
            if (dropped) {
                if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(dropped);
                }
            }
        }
    },

    /**
     * Fat upgrader body - WORK heavy, minimal movement
     * 5 WORK = 5 upgrade points/tick
     * 1 CARRY = hold energy from container
     * 1 MOVE = get to position once
     */
    idealBody: [WORK, CARRY, MOVE, WORK, WORK, WORK, WORK],

    minEnergy: 250,
};

module.exports = roleUpgrader;
