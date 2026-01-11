/**
 * Role: Builder
 *
 * Gets energy, builds construction sites.
 * Uses centralized target priority - all builders work same target.
 * Falls back to upgrading when no sites.
 *
 * Memory:
 *   - building: true when has energy and working
 *   - targetId: current construction site (sticky until complete)
 */

// Priority order for construction sites (lower = higher priority)
const STRUCTURE_PRIORITY = {
    [STRUCTURE_SPAWN]: 1,
    [STRUCTURE_EXTENSION]: 2,
    [STRUCTURE_TOWER]: 3,
    [STRUCTURE_STORAGE]: 4,
    [STRUCTURE_CONTAINER]: 5,
    [STRUCTURE_ROAD]: 6,
    [STRUCTURE_WALL]: 10,
    [STRUCTURE_RAMPART]: 10,
};

const roleBuilder = {
    /**
     * @param {Creep} creep
     */
    run(creep) {
        // State switching
        if (creep.memory.building && creep.isEmpty) {
            creep.memory.building = false;
        }
        if (!creep.memory.building && creep.notEmpty) {
            creep.memory.building = true;
        }

        if (creep.memory.building) {
            this.build(creep);
        } else {
            this.getEnergy(creep);
        }
    },

    /**
     * Get the priority construction target for the room
     */
    getTarget(room) {
        const sites = room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length === 0) return null;

        sites.sort((a, b) => {
            const priA = STRUCTURE_PRIORITY[a.structureType] || 99;
            const priB = STRUCTURE_PRIORITY[b.structureType] || 99;
            if (priA !== priB) return priA - priB;

            const pctA = a.progress / a.progressTotal;
            const pctB = b.progress / b.progressTotal;
            return pctB - pctA;
        });

        return sites[0];
    },

    /**
     * Build construction sites, or upgrade as fallback
     */
    build(creep) {
        let target = Game.getObjectById(creep.memory.targetId);

        if (!target) {
            target = this.getTarget(creep.room);
            creep.memory.targetId = target ? target.id : null;
        }

        if (target) {
            if (creep.build(target) === ERR_NOT_IN_RANGE) {
                creep.travelTo(target, { range: 3 });
            }
            return;
        }

        // No construction sites - upgrade controller as fallback
        const controller = creep.room.controller;
        if (controller) {
            if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                creep.travelTo(controller, { range: 3 });
            }
        }
    },

    /**
     * Get energy from largest source in room
     */
    getEnergy(creep) {
        delete creep.memory.targetId;

        // Find all energy sources
        const sources = [];

        // Containers
        const containers = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
        });
        for (const c of containers) {
            sources.push({ target: c, amount: c.store[RESOURCE_ENERGY], type: 'withdraw' });
        }

        // Storage
        const storage = creep.room.storage;
        if (storage && storage.store[RESOURCE_ENERGY] > 0) {
            sources.push({ target: storage, amount: storage.store[RESOURCE_ENERGY], type: 'withdraw' });
        }

        // Dropped energy
        const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType === RESOURCE_ENERGY
        });
        for (const d of dropped) {
            sources.push({ target: d, amount: d.amount, type: 'pickup' });
        }

        // Get biggest
        if (sources.length > 0) {
            const biggest = _.max(sources, s => s.amount);
            if (biggest.type === 'withdraw') {
                if (creep.withdraw(biggest.target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(biggest.target);
                }
            } else {
                if (creep.pickup(biggest.target) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(biggest.target);
                }
            }
        }
    },

    /**
     * Builder body - balanced WORK/CARRY/MOVE
     */
    idealBody: [MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY],

    minEnergy: 200,
};

module.exports = roleBuilder;
