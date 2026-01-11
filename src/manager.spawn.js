/**
 * Spawn Manager
 *
 * Manages all spawns in the colony.
 * Other managers call spawnCreep() to request spawns.
 * Colony calls process() at end of tick to execute.
 *
 * Body scaling: managers pass ideal body, spawn manager scales
 * based on the spawn's room energy.
 */

const { buildBody } = require('util');

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

            // Calculate ideal body cost
            const idealCost = this.bodyCost(req.body);
            const maxEnergy = spawn.room.energyCapacityAvailable;

            // Only scale if room can't ever afford ideal body
            let body, requiredEnergy;
            if (idealCost <= maxEnergy) {
                body = req.body;
                requiredEnergy = idealCost;
            } else {
                body = buildBody(req.body, maxEnergy);
                requiredEnergy = this.bodyCost(body);
            }

            if (body.length === 0) continue;

            // Wait for required energy
            if (spawn.room.energyAvailable < requiredEnergy) continue;

            const result = spawn.spawnCreep(body, req.name, { memory: req.memory });
            if (result === OK) {
                console.log(`${spawnName}: Spawning ${req.name} with ${body.length} parts`);
            }
        }

        // Clear pending for next tick
        this.pending = {};
    }

    /**
     * Calculate body part cost
     */
    bodyCost(body) {
        const costs = { move: 50, work: 100, carry: 50, attack: 80, ranged_attack: 150, heal: 250, claim: 600, tough: 10 };
        return body.reduce((sum, part) => sum + (costs[part] || 0), 0);
    }
}

module.exports = SpawnManager;
