/**
 * Bob - Builder
 * Walks his own rail (off-road) between build stations.
 * Waits at each station until all sites within range 3 are complete.
 *
 * Build Stations:
 *   Station 0: (17,15) - south of road
 *   Station 1: (22,12) - south of road
 *   Station 2: (24,8)  - near source/controller
 *
 * Room: E48S56
 */

const { buildBody } = require('util');

const conf = {
    name: 'Bob',
    idealBody: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, WORK],
    minEnergy: 200,
    spawn: 'Spawn1',
    spawnDirection: RIGHT,  // Spawn to (15, 15)
};

// Stations - Bob builds everything within range 3 of each
const STATIONS = [
    { pos: { x: 17, y: 15 } },
    { pos: { x: 22, y: 12 } },
    { pos: { x: 24, y: 8 } },
];

// Bob's rail
const routine = [
    // Spawn entry
    { pos: { x: 15, y: 15 }, dir: RIGHT },
    { pos: { x: 16, y: 15 }, dir: RIGHT },

    // Station 0
    { pos: { x: 17, y: 15 }, dir: BOTTOM_RIGHT, station: 0 },

    // Hop road south, walk to Station 1
    { pos: { x: 18, y: 16 }, dir: TOP_RIGHT },
    { pos: { x: 19, y: 15 }, dir: TOP_RIGHT },
    { pos: { x: 20, y: 14 }, dir: TOP_RIGHT },
    { pos: { x: 21, y: 13 }, dir: TOP_RIGHT },

    // Station 1
    { pos: { x: 22, y: 12 }, dir: TOP_LEFT, station: 1 },

    // Hop road north, walk to Station 2
    { pos: { x: 21, y: 11 }, dir: TOP_RIGHT },
    { pos: { x: 22, y: 10 }, dir: TOP_RIGHT },
    { pos: { x: 23, y: 9 }, dir: TOP_RIGHT },

    // Station 2
    { pos: { x: 24, y: 8 }, dir: BOTTOM_LEFT, station: 2 },

    // Return to spawn area
    { pos: { x: 23, y: 9 }, dir: BOTTOM_LEFT },
    { pos: { x: 22, y: 10 }, dir: BOTTOM_LEFT },
    { pos: { x: 21, y: 11 }, dir: BOTTOM_LEFT },
    { pos: { x: 20, y: 12 }, dir: BOTTOM_LEFT },
    { pos: { x: 19, y: 13 }, dir: BOTTOM_LEFT },
    { pos: { x: 18, y: 14 }, dir: BOTTOM_LEFT },
    { pos: { x: 17, y: 15 }, dir: LEFT },
    { pos: { x: 16, y: 15 }, dir: LEFT },
    // loops back to (15, 15) at step 0
];

// Check if any construction sites within range 3 of station
function stationHasWork(room, stationIndex) {
    const station = STATIONS[stationIndex];
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    return sites.some(s =>
        Math.max(Math.abs(s.pos.x - station.pos.x), Math.abs(s.pos.y - station.pos.y)) <= 3
    );
}

// Build nearest site within range 3
function buildAtStation(creep) {
    if (creep.isEmpty) return;

    const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
    const inRange = sites.filter(s =>
        Math.max(Math.abs(s.pos.x - creep.pos.x), Math.abs(s.pos.y - creep.pos.y)) <= 3
    );

    if (inRange.length === 0) return;

    const target = inRange.reduce((a, b) =>
        creep.pos.getRangeTo(a) < creep.pos.getRangeTo(b) ? a : b
    );

    return creep.build(target);
}

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (!s || s.spawning) return false;
    if (Game.creeps[conf.name]) return false;

    // Only spawn if there are construction sites
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

    if (creep.memory.step === undefined) creep.memory.step = 0;

    let step = creep.memory.step;
    const current = routine[step];

    // Verify position - if wrong, step back
    if (creep.pos.x !== current.pos.x || creep.pos.y !== current.pos.y) {
        step = (step - 1 + routine.length) % routine.length;
        creep.memory.step = step;

        const here = routine[step];
        if (creep.pos.x !== here.pos.x || creep.pos.y !== here.pos.y) {
            console.log(`${conf.name} OFF RAILS! At (${creep.pos.x},${creep.pos.y}), expected (${here.pos.x},${here.pos.y}) step=${step}`);
        }
    }

    const here = routine[step];

    // At a build station - build and wait if work remains
    if (here.station !== undefined) {
        buildAtStation(creep);

        if (stationHasWork(creep.room, here.station)) {
            return;  // Wait at station
        }
    }

    // Move to next position
    if (creep.fatigue > 0) return;
    if (here.dir) {
        creep.move(here.dir);
        creep.memory.step = (step + 1) % routine.length;
    }
}

module.exports = { run, STATIONS };
