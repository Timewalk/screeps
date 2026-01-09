const utils = require('utils');

module.exports.update = function(creep, creepConfig) {
    if (creep.spawning) return;

    const parking = creepConfig.parking;
    const source = Game.getObjectById(creepConfig.sourceId);
    
    creep.moveTo(parking);
    creep.harvest(source);
};
