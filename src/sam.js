/**
 * Sam - Spawn Harvester
 * Special harvester that feeds the spawn directly.
 * Has CARRY part unlike regular harvesters.
 * Stands adjacent to both source and spawn.
 *
 * Room: E48S56
 * Spawn: (14, 15) - ID: 6961424fb9b7840012eb316c
 * West Source: (13, 16) - ID: 5bbcafe99099fc012e63b602
 * Position: (13, 15) - adjacent to both!
 */

const conf = {
    name: 'Sam',
    body: [WORK, WORK, CARRY, MOVE],
    spawn: 'Spawn1',
    spawnDirection: LEFT,
    sourceId: '5bbcafe99099fc012e63b602',
    spawnId: '6961424fb9b7840012eb316c',
};

// Sam's routine - where to be and what to do
const routine = [
    {
        pos: { x: 13, y: 15 },
        dir: null,
        actions: ['harvest', 'transfer', 'drop']
    },
];

// Sam's actions - conditions baked in
const actions = {
    harvest(creep) {
        if (!creep.notFull) return;
        return creep.harvest(Game.getObjectById(conf.sourceId));
    },
    transfer(creep) {
        if (!creep.isFull) return;
        return creep.transfer(Game.getObjectById(conf.spawnId), RESOURCE_ENERGY);
    },
    drop(creep) {
        if (!creep.isFull) return;
        return creep.drop(RESOURCE_ENERGY);
    }
};

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (!s || s.spawning) return false;
    if (Game.creeps[conf.name]) return false;

    const result = s.spawnCreep(conf.body, conf.name, {
        memory: { role: 'harvesterSpawn', step: 0 },
        directions: [conf.spawnDirection]
    });

    if (result === OK) {
        console.log(`Spawning ${conf.name}`);
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

    // Execute actions for this tile
    for (const actionName of here.actions) {
        const result = actions[actionName](creep);
        if (result === OK) break;
    }

    // Move to next position if direction specified
    if (creep.fatigue > 0) return;  // Fatigue only blocks movement
    if (here.dir) {
        creep.move(here.dir);
    }

    // Advance to next step
    creep.memory.step = (step + 1) % routine.length;
}

module.exports = { run };
