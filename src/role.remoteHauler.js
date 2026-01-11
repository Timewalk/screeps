/**
 * Role: Remote Hauler
 *
 * Travels to remote room, picks up energy from container, brings it home.
 * The bottleneck of remote mining - size matters.
 *
 * Memory:
 *   - remoteRoom: target room name
 *   - sourceId: the source (to find container near it)
 *   - homeRoom: room to deliver to
 *   - delivering: true when heading home with energy
 */

const roleRemoteHauler = {
    /**
     * @param {Creep} creep
     */
    run(creep) {
        const remoteRoom = creep.memory.remoteRoom;
        const homeRoom = creep.memory.homeRoom;
        if (!remoteRoom || !homeRoom) return;

        // State switching
        if (creep.memory.delivering && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.delivering = false;
        }
        if (!creep.memory.delivering && creep.store.getFreeCapacity() === 0) {
            creep.memory.delivering = true;
        }

        if (creep.memory.delivering) {
            this.deliver(creep, homeRoom);
        } else {
            this.collect(creep, remoteRoom);
        }
    },

    /**
     * Go to remote room and collect from container
     */
    collect(creep, remoteRoom) {
        // Travel to remote room if not there
        if (creep.room.name !== remoteRoom) {
            const sourcePos = creep.memory.sourcePos;
            if (sourcePos) {
                const destination = new RoomPosition(sourcePos.x, sourcePos.y, remoteRoom);
                creep.travelTo({ pos: destination });
            }
            return;
        }

        // Find container near the assigned source
        const source = Game.getObjectById(creep.memory.sourceId);
        if (!source) return;

        const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        })[0];

        if (container && container.store[RESOURCE_ENERGY] > 0) {
            // Withdraw from container
            if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.travelTo(container);
            }
        } else {
            // No container or empty - pick up dropped energy as fallback
            const dropped = source.pos.findInRange(FIND_DROPPED_RESOURCES, 2, {
                filter: r => r.resourceType === RESOURCE_ENERGY
            })[0];
            if (dropped) {
                if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(dropped);
                }
            } else {
                // Wait near source for energy
                creep.travelTo(source, { range: 2 });
            }
        }
    },

    /**
     * Return home and deliver energy
     */
    deliver(creep, homeRoom) {
        // Travel to home room if not there
        if (creep.room.name !== homeRoom) {
            const homeSpawn = Game.spawns['Spawn1'];
            if (homeSpawn) {
                creep.travelTo(homeSpawn);
            }
            return;
        }

        // Priority 1: Spawn and extensions
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

        // Priority 3: Storage
        const storage = creep.room.storage;
        if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.travelTo(storage);
            }
            return;
        }

        // Priority 4: Controller container (feed upgraders)
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
            }
        }
    },

    /**
     * Remote hauler body - all CARRY and MOVE
     * Sized to match source output over round trip time
     * 8 CARRY = 400 capacity (80 tick round trip × 5 energy/tick)
     * 8 MOVE = full speed when loaded (1:1 ratio, no roads)
     */
    idealBody: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE,
                CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],

    minEnergy: 100,
};

module.exports = roleRemoteHauler;
