/**
 * Main Loop - Community Standard Pattern
 *
 * Role-based creep management with static harvesters.
 */

require('prototypes');
require('Traveler');  // Adds creep.travelTo()
const roleHarvester = require('role.harvester');
const roleHauler = require('role.hauler');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleRemoteHauler = require('role.remoteHauler');
const spawnManager = require('spawn');
const stats = require('stats');

module.exports.loop = function() {
    // Clean up memory for dead creeps
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // Run spawn logic
    spawnManager.run();

    // Run towers
    const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);
    for (const tower of towers) {
        // Priority 1: Attack hostiles
        const hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostile) {
            tower.attack(hostile);
            continue;
        }

        // Priority 2: Repair damaged structures (not walls/ramparts)
        const damaged = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: s => s.hits < s.hitsMax &&
                         s.structureType !== STRUCTURE_WALL &&
                         s.structureType !== STRUCTURE_RAMPART
        });
        if (damaged) {
            tower.repair(damaged);
        }
    }

    // Run each creep by role
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        switch (creep.memory.role) {
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'hauler':
                roleHauler.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'remoteHauler':
                roleRemoteHauler.run(creep);
                break;
        }
    }

    // Collect stats at end of loop (for Grafana)
    stats.run();

    // Draw visuals
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        const visual = new RoomVisual(roomName);

        // Container energy labels
        const containers = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        });
        for (const container of containers) {
            const energy = container.store[RESOURCE_ENERGY];
            const capacity = container.store.getCapacity(RESOURCE_ENERGY);
            const pct = Math.round(energy / capacity * 100);

            // Color based on fill level
            let color = '#ff0000';  // red < 25%
            if (pct >= 75) color = '#00ff00';  // green
            else if (pct >= 50) color = '#ffff00';  // yellow
            else if (pct >= 25) color = '#ff8800';  // orange

            visual.text(`${energy}`, container.pos.x, container.pos.y - 0.5, {
                font: 0.5,
                color: color,
                stroke: '#000000',
                strokeWidth: 0.1
            });
        }
    }
};
