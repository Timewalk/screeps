/**
 * Travis - Second Hauler/Trucker
 * Same route as Tucker, but spawns 180 degrees out of phase.
 * Spawns when Tucker is at step 13 (halfway point) to maintain offset.
 *
 * Room: E48S56
 * Route: Same as Tucker - (14, 16) <-> (23, 6) full road round trip
 */

const { buildBody } = require('util');

const ROUTE_LENGTH = 27;

const conf = {
    name: 'Travis',
    phase: 13,  // Spawn when Game.time % ROUTE_LENGTH === phase (180° offset from Tucker)
    idealBody: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
    minEnergy: 100,
    spawn: 'Spawn1',
    spawnDirection: BOTTOM,
};

// Same routine as Tucker - shared constant would be cleaner but this works
const routine = [
    // Outbound: spawn area -> controller area
    { pos: { x: 14, y: 16 }, dir: RIGHT, actions: ['pickupSam'] },
    { pos: { x: 15, y: 16 }, dir: RIGHT },
    { pos: { x: 16, y: 16 }, dir: RIGHT },
    { pos: { x: 17, y: 16 }, dir: TOP_RIGHT },
    { pos: { x: 18, y: 15 }, dir: TOP_RIGHT },
    { pos: { x: 19, y: 14 }, dir: TOP_RIGHT },
    { pos: { x: 20, y: 13 }, dir: TOP_RIGHT },
    { pos: { x: 21, y: 12 }, dir: TOP_RIGHT },
    { pos: { x: 22, y: 11 }, dir: TOP_RIGHT },
    { pos: { x: 23, y: 10 }, dir: TOP_RIGHT },
    { pos: { x: 24, y: 9 }, dir: RIGHT },
    { pos: { x: 25, y: 9 }, dir: TOP, actions: ['pickupHugo'] },
    { pos: { x: 25, y: 8 }, dir: TOP_LEFT },
    { pos: { x: 24, y: 7 }, dir: TOP_LEFT },                          // Step 13 - halfway
    { pos: { x: 23, y: 6 }, dir: BOTTOM_RIGHT, actions: ['transferUma'] },

    // Return: back to spawn
    { pos: { x: 24, y: 7 }, dir: BOTTOM_RIGHT },
    { pos: { x: 25, y: 8 }, dir: BOTTOM },
    { pos: { x: 25, y: 9 }, dir: LEFT, actions: ['pickupHugo'] },
    { pos: { x: 24, y: 9 }, dir: BOTTOM_LEFT },
    { pos: { x: 23, y: 10 }, dir: BOTTOM_LEFT },
    { pos: { x: 22, y: 11 }, dir: BOTTOM_LEFT },
    { pos: { x: 21, y: 12 }, dir: BOTTOM_LEFT },
    { pos: { x: 20, y: 13 }, dir: BOTTOM_LEFT },
    { pos: { x: 19, y: 14 }, dir: BOTTOM_LEFT },
    { pos: { x: 18, y: 15 }, dir: BOTTOM_LEFT },
    { pos: { x: 17, y: 16 }, dir: LEFT },
    { pos: { x: 16, y: 16 }, dir: LEFT },
    { pos: { x: 15, y: 16 }, dir: LEFT, actions: ['transferSpawn'] },
];

const actions = {
    pickupHugo(creep) {
        if (!creep.notFull) return;
        const resource = creep.room.lookForAt(LOOK_RESOURCES, 26, 9)[0];
        if (resource) return creep.pickup(resource);
    },
    pickupSam(creep) {
        if (!creep.notFull) return;
        const resource = creep.room.lookForAt(LOOK_RESOURCES, 13, 15)[0];
        if (resource) return creep.pickup(resource);
    },
    transferSpawn(creep) {
        if (!creep.notEmpty) return;
        const spawn = Game.spawns['Spawn1'];
        if (spawn) return creep.transfer(spawn, RESOURCE_ENERGY);
    },
    transferUma(creep) {
        if (!creep.notEmpty) return;
        const uma = Game.creeps['Uma'];
        if (uma) return creep.transfer(uma, RESOURCE_ENERGY);
    },
};

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (!s || s.spawning) return false;
    if (Game.creeps[conf.name]) return false;

    // Only spawn at our phase in the master clock
    if (Game.time % ROUTE_LENGTH !== conf.phase) return false;

    if (s.room.energyAvailable < conf.minEnergy) return false;

    const body = buildBody(conf.idealBody, s.room.energyCapacityAvailable);
    if (body.length === 0) return false;

    const result = s.spawnCreep(body, conf.name, {
        memory: { role: 'hauler', step: 0 },
        directions: [conf.spawnDirection]
    });

    if (result === OK) {
        console.log(`Spawning ${conf.name} with body: ${body} (phase ${conf.phase})`);
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

    // Verify position - if wrong, step back (move was blocked last tick)
    if (creep.pos.x !== current.pos.x || creep.pos.y !== current.pos.y) {
        step = (step - 1 + routine.length) % routine.length;
        creep.memory.step = step;

        // Sanity check - if still wrong, we're off rails
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

module.exports = { run };
