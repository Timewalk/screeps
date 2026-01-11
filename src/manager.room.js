/**
 * Room Manager
 *
 * One instance per room per tick.
 * Manages room-level logic and spawn requests.
 */

const config = require('config');
const SourceManager = require('manager.source');

class RoomManager {
    constructor(room, spawnManager) {
        this.room = room;
        this.spawnManager = spawnManager;
        this.creeps = _.filter(Game.creeps, c => c.room.name === room.name);

        // Unpack config for this room
        const roomConfig = config.rooms[room.name] || {};
        this.state = roomConfig.state || 'UNKNOWN';
        this.sources = roomConfig.sources || [];

        // Create source managers
        this.sourceManagers = [];
        for (const src of this.sources) {
            const sourceId = src.id;
            const parking = src.parking;
            this.sourceManagers.push(new SourceManager(sourceId, parking, spawnManager));
        }
    }

    run() {
        if (this.isEmergency()) {
            this.spawn('bootstrap', [MOVE, MOVE, CARRY, WORK], 0);
        }

        // Run source managers (spawns + runs harvesters)
        for (const sourceMgr of this.sourceManagers) {
            sourceMgr.run();
        }

        // Run room-level creeps
        this.runCreeps();
    }

    /**
     * Manager runs all its creeps - they work together
     */
    runCreeps() {
        for (const creep of this.creeps) {
            switch (creep.memory.role) {
                case 'bootstrap':
                    this.runBootstrap(creep);
                    break;
            }
        }
    }

    /**
     * Bootstrap: hauler first, miner second
     * Gets the lights back on during emergency
     */
    runBootstrap(creep) {
        // State switching - fill up completely, then empty completely
        if (creep.memory.delivering && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.delivering = false;
        }
        if (!creep.memory.delivering && creep.store.getFreeCapacity() === 0) {
            creep.memory.delivering = true;
        }

        if (creep.memory.delivering) {
            const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType === STRUCTURE_SPAWN ||
                             s.structureType === STRUCTURE_EXTENSION) &&
                             s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        } else {
            // Hauler first - find any available energy
            const energySource = this.findEnergy(creep);
            if (energySource) {
                if (energySource.type === 'pickup') {
                    if (creep.pickup(energySource.target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(energySource.target);
                    }
                } else {
                    if (creep.withdraw(energySource.target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(energySource.target);
                    }
                }
                return;
            }

            // Miner second - harvest if nothing to haul
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }

    /**
     * Find largest available energy in room
     */
    findEnergy(creep) {
        const sources = [];

        // Dropped energy
        const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType === RESOURCE_ENERGY
        });
        for (const d of dropped) {
            sources.push({ target: d, amount: d.amount, type: 'pickup' });
        }

        // Tombstones
        const tombstones = creep.room.find(FIND_TOMBSTONES, {
            filter: t => t.store[RESOURCE_ENERGY] > 0
        });
        for (const t of tombstones) {
            sources.push({ target: t, amount: t.store[RESOURCE_ENERGY], type: 'withdraw' });
        }

        // Containers
        const containers = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER &&
                         s.store[RESOURCE_ENERGY] > 0
        });
        for (const c of containers) {
            sources.push({ target: c, amount: c.store[RESOURCE_ENERGY], type: 'withdraw' });
        }

        // Storage
        const storage = creep.room.storage;
        if (storage && storage.store[RESOURCE_ENERGY] > 0) {
            sources.push({ target: storage, amount: storage.store[RESOURCE_ENERGY], type: 'withdraw' });
        }

        if (sources.length === 0) return null;

        // Return largest
        return _.max(sources, s => s.amount);
    }

    /**
     * Emergency: can't sustain energy flow
     *
     * Conditions:
     *   - No harvesters = no energy being mined
     *   - No haulers = no energy reaching spawn/extensions
     *   - Bootstrap exists = already recovering, not emergency
     *
     * Bootstrap limit is naturally 1 since having one exits emergency state
     */
    isEmergency() {
        const harvesters = this.creeps.filter(c => c.memory.role === 'harvester');
        const haulers = this.creeps.filter(c => c.memory.role === 'hauler');
        const bootstraps = this.creeps.filter(c => c.memory.role === 'bootstrap');

        const canHarvest = harvesters.length > 0;
        const canHaul = haulers.length > 0;
        const isRecovering = bootstraps.length > 0;

        return (!canHarvest || !canHaul) && !isRecovering;
    }

    /**
     * Request a spawn from the spawn manager
     * @param {string} role
     * @param {Array} body
     * @param {number} priority - 0: critical, 1: normal, 2: low
     * @param {Object} memory - additional memory
     */
    spawn(role, body, priority, memory = {}) {
        const spawn = this.room.find(FIND_MY_SPAWNS)[0];
        if (!spawn) return;

        const name = `${role.charAt(0).toUpperCase()}${this.room.name}`;
        memory.role = role;
        memory.homeRoom = this.room.name;

        this.spawnManager.spawnCreep(body, name, {
            memory,
            priority,
            near: spawn.pos,
        });
    }
}

module.exports = RoomManager;
