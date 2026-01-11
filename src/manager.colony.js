/**
 * Colony Manager
 *
 * Top-level manager. Owns room managers and coordinates colony-wide operations.
 */

const config = require('config');
const RoomManager = require('manager.room');
const SpawnManager = require('manager.spawn');

class ColonyManager {
    constructor() {
        this.spawnManager = new SpawnManager();
        this.roomManagers = {};

        // Create room manager for each configured room
        for (const roomName in config.rooms) {
            const room = Game.rooms[roomName];
            if (room) {
                this.roomManagers[roomName] = new RoomManager(room, this.spawnManager);
            }
        }
    }

    run() {
        // Run each room manager
        for (const roomName in this.roomManagers) {
            this.roomManagers[roomName].run();
        }

        // Process spawn requests at end of tick
        this.spawnManager.process();
    }
}

module.exports = ColonyManager;
