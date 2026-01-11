/**
 * Spawn Manager
 *
 * Manages creep population based on room needs.
 * Spawns creeps with appropriate bodies and assignments.
 */

const { buildBody } = require('util');
const config = require('config');
const roleHarvester = require('role.harvester');
const roleHauler = require('role.hauler');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleRemoteHauler = require('role.remoteHauler');

// Population targets (harvester count is dynamic based on sources)
const POPULATION = {
    hauler: 2,
    upgrader: 4,
    builder: 2,
};


const spawnManager = {
    run() {
        const spawn = Game.spawns['Spawn1'];
        if (!spawn || spawn.spawning) return;

        const room = spawn.room;
        const creeps = _.groupBy(Game.creeps, c => c.memory.role);

        // Count by role
        const counts = {
            harvester: (creeps.harvester || []).length,
            hauler: (creeps.hauler || []).length,
            upgrader: (creeps.upgrader || []).length,
            builder: (creeps.builder || []).length,
            remoteHauler: (creeps.remoteHauler || []).length,
        };

        // Check what we need (priority order)
        const needed = this.getNeeded(room, counts);
        if (!needed) return;

        // Emergency mode: missing harvesters or haulers = can't fill extensions
        // Use current energy instead of waiting for full capacity
        const emergency = counts.harvester === 0 || counts.hauler === 0;

        // Build the creep
        this.spawnCreep(spawn, needed.role, needed.memory, emergency);
    },

    /**
     * Determine what creep is needed most
     */
    getNeeded(room, counts) {
        const energy = room.energyAvailable;

        // Priority 1: Haulers (move energy around)
        if (counts.hauler < POPULATION.hauler) {
            if (energy >= roleHauler.minEnergy) {
                return {
                    role: 'hauler',
                    memory: { role: 'hauler', delivering: false },
                };
            }
        }

        // Priority 2: Harvesters (one per source from config)
        const assignedSources = _.map(
            _.filter(Game.creeps, c => c.memory.role === 'harvester'),
            c => c.memory.sourceId
        );
        const unassignedSource = _.find(config.sources, s => !assignedSources.includes(s.id));

        if (unassignedSource && energy >= roleHarvester.minEnergy) {
            return {
                role: 'harvester',
                memory: { role: 'harvester', sourceId: unassignedSource.id },
            };
        }

        // Priority 3: Upgraders
        if (counts.upgrader < POPULATION.upgrader) {
            if (energy >= roleUpgrader.minEnergy) {
                return {
                    role: 'upgrader',
                    memory: { role: 'upgrader', upgrading: false },
                };
            }
        }

        // Priority 4: Builders (only if construction sites - tower handles repairs)
        const sites = room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length > 0 && counts.builder < POPULATION.builder) {
            if (energy >= roleBuilder.minEnergy) {
                return {
                    role: 'builder',
                    memory: { role: 'builder', building: false },
                };
            }
        }

        // Priority 5: Remote haulers (one per non-local source that has a harvester)
        const remoteHaulers = _.filter(Game.creeps, c => c.memory.role === 'remoteHauler');
        const hauledSourceIds = _.map(remoteHaulers, c => c.memory.sourceId);
        // Find a source outside spawn room that has a harvester but no hauler
        const needsHauler = _.find(config.sources, s => {
            if (s.parking.room === room.name) return false; // Local source, regular hauler handles it
            const hasHarvester = assignedSources.includes(s.id);
            const hasHauler = hauledSourceIds.includes(s.id);
            return hasHarvester && !hasHauler;
        });

        if (needsHauler && energy >= roleRemoteHauler.minEnergy) {
            return {
                role: 'remoteHauler',
                memory: {
                    role: 'remoteHauler',
                    remoteRoom: needsHauler.parking.room,
                    sourceId: needsHauler.id,
                    sourcePos: { x: needsHauler.parking.x, y: needsHauler.parking.y },
                    homeRoom: room.name,
                    delivering: false,
                },
            };
        }

        return null;
    },

    /**
     * Spawn a creep with scaled body
     */
    spawnCreep(spawn, role, memory, emergency) {
        const room = spawn.room;

        // Emergency: use current energy. Normal: use full capacity.
        const energy = emergency ? room.energyAvailable : room.energyCapacityAvailable;

        const roles = {
            harvester: roleHarvester,
            hauler: roleHauler,
            upgrader: roleUpgrader,
            builder: roleBuilder,
            remoteHauler: roleRemoteHauler,
        };

        const roleConfig = roles[role];
        const body = buildBody(roleConfig.idealBody, energy);
        const name = this.generateName(role);

        const result = spawn.spawnCreep(body, name, { memory });
        if (result === OK) {
            const mode = emergency ? 'EMERGENCY' : 'normal';
            console.log(`Spawning ${name} [${role}] (${mode}) with body: ${body}`);
        }
    },

    /**
     * Generate a creative name for the role
     */
    generateName(role) {
        const names = {
            harvester: ['Hugo', 'Hank', 'Henry', 'Harvey', 'Harold'],
            hauler: ['Tucker', 'Travis', 'Tyler', 'Theo', 'Trent'],
            upgrader: ['Uma', 'Ulric', 'Uri', 'Upton', 'Usher'],
            builder: ['Bob', 'Benny', 'Blake', 'Brad', 'Bruno'],
            remoteHauler: ['Hector', 'Howie', 'Hans', 'Homer', 'Huxley'],
        };

        const pool = names[role] || ['Creep'];
        const existing = _.keys(Game.creeps);

        // Find first unused name
        for (const name of pool) {
            if (!existing.includes(name)) {
                return name;
            }
        }

        // Fallback: name with number
        return `${pool[0]}${Game.time}`;
    },
};

module.exports = spawnManager;
