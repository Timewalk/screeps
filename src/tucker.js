/**
 * Tucker - Hauler/Trucker
 * Hauls energy along the full road from spawn to controller area.
 * Services: Hugo (26,9), future upgraders at (25,7) and (24,6)
 *
 * Room: E48S56
 * Spawn: (14, 15)
 * Route: (14, 16) <-> (23, 6) full road round trip
 */

const { buildBody } = require('util');

const conf = {
    name: 'Tucker',
    // Ideal body: balanced CARRY/MOVE for road travel
    idealBody: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
    minEnergy: 100,  // CARRY + MOVE minimum
    spawn: 'Spawn1',
    spawnDirection: BOTTOM,  // Spawn onto road at (14, 16)
};

// Tucker's route - full road round trip
const routine = [
    // Outbound: spawn area -> controller area
    { pos: { x: 14, y: 16 }, dir: RIGHT, actions: ['pickupSam'] },  // Sam drops at (13,15)
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
    { pos: { x: 25, y: 9 }, dir: TOP, actions: ['pickupHugo'] },  // Hugo drops at (26,9)
    { pos: { x: 25, y: 8 }, dir: TOP_LEFT },
    { pos: { x: 24, y: 7 }, dir: TOP_LEFT },
    { pos: { x: 23, y: 6 }, dir: BOTTOM_RIGHT, actions: ['transferUma'] },  // Uma at (24,5) adjacent

    // Return: back to spawn
    { pos: { x: 24, y: 7 }, dir: BOTTOM_RIGHT },
    { pos: { x: 25, y: 8 }, dir: BOTTOM },
    { pos: { x: 25, y: 9 }, dir: LEFT, actions: ['pickupHugo'] },  // Pickup again on way back
    { pos: { x: 24, y: 9 }, dir: BOTTOM_LEFT },
    { pos: { x: 23, y: 10 }, dir: BOTTOM_LEFT },
    { pos: { x: 22, y: 11 }, dir: BOTTOM_LEFT },
    { pos: { x: 21, y: 12 }, dir: BOTTOM_LEFT },
    { pos: { x: 20, y: 13 }, dir: BOTTOM_LEFT },
    { pos: { x: 19, y: 14 }, dir: BOTTOM_LEFT },
    { pos: { x: 18, y: 15 }, dir: BOTTOM_LEFT },
    { pos: { x: 17, y: 16 }, dir: LEFT },
    { pos: { x: 16, y: 16 }, dir: LEFT },
    { pos: { x: 15, y: 16 }, dir: LEFT, actions: ['transferSpawn'] },  // Transfer to spawn, then LEFT to (14,16) which is step 0
];

// Tucker's actions
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

    if (s.room.energyAvailable < conf.minEnergy) return false;

    const body = buildBody(conf.idealBody, s.room.energyCapacityAvailable);
    if (body.length === 0) return false;

    const result = s.spawnCreep(body, conf.name, {
        memory: { role: 'hauler', step: 0 },
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

    // Verify position - if wrong, step back (move was blocked last tick)
    if (creep.pos.x !== current.pos.x || creep.pos.y !== current.pos.y) {
        step = (step - 1 + routine.length) % routine.length;
        creep.memory.step = step;

        // Sanity check - if still wrong, we're off rails entirely
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
