/**
 * Role: Hauler
 *
 * Picks up dropped energy or withdraws from containers.
 * Delivers to spawn, extensions, or towers.
 *
 * Memory:
 *   - delivering: true when full and delivering, false when collecting
 */

const roleHauler = {
    /**
     * @param {Creep} creep
     */
    run(creep) {
        // State switching
        // Deliver as soon as we have any energy, only collect when empty
        if (creep.memory.delivering && creep.isEmpty) {
            creep.memory.delivering = false;
        }
        if (!creep.memory.delivering && creep.notEmpty) {
            creep.memory.delivering = true;
        }

        if (creep.memory.delivering) {
            this.deliver(creep);
        } else {
            this.collect(creep);
        }
    },

    /**
     * Collect energy - find biggest source regardless of type
     */
    collect(creep) {
        const controller = creep.room.controller;

        // Gather all energy sources (excluding controller container)
        const sources = [];

        // Add containers (not near controller)
        const containers = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER &&
                         s.store[RESOURCE_ENERGY] > 0 &&
                         (!controller || !s.pos.inRangeTo(controller, 3))
        });
        for (const c of containers) {
            sources.push({ target: c, amount: c.store[RESOURCE_ENERGY], type: 'container' });
        }

        // Add dropped energy
        const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType === RESOURCE_ENERGY
        });
        for (const d of dropped) {
            sources.push({ target: d, amount: d.amount, type: 'dropped' });
        }

        // Add tombstones with energy
        const tombstones = creep.room.find(FIND_TOMBSTONES, {
            filter: t => t.store[RESOURCE_ENERGY] > 0
        });
        for (const t of tombstones) {
            sources.push({ target: t, amount: t.store[RESOURCE_ENERGY], type: 'container' });
        }

        // Pick the biggest
        if (sources.length > 0) {
            const biggest = _.max(sources, s => s.amount);
            if (biggest.type === 'container') {
                if (creep.withdraw(biggest.target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(biggest.target);
                }
            } else {
                if (creep.pickup(biggest.target) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(biggest.target);
                }
            }
            return;
        }

        // Fallback: Storage
        const storage = creep.room.storage;
        if (storage && storage.store[RESOURCE_ENERGY] > 0) {
            if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.travelTo(storage);
            }
        }
    },

    /**
     * Deliver energy to structures that need it
     */
    deliver(creep) {
        // Priority 1: Spawn and extensions (keeps colony alive)
        const spawnOrExt = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => (s.structureType === STRUCTURE_SPAWN ||
                         s.structureType === STRUCTURE_EXTENSION) &&
                         s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        if (spawnOrExt) {
            if (creep.transfer(spawnOrExt, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.travelTo(spawnOrExt);
            }
            return;
        }

        // Priority 2: Towers
        const tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER &&
                         s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        if (tower) {
            if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.travelTo(tower);
            }
            return;
        }

        // Priority 3: Controller container (feed upgraders)
        const controller = creep.room.controller;
        if (controller) {
            const upgraderContainer = controller.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: s => s.structureType === STRUCTURE_CONTAINER &&
                             s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            })[0];
            if (upgraderContainer) {
                if (creep.transfer(upgraderContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(upgraderContainer);
                }
                return;
            }
        }

        // Priority 4: Storage (dump excess)
        const storage = creep.room.storage;
        if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.travelTo(storage);
            }
        }
    },

    /**
     * Hauler body - all CARRY and MOVE (scales up to 800 energy)
     * 1:1 ratio keeps full speed when loaded
     */
    idealBody: [MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY],

    minEnergy: 100,
};

module.exports = roleHauler;
