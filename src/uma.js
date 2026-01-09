/**
 * Uma - Upgrader
 * Parks at (24, 5) and upgrades controller at (27, 5).
 * Range 3 to controller - just in range.
 * Adjacent to road at (23, 6) for energy delivery.
 *
 * Room: E48S56
 * Controller: (27, 5) - ID: 5bbcafe99099fc012e63b600
 * Park Position: (24, 5)
 */

const { buildBody } = require('util');

const conf = {
    name: 'Uma',
    // Ideal body: WORK/CARRY/MOVE to get there, then stack WORK
    idealBody: [WORK, CARRY, MOVE, WORK, WORK, WORK, WORK],
    minEnergy: 200,  // WORK + CARRY + MOVE minimum
    spawn: 'Spawn1',
    spawnDirection: BOTTOM_RIGHT,  // Spawn to (15, 16) on road
    controllerId: '5bbcafe99099fc012e63b600',
};

// Uma's route - spawn to park position
const routine = [
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
    { pos: { x: 25, y: 9 }, dir: TOP },
    { pos: { x: 25, y: 8 }, dir: TOP_LEFT },
    { pos: { x: 24, y: 7 }, dir: TOP_LEFT },
    { pos: { x: 23, y: 6 }, dir: TOP_RIGHT },
    { pos: { x: 24, y: 5 }, dir: null, actions: ['upgrade'] },  // Park and upgrade
];

// Uma's actions
const actions = {
    upgrade(creep) {
        if (!creep.notEmpty) return;
        const controller = Game.getObjectById(conf.controllerId);
        if (controller) return creep.upgradeController(controller);
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
        memory: { role: 'upgrader', step: 0 },
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
