/**
 * Spawn Manager
 *
 * Manages all spawns in the colony.
 * Other managers call spawnCreep() to request spawns.
 * Colony calls process() at end of tick to execute.
 */

class SpawnManager {
    constructor() {
        // Pending requests for each spawn: { spawnName: request }
        this.pending = {};
    }

    /**
     * Request a spawn. Mirrors native API with priority/location.
     * @param {Array} body - body parts
     * @param {string} name - creep name
     * @param {Object} opts - { memory, priority, near }
     */
    spawnCreep(body, name, opts = {}) {
        const memory = opts.memory || {};
        const priority = opts.priority || 50;
        const pos = opts.near;

        // Find closest available spawn (or any if no position given)
        let bestSpawn = null;
        let bestDistance = Infinity;

        for (const spawnName in Game.spawns) {
            const spawn = Game.spawns[spawnName];
            if (spawn.spawning) continue;

            if (!pos) {
                bestSpawn = spawn;
                break;
            }

            const distance = Game.map.getRoomLinearDistance(spawn.room.name, pos.roomName);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestSpawn = spawn;
            }
        }

        if (!bestSpawn) return; // No available spawns

        const existing = this.pending[bestSpawn.name];

        // If no existing request, or new request is higher priority
        if (!existing || priority < existing.priority) {
            this.pending[bestSpawn.name] = {
                name,
                priority,
                body,
                memory,
            };
        }
    }

    /**
     * Process all pending requests. Called at end of tick.
     */
    process() {
        for (const spawnName in this.pending) {
            const spawn = Game.spawns[spawnName];
            if (!spawn || spawn.spawning) continue;

            const req = this.pending[spawnName];

            const result = spawn.spawnCreep(req.body, req.name, { memory: req.memory });
            if (result === OK) {
                console.log(`${spawnName}: Spawning ${req.name}`);
            }
        }

        // Clear pending for next tick
        this.pending = {};
    }
}

module.exports = SpawnManager;
