const conf = {
    name: 'Hugo',
    role: 'harvester',
    body: [WORK, WORK, MOVE],
    spawn: 'Spawn1',
    spawnDirection: 3,
    route: [
        { r: 'E49S55', x: 39, y: 34 },  // spawn output
        { r: 'E49S55', x: 40, y: 34 },  // step toward park
        { r: 'E49S55', x: 41, y: 35 },  // park (adjacent to source)
    ],
    parkIndex: 2,
    source: { r: 'E49S55', x: 40, y: 36, id: '5bbcaffd9099fc012e63b77f' },
};

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (s && !s.spawning) {
        s.spawnCreep(conf.body, conf.name, {
            memory: { role: conf.role, routeIndex: 0 },
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
    if (creep.fatigue > 0) return;

    const mem = creep.memory;
    if (mem.routeIndex === undefined) mem.routeIndex = 0;
    const pos = conf.route[mem.routeIndex];

    // At current target position?
    if (creep.pos.x === pos.x && creep.pos.y === pos.y) {
        // At park - harvest
        if (mem.routeIndex === conf.parkIndex) {
            const source = Game.getObjectById(conf.source.id);
            creep.harvest(source);
            return;  // stay parked
        }

        // Advance to next position
        mem.routeIndex = mem.routeIndex + 1;
    }

    // Move toward current target
    const target = conf.route[mem.routeIndex];
    creep.moveTo(target.x, target.y);
}

module.exports = { run };
