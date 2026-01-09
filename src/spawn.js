const utils = require('utils');


const buildBody = function(body, energy) {
    let parts = [];
    let totalCost = 0;

    for (let part of body) {
        let partCost = BODYPART_COST[part];
        if (totalCost + partCost > energy) break;
        parts.push(part);
        totalCost += partCost;
    }

    return parts;
}

Spawn.prototype.spawnCreeps = function(conf) {
    if (this.spawning) return;
    for (let creep of conf) {
        let body = buildBody(creep.body, this.room.energyCapacityAvailable);
        if (this.spawnCreep(body, creep.name) === OK) return;
    }
    return ERR_NOT_ENOUGH_ENERGY;
};


module.exports = {};
