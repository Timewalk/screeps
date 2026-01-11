/**
 * Role: Harvester
 *
 * Travels to parking, builds/maintains container, harvests.
 * Works on any source regardless of room.
 *
 * Memory:
 *   - sourceId: assigned source ID (parking looked up from config)
 *
 * Operator responsibilities:
 *   - Set parking adjacent to source
 *   - Place container construction site at parking
 */

const config = require('config');

const roleHarvester = {
    /**
     * @param {Creep} creep
     */
    run(creep) {
        const sourceConfig = this.getSourceConfig(creep.memory.sourceId);
        if (!sourceConfig) return;

        const parking = sourceConfig.parking;
        const parkingPos = new RoomPosition(parking.x, parking.y, parking.room);

        // Not at parking? Travel there.
        if (!creep.pos.isEqualTo(parkingPos)) {
            creep.travelTo({ pos: parkingPos });
            return;
        }

        // At parking - get source
        const source = Game.getObjectById(creep.memory.sourceId);
        if (!source) return;

        // Check for container or site at parking
        const container = parkingPos.lookFor(LOOK_STRUCTURES)
            .find(s => s.structureType === STRUCTURE_CONTAINER);

        const site = parkingPos.lookFor(LOOK_CONSTRUCTION_SITES)
            .find(s => s.structureType === STRUCTURE_CONTAINER);

        // State machine: Build → Repair → Harvest
        if (site) {
            this.build(creep, source, site);
        } else if (container && container.hits < container.hitsMax * config.containerRepairThreshold) {
            this.repair(creep, source, container);
        } else {
            creep.harvest(source);
        }
    },

    /**
     * Build container at parking.
     * Harvest to get energy, then build.
     */
    build(creep, source, site) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.harvest(source);
        } else {
            creep.build(site);
        }
    },

    /**
     * Repair container at parking.
     * Harvest to get energy, then repair.
     */
    repair(creep, source, container) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.harvest(source);
        } else {
            creep.repair(container);
        }
    },

    /**
     * Get source config from config.js
     */
    getSourceConfig(sourceId) {
        return config.sources.find(s => s.id === sourceId);
    },

    /**
     * Get body based on source room status.
     * All bodies include 1 CARRY for build/repair.
     *
     * @param {Room} sourceRoom - The room the source is in
     */
    getBody(sourceRoom) {
        const controller = sourceRoom.controller;

        if (controller && controller.my) {
            // Claimed room: stationary, minimal MOVE
            return [WORK, WORK, WORK, WORK, WORK, MOVE, CARRY];
        } else if (controller && controller.reservation && controller.reservation.username === config.username) {
            // Reserved room: some travel
            return [WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY];
        } else {
            // Unclaimed room: full travel
            return [WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY];
        }
    },

    /**
     * Default body for spawn.js compatibility.
     * Spawn manager will use getBody() for smarter scaling.
     */
    idealBody: [WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY],

    minEnergy: 300,
};

module.exports = roleHarvester;
