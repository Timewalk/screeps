const utils = require('utils');

module.exports.update = function(creep, creepConfig) {
    let results, target, position, amount;
    switch(creep.state) {
        case 'park':
            let parkingPos = [creep.room.name, creepConfig.parking.x, creepConfig.parking.y];
            results = creep.moveToParking(parkingPos);
            creep.state = creep.store[RESOURCE_ENERGY] === 0 ? 'pickup' : 'dropoff';
            break;
            
        case 'pickup':
            let pickupPos = [creep.room.name, creepConfig.pickup.x, creepConfig.pickup.y];
            results = creep.pickup(utils.getDroppedEnergyAt(pickupPos));
            if (results === OK) return results;
            
            results = creep.withdraw(utils.getStructureAt(STRUCTURE_CONTAINER, pickupPos), RESOURCE_ENERGY);
            if (results === OK) return results;
            

            creep.state = creep.store[RESOURCE_ENERGY] === 0 ? 'pickup' : 'dropoff';

            return OK;
            
        case 'dropoff':
            // If no energy, go to pickup
            if (creep.store[RESOURCE_ENERGY] === 0) {
                creep.state = 'pickup';
                return OK;
            }

            for (let targetConfig of creepConfig.dropoff) {
                if (targetConfig.type === 'drop location') {
                    // Legacy format with explicit drop location type
                    let dropPos = [creep.room.name, targetConfig.pos.x, targetConfig.pos.y];
                    position = utils.toRoomPosition(dropPos);
                    
                    // Move to the dropoff position first
                    if (!creep.pos.isEqualTo(position)) {
                        creep.moveTo(position);
                        return OK;
                    }
                    
                    // Drop energy when at the position
                    if (creep.drop(RESOURCE_ENERGY) === OK) creep.state = 'pickup';
                    return OK;
                } else if (targetConfig.type) {
                    // Legacy format with explicit structure type
                    let targetPos = [creep.room.name, targetConfig.pos.x, targetConfig.pos.y];
                    target = utils.getStructureAt(targetConfig.type, targetPos);
                    if (!target || !target.store || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) continue;
                    amount = Math.min(creep.store[RESOURCE_ENERGY], target.store.getFreeCapacity(RESOURCE_ENERGY)); 
                    if (creep.transfer(target, RESOURCE_ENERGY, amount) === OK) {
                        if (creep.store[RESOURCE_ENERGY] === 0) creep.state = 'pickup';
                    }
                    return OK;
                } else if (targetConfig.rcl !== undefined) {
                    // Structure object from rooms.E51N48.structures.*
                    let targetPos = [creep.room.name, targetConfig.x, targetConfig.y];
                    target = utils.getStructureAt(STRUCTURE_CONTAINER, targetPos);
                    if (!target || !target.store || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) continue;
                    amount = Math.min(creep.store[RESOURCE_ENERGY], target.store.getFreeCapacity(RESOURCE_ENERGY)); 
                    if (creep.transfer(target, RESOURCE_ENERGY, amount) === OK) {
                        if (creep.store[RESOURCE_ENERGY] === 0) creep.state = 'pickup';
                    }
                    return OK;
                } else {
                    // Position object from rooms.E51N48.positions.dropoff
                    let dropPos = [creep.room.name, targetConfig.x, targetConfig.y];
                    position = utils.toRoomPosition(dropPos);
                    
                    // Move to the dropoff position first
                    if (!creep.pos.isEqualTo(position)) {
                        creep.moveTo(position);
                        return OK;
                    }
                    
                    // Drop energy when at the position
                    if (creep.drop(RESOURCE_ENERGY) === OK) creep.state = 'pickup';
                    return OK;
                }
            }
            creep.state = 'park';
            break;
    }
    
    return OK;
};
