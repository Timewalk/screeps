/**
 * Stats Module
 *
 * Tracks game metrics for Grafana visualization.
 * Writes to Memory.stats which screeps-grafana collects.
 *
 * Pattern: Accumulators (counters that only increase)
 * - Graphite samples once per minute
 * - We sum values every tick
 * - Grafana uses derivative() to compute averages
 */

const stats = {
    run() {
        // Initialize once (don't reset - we're accumulating!)
        if (!Memory.stats) Memory.stats = {};

        const room = Game.rooms['E42S48'];
        if (!room) return;

        // Container energy accumulators
        const containers = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        });

        for (const container of containers) {
            const id8 = container.id.substring(0, 8);
            const key = `containers.${id8}.energySum`;

            // Initialize if first time
            if (Memory.stats[key] === undefined) {
                Memory.stats[key] = 0;
            }

            // Accumulate current energy into running sum
            Memory.stats[key] += container.store[RESOURCE_ENERGY];
        }

        // Track game tick (natural counter - increases by 1 each tick)
        Memory.stats['tick'] = Game.time;
    }
};

module.exports = stats;
