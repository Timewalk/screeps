const utils = require('utils');
const constants = require('conf.constants');

module.exports.update = function(creep, creepConfig) {
    let sites, damagedStructures, pickupTarget, results = null;
    
    switch(creep.state) {
        case 'park':
            if (creep.store[RESOURCE_ENERGY] === 0) {
                creep.state = 'pickup';
                return this.update(creep, creepConfig);
            }

            sites = utils.getAllSites(creep.room.name);
            if (sites.length > 0) {
                creep.state = 'build';
                return this.update(creep, creepConfig);
                
            }

            damagedStructures = utils.getAllDamagedStructures(creep.room.name, constants.repairThreshold);
            if (damagedStructures.length > 0) {
                creep.state = 'repair';
                return this.update(creep, creepConfig);
            }

            let parkingPos = [creep.room.name, creepConfig.parking.x, creepConfig.parking.y];
            creep.moveToParking(parkingPos);
            let controllerPos = [creep.room.name, creepConfig.controller.x, creepConfig.controller.y];
            return creep.upgradeController(utils.getStructureAt(STRUCTURE_CONTROLLER, controllerPos));

            break;
 
        case 'pickup':
            let pickupPos = [creep.room.name, creepConfig.pickup.x, creepConfig.pickup.y];
            pickupTarget = utils.getDroppedEnergyAt(pickupPos)
            if (pickupTarget) {
                results = creep.pickup(pickupTarget);
                if (results === OK) {
                    creep.state = 'park';
                }
                return results;
            }

            pickupTarget = utils.getStructureAt(STRUCTURE_CONTAINER, pickupPos);
            if (pickupTarget) {
                results = creep.withdraw(pickupTarget, RESOURCE_ENERGY);
                if (results === OK) {
                    creep.state = 'park';
                }
                return results;
            }

            creep.state = 'park';
            break;
            
        case 'build':
            sites = utils.getAllSites(creep.room.name);
            if (sites.length > 0) {
                let site = utils.getObjectById(sites[0].id);
                if (site) {
                    results = creep.build(site);
                    if (results === OK) {
                        if (creep.store[RESOURCE_ENERGY] === 0) creep.state = 'pickup';
                        return results;
                    }
                }
            }

            creep.state = 'park';
            break;
            
        case 'repair':
            damagedStructures = utils.getAllDamagedStructures(creep.room.name, constants.repairThreshold);
            if (damagedStructures.length > 0) {
                results = creep.repair(damagedStructures[0]);
                if (results === OK) {
                    if (creep.store[RESOURCE_ENERGY] === 0) creep.state = 'pickup';
                    return results;
                    
                }
            }

            creep.state = 'park';
            break;

            
        default:
            creep.state = 'park';
            break;
    }
    
    return OK;
};
