const conf = {
    name: 'Uma',
    role: 'upgrader',
    body: [WORK, CARRY, MOVE],
    spawn: 'Spawn1',
    spawnDirection: 3,
    controller: '5bbcaffd9099fc012e63b780',
};

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (s && !s.spawning) {
        s.spawnCreep(conf.body, conf.name, {
            memory: { role: conf.role },
            directions: [conf.spawnDirection]
        });
    }
}

function run() {
    const creep = Game.creeps[conf.name];

    if (!creep) {
        spawn();
        return;
    }

    if (creep.spawning) return;

    const controller = Game.getObjectById(conf.controller);

    // Move to controller if not in range
    if (!creep.pos.inRangeTo(controller, 3)) {
        creep.moveTo(controller);
        return;
    }

    // Upgrade if we have energy
    if (creep.store[RESOURCE_ENERGY] > 0) {
        creep.upgradeController(controller);
    }
}

module.exports = { run };
