const conf = {
    name: 'Tucker',
    role: 'hauler',
    body: [CARRY, CARRY, MOVE],
    spawn: 'Spawn1',
    spawnDirection: 3,
    route: [
        { r: 'E49S55', x: 39, y: 34 },  // spawn output
        { r: 'E49S55', x: 40, y: 35 },  // step toward pickup
        { r: 'E49S55', x: 40, y: 34 },  // pickup (adjacent to Hugo)
        { r: 'E49S55', x: 39, y: 35 },  // dropoff (adjacent to spawn)
    ],
    pickupIndex: 2,   // route index for pickup
    dropoffIndex: 3,  // route index for dropoff
};

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (s && !s.spawning) {
        s.spawnCreep(conf.body, conf.name, {
            memory: { role: conf.role, routeIndex: 0, hauling: false },
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

    // Update hauling state
    if (creep.store.getFreeCapacity() === 0) mem.hauling = true;
    if (creep.store.getUsedCapacity() === 0) mem.hauling = false;

    // At current target position?
    if (creep.pos.x === pos.x && creep.pos.y === pos.y) {
        // Do action at this position
        if (mem.routeIndex === conf.pickupIndex) {
            const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)[0];
            if (dropped) creep.pickup(dropped);
        }
        if (mem.routeIndex === conf.dropoffIndex) {
            creep.transfer(Game.spawns[conf.spawn], RESOURCE_ENERGY);
        }

        // Advance to next position in route
        mem.routeIndex = (mem.routeIndex + 1) % conf.route.length;
        // Skip spawn output position on loop
        if (mem.routeIndex === 0) mem.routeIndex = 1;
    }

    // Move toward current target
    const target = conf.route[mem.routeIndex];
    creep.moveTo(target.x, target.y);
}

module.exports = { run };
