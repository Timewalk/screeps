/**
 * Room Manager
 *
 * One instance per room per tick.
 * Manages room-level logic and spawn requests.
 */

class RoomManager {
    constructor(room, spawnManager) {
        this.room = room;
        this.spawnManager = spawnManager;
        this.creeps = _.filter(Game.creeps, c => c.room.name === room.name);
    }

    run() {
        // TODO: request spawns based on room needs
    }
}

module.exports = RoomManager;
