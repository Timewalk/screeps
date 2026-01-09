const conf = {
    name: 'Hugo',
    role: 'harvester',
    body: [WORK, WORK, MOVE],
    spawn: 'Spawn1',
    spawnDirection: 3,
    source: '5bbcaffd9099fc012e63b77f',
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

    const source = Game.getObjectById(conf.source);
    if (creep.pos.isNearTo(source)) {
        creep.harvest(source);
    } else {
        creep.moveTo(source);
    }
}

module.exports = { run };
