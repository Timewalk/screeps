const utils = require('utils');
const confCreeps = require('conf.creeps');
require('creep');
require('spawn');


// const creeps = ['Hiccup',  'Toothless', 'Harvey', 'Thor', 'Ulysses', 'Bob', 'Tempest', 'Tonia', 'Umbra', 'Ultron'];
const creeps = ['Hiccup', 'Toothless', 'Harvey', 'Thor', 'Bob', 'Tempest', 'Ultron', 'Ulysses', 'Tonia', ];

module.exports.loop = function () {

    // Clear dead creeps from memory
    utils.clearDeadCreeps();

    // Reset softSpawning for all spawns that finished spawning
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        if (!spawn.spawning && spawn.softSpawning) {
            spawn.softSpawning = false;
        }
    }

    global.creepsNeedingEnergy = Object.values(Game.creeps).filter(
        c => (c.role === 'builder') &&
        c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 
    );

    for (let i = 0; i < creeps.length; i++) {
        const conf = confCreeps[creeps[i]]; 
        const creep = Game.creeps[conf.name];
        const spawn = Game.spawns[conf.spawn];
        if (!creep && spawn && spawn.ready) {
            const body = utils.buildBody(conf.body, spawn.room.energyAvailable);
            const memory = {
                role: conf.role,
                step: 0,
                target: conf.target || null
            }

            if (body.length > 0) {
                const result = spawn.spawnCreep(body, conf.name, { memory: memory, directions: conf.spawnDirections });
                if (result === OK) {
                    spawn.softSpawning = true;
                }
            }
        } else if (creep && !creep.spawning) {
            creep.update(conf);
        }   
    }
}
