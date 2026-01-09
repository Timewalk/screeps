const util = require('util');
const conf = require('conf');
require('spawn.prototype');
require('creep.prototype');

module.exports.loop = function () {
    util.cacheAllRooms();
    Memory.debugCache = JSON.stringify(global.cache);
    
    // Spawn creeps from config
    for (let creepConfig of conf.creeps) {
        if (!Game.creeps[creepConfig.name]) {
            let spawn = Game.spawns[creepConfig.spawn];
            if (spawn && !spawn.spawning) {
                let result = spawn.spawnCreepFromConfig(creepConfig);
                if (result === OK) {
                    console.log('Spawning creep:', creepConfig.name);
                }
            }
        }
    }
    
    // Update all creeps
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        creep.update();
    }
    
    console.log('Heartbeat - Tick:', Game.time);
};