/**
 * Bob - Builder
 * Walks the road, steps off to build stations, builds construction sites.
 * Stays off roads when building to not block truckers.
 *
 * Build Stations (off-road positions):
 *   Station 1: (14,17) - covers spawn area roads
 *   Station 2: (19,13) - covers diagonal section
 *   Station 3: (24,10) - covers source area
 *   Station 4: (22,5)  - covers controller area
 *
 * Room: E48S56
 */

const { buildBody } = require('util');

const conf = {
    name: 'Bob',
    idealBody: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, WORK],
    minEnergy: 200,  // WORK + CARRY + MOVE minimum
    spawn: 'Spawn1',
    spawnDirection: BOTTOM,  // Spawn onto road at (14, 16)
};

// Bob's route with build stations
const routine = [
    // Start on road, go to Station 1
    { pos: { x: 14, y: 16 }, dir: BOTTOM },
    { pos: { x: 14, y: 17 }, dir: TOP, actions: ['build'] },  // Station 1

    // Back on road, walk to Station 2
    { pos: { x: 14, y: 16 }, dir: RIGHT },
    { pos: { x: 15, y: 16 }, dir: RIGHT },
    { pos: { x: 16, y: 16 }, dir: RIGHT },
    { pos: { x: 17, y: 16 }, dir: TOP_RIGHT },
    { pos: { x: 18, y: 15 }, dir: TOP_RIGHT },
    { pos: { x: 19, y: 14 }, dir: BOTTOM },  // Step off road
    { pos: { x: 19, y: 13 }, dir: TOP, actions: ['build'] },  // Station 2

    // Back on road, walk to Station 3
    { pos: { x: 19, y: 14 }, dir: TOP_RIGHT },
    { pos: { x: 20, y: 13 }, dir: TOP_RIGHT },
    { pos: { x: 21, y: 12 }, dir: TOP_RIGHT },
    { pos: { x: 22, y: 11 }, dir: TOP_RIGHT },
    { pos: { x: 23, y: 10 }, dir: BOTTOM },  // Step off road
    { pos: { x: 23, y: 9 }, dir: TOP, actions: ['build'] },  // Station 3 (adjusted to 23,9)

    // Back on road, walk to Station 4
    { pos: { x: 23, y: 10 }, dir: TOP_RIGHT },
    { pos: { x: 24, y: 9 }, dir: RIGHT },
    { pos: { x: 25, y: 9 }, dir: TOP },
    { pos: { x: 25, y: 8 }, dir: TOP_LEFT },
    { pos: { x: 24, y: 7 }, dir: TOP_LEFT },
    { pos: { x: 23, y: 6 }, dir: TOP_LEFT },  // Step off road
    { pos: { x: 22, y: 5 }, dir: BOTTOM_RIGHT, actions: ['build'] },  // Station 4

    // Return journey
    { pos: { x: 23, y: 6 }, dir: BOTTOM_RIGHT },
    { pos: { x: 24, y: 7 }, dir: BOTTOM_RIGHT },
    { pos: { x: 25, y: 8 }, dir: BOTTOM },
    { pos: { x: 25, y: 9 }, dir: LEFT },
    { pos: { x: 24, y: 9 }, dir: BOTTOM_LEFT },
    { pos: { x: 23, y: 10 }, dir: BOTTOM_LEFT },
    { pos: { x: 22, y: 11 }, dir: BOTTOM_LEFT },
    { pos: { x: 21, y: 12 }, dir: BOTTOM_LEFT },
    { pos: { x: 20, y: 13 }, dir: BOTTOM_LEFT },
    { pos: { x: 19, y: 14 }, dir: BOTTOM_LEFT },
    { pos: { x: 18, y: 15 }, dir: BOTTOM_LEFT },
    { pos: { x: 17, y: 16 }, dir: LEFT },
    { pos: { x: 16, y: 16 }, dir: LEFT },
    { pos: { x: 15, y: 16 }, dir: LEFT },
    // Loops back to (14,16) at step 0
];

// Build stations for trucker transfers
const BUILD_STATIONS = [
    { x: 14, y: 17 },
    { x: 19, y: 13 },
    { x: 23, y: 9 },
    { x: 22, y: 5 },
];

const actions = {
    build(creep) {
        if (creep.isEmpty) return;

        // Find nearest construction site within range 3
        const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        const inRange = sites.filter(s =>
            Math.max(Math.abs(s.pos.x - creep.pos.x), Math.abs(s.pos.y - creep.pos.y)) <= 3
        );

        if (inRange.length === 0) return;

        // Build the closest one
        const target = inRange.reduce((a, b) =>
            creep.pos.getRangeTo(a) < creep.pos.getRangeTo(b) ? a : b
        );

        return creep.build(target);
    },
};

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (!s || s.spawning) return false;
    if (Game.creeps[conf.name]) return false;

    // Only spawn if there are construction sites to build
    const sites = s.room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length === 0) return false;

    if (s.room.energyAvailable < conf.minEnergy) return false;

    const body = buildBody(conf.idealBody, s.room.energyCapacityAvailable);
    if (body.length === 0) return false;

    const result = s.spawnCreep(body, conf.name, {
        memory: { role: 'builder', step: 0 },
        directions: [conf.spawnDirection]
    });

    if (result === OK) {
        console.log(`Spawning ${conf.name} with body: ${body}`);
    }
    return result === OK;
}

function run() {
    const creep = Game.creeps[conf.name];

    if (!creep) {
        spawn();
        return;
    }

    if (creep.spawning) return;

    // Initialize step
    if (creep.memory.step === undefined) creep.memory.step = 0;

    let step = creep.memory.step;
    const current = routine[step];

    // Verify position - if wrong, step back
    if (creep.pos.x !== current.pos.x || creep.pos.y !== current.pos.y) {
        step = (step - 1 + routine.length) % routine.length;
        creep.memory.step = step;

        // Sanity check
        const here = routine[step];
        if (creep.pos.x !== here.pos.x || creep.pos.y !== here.pos.y) {
            console.log(`${conf.name} OFF RAILS! At (${creep.pos.x},${creep.pos.y}), expected (${here.pos.x},${here.pos.y}) step=${step}`);
        }
    }

    const here = routine[step];

    // Execute actions if defined for this tile
    if (here.actions) {
        for (const actionName of here.actions) {
            const result = actions[actionName](creep);
            if (result === OK) break;
        }
    }

    // Move to next position if direction specified
    if (creep.fatigue > 0) return;
    if (here.dir) {
        creep.move(here.dir);
        creep.memory.step = (step + 1) % routine.length;
    }
}

module.exports = { run, BUILD_STATIONS };
