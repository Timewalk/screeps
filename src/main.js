const creeps = require('conf.creeps');
const utils = require('utils');
require('spawn');
require('creep');

module.exports.loop = function () {
    utils.refreshCache();

    // Build structures for each room based on room-specific configurations
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        if (room.controller && room.controller.my) {
            try {
                let roomConfig = require(`conf.shard3.${roomName}`);
                utils.buildStructures(roomConfig);
            } catch (e) {
                continue; // Room configuration file doesn't exist, skip
            }
        }
    }

    for (let spawnName in Game.spawns) {
        Game.spawns[spawnName].spawnCreeps(creeps);
    }

    for (let conf of creeps) {
        let creep = Game.creeps[conf.name];
        if (!creep) continue;

        creep.update(conf);
    }
}
