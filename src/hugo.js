/**
 * Hugo - East Source Harvester
 * Pure harvester (no CARRY) that walks to east source and harvests.
 * Drops energy on the ground for haulers to collect.
 *
 * Room: E48S56
 * Spawn: (14, 15) - ID: 6961424fb9b7840012eb316c
 * East Source: (27, 8) - ID: 5bbcafe99099fc012e63b601
 * Harvest Position: (26, 9) - adjacent to source
 */

const { buildBody } = require('util');

const conf = {
    name: 'Hugo',
    // Ideal body in priority order - MOVE first so we can walk, then stack WORK
    idealBody: [WORK, MOVE, WORK, WORK, WORK, WORK],  // 550 energy ideal, 5 WORK = 10 energy/tick
    minEnergy: 250,  // WORK + MOVE + WORK - need at least 2 WORK to be useful
    spawn: 'Spawn1',
    spawnDirection: RIGHT,  // Spawn to (15, 15) - out of hauler path
    sourceId: '5bbcafe99099fc012e63b601',
};

// Hugo's route from spawn to harvest position
const routine = [
    { pos: { x: 15, y: 15 }, dir: BOTTOM },      // Start - spawn position
    { pos: { x: 15, y: 16 }, dir: RIGHT },       // Join road
    { pos: { x: 16, y: 16 }, dir: RIGHT },
    { pos: { x: 17, y: 16 }, dir: TOP_RIGHT },
    { pos: { x: 18, y: 15 }, dir: TOP_RIGHT },
    { pos: { x: 19, y: 14 }, dir: TOP_RIGHT },
    { pos: { x: 20, y: 13 }, dir: TOP_RIGHT },
    { pos: { x: 21, y: 12 }, dir: TOP_RIGHT },
    { pos: { x: 22, y: 11 }, dir: TOP_RIGHT },
    { pos: { x: 23, y: 10 }, dir: TOP_RIGHT },
    { pos: { x: 24, y: 9 }, dir: RIGHT },
    { pos: { x: 25, y: 9 }, dir: RIGHT },
    { pos: { x: 26, y: 9 }, dir: null, actions: ['harvest'] },  // Destination
];

// Hugo's actions
const actions = {
    harvest(creep) {
        return creep.harvest(Game.getObjectById(conf.sourceId));
    }
};

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (!s || s.spawning) return false;
    if (Game.creeps[conf.name]) return false;

    // Don't try if room doesn't have minimum energy for a useful body
    if (s.room.energyAvailable < conf.minEnergy) return false;

    // Build body based on room's energy capacity
    const body = buildBody(conf.idealBody, s.room.energyCapacityAvailable);
    if (body.length === 0) return false;

    const result = s.spawnCreep(body, conf.name, {
        memory: { role: 'harvester', step: 0 },
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

    // Execute actions if at final destination
    if (here.actions) {
        for (const actionName of here.actions) {
            const result = actions[actionName](creep);
            if (result === OK) break;
        }
    }

    // Move to next position if direction specified
    if (creep.fatigue > 0) return;  // Fatigue only blocks movement
    if (here.dir) {
        creep.move(here.dir);
        creep.memory.step = (step + 1) % routine.length;
    }
}

module.exports = { run };
