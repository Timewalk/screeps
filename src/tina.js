const conf = {
    name: 'Tina',
    role: 'hauler',
    body: [CARRY, CARRY, MOVE],
    spawn: 'Spawn1',
    spawnDirection: 3,
    pickup: { x: 38, y: 11 },  // next to Hank at north source
    upgrader: 'Uma',
};

// States
const PICKUP = 0;
const DELIVER_SPAWN = 1;
const DELIVER_UPGRADER = 2;

function spawn() {
    const s = Game.spawns[conf.spawn];
    if (s && !s.spawning) {
        s.spawnCreep(conf.body, conf.name, {
            memory: { role: conf.role, state: PICKUP },
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

    const mem = creep.memory;
    if (mem.state === undefined) mem.state = PICKUP;

    const spawnBldg = Game.spawns[conf.spawn];
    const pickupPos = new RoomPosition(conf.pickup.x, conf.pickup.y, creep.room.name);
    const upgrader = Game.creeps[conf.upgrader];

    switch (mem.state) {
        case PICKUP:
            // Try to pickup any nearby energy
            const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)[0];
            if (dropped) {
                creep.pickup(dropped);
            }
            // Move to pickup spot
            if (!creep.pos.isEqualTo(pickupPos)) {
                creep.moveTo(pickupPos);
            }
            // Transition when full
            if (creep.store.getFreeCapacity() === 0) {
                mem.state = DELIVER_SPAWN;
            }
            break;

        case DELIVER_SPAWN:
            if (creep.pos.isNearTo(spawnBldg)) {
                creep.transfer(spawnBldg, RESOURCE_ENERGY);
                // Transition when empty
                if (creep.store.getUsedCapacity() <= spawnBldg.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    mem.state = PICKUP;
                } else {
                    // Still have energy, try upgrader
                    mem.state = DELIVER_UPGRADER;
                }
            } else {
                creep.moveTo(spawnBldg);
            }
            break;

        case DELIVER_UPGRADER:
            if (!upgrader) {
                mem.state = PICKUP;
                break;
            }
            if (creep.pos.isNearTo(upgrader)) {
                creep.transfer(upgrader, RESOURCE_ENERGY);
                // Transition when empty
                if (creep.store.getUsedCapacity() <= upgrader.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    mem.state = PICKUP;
                }
                // else stay in this state, keep trying
            } else {
                creep.moveTo(upgrader);
            }
            break;
    }
}

module.exports = { run };
