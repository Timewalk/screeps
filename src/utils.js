const utils = {}

utils.clearDeadCreeps = function () {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}

utils.buildBody = function (body, energyAvailable) {
    const builtBody = [];
    let energyCost = 0;

    for (const part of body) {
        const partCost = BODYPART_COST[part];
        if (energyCost + partCost <= energyAvailable) {
            builtBody.push(part);
            energyCost += partCost;
        } else {
            break;
        }
    }

    return builtBody;
}


utils.getCreepsNeedingEnergy = function (creeps) {
    creeps = Object.values(creeps);
    let rtn = [];
    for (let i = 0; i < creeps.length; i++) {
        let c = creeps[i];
        let isa = (c.role === 'builder');
        let isb = (c.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        if (isa && isb) {
            creepsNeedingEnergy.push(creep);
        }
    }
    return 

module.exports = utils;


