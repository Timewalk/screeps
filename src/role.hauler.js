const utils = require('utils');


function getNeedyCreep(self, creeps) {
    if (self.store.getUsedCapacity() === 0) return null;
    if (!creeps || creeps.length === 0) return null;

    let nearbyNeedy = null;
    for (let i = 0; i < creeps.length; i++) {
        if (!self.pos.isNearTo(creeps[i])) continue;
        if (!nearbyNeedy || creeps[i].store[RESOURCE_ENERGY] < nearbyNeedy.store[RESOURCE_ENERGY]) {
            nearbyNeedy = creeps[i];
        }
    } 
    return nearbyNeedy;
}

function getPickup(self, conf) {
    if (self.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return null;
    if (!conf.pickups || conf.pickups.length === 0) return null;

    for (let i = 0; i < conf.pickups.length; i++) {
        const pickup = conf.pickups[i];
        if (self.pos.isNearTo(pickup.x, pickup.y)) {
            if (pickup.id) return Game.getObjectById(pickup.id);
            let structures = self.room.lookForAt(LOOK_STRUCTURES, pickup.x, pickup.y);
            for (let j = 0; j < structures.length; j++) {
                if (!structures[j].store) continue;
                if (structures[j].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    return structures[j];
                }
            }
            return self.room.lookForAt(LOOK_RESOURCES, pickup.x, pickup.y)[0];
        }
    }
    return null;
} 

function getNeedyTransfer(self, transfers) {
    if (self.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return null;
    if (!transfers || transfers.length === 0) return null;

    let target = null;
    for (let i = 0; i < transfers.length; i++) {
        const transferTarget = transfers[i];
        if (self.pos.isNearTo(transferTarget.x, transferTarget.y)) {
            if (transferTarget.id) {
                target = Game.getObjectById(transferTarget.id);
            } else {
                let structures = self.room.lookForAt(LOOK_STRUCTURES, transferTarget.x, transferTarget.y);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].store && structures[j].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        target = structures[j];
                        break;
                    }
                }
            }
            if (target && target.store && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return target;
            }
        }
    }

    return target;
}


function creepTransfer(self, creeps, resourceType = RESOURCE_ENERGY) {
    if (self.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return ERR_NOT_ENOUGH_ENERGY;
    if (!creeps || creeps.length === 0) return ERR_NOT_FOUND;

    let nearbyNeedy = getNeedyCreep(self, creeps);
    if (!nearbyNeedy) return ERR_NOT_IN_RANGE;

    let creepEnergy = self.store.getUsedCapacity(RESOURCE_ENERGY);
    let targetFreeSpace = nearbyNeedy.store.getFreeCapacity(RESOURCE_ENERGY);

    let result = self.transfer(nearbyNeedy, resourceType);
    if (result === OK && creepEnergy <= targetFreeSpace) {
        self.reverseDirection = true;
    }
    return result;
}

function structureTransfer(self, transfers, resourceType = RESOURCE_ENERGY) {
    if (self.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return ERR_NOT_ENOUGH_ENERGY; 
    if (!transfers || transfers.length === 0) return ERR_NOT_FOUND;

    let target = getNeedyTransfer(self, transfers);
    if (!target) return ERR_NOT_IN_RANGE;

    let creepEnergy = self.store.getUsedCapacity(RESOURCE_ENERGY);
    let targetFreeSpace = target.store.getFreeCapacity(RESOURCE_ENERGY);
    
    let result = self.transfer(target, resourceType);
    if (result === OK && creepEnergy <= targetFreeSpace) {
        self.reverseDirection = true;
    }
    return result;
}

function structureWithdraw(self, pickups, resourceType = RESOURCE_ENERGY) {
    if (self.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return ERR_FULL;
    if (!pickups || pickups.length === 0) return ERR_NOT_FOUND;

    let target = getPickup(self, {pickups: pickups});
    if (!target) return ERR_NOT_IN_RANGE;

    return self.withdraw(target, resourceType);
}

function resourcePickup(self, pickups, resourceType = RESOURCE_ENERGY) {
    if (self.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return ERR_FULL;
    if (!pickups || pickups.length === 0) return ERR_NOT_FOUND;
    
    let target = getPickup(self, {pickups: pickups});
    if (!target) return ERR_NOT_IN_RANGE;

    return self.pickup(target);
}

function resourceDrop(self, dropoffs, resourceType = RESOURCE_ENERGY) {
    if (self.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return ERR_NOT_ENOUGH_ENERGY;
    if (!dropoffs || dropoffs.length === 0) return ERR_NOT_FOUND;

    let dropoff = dropoffs[0];
    if (!self.pos.isEqualTo(dropoff.x, dropoff.y)) return ERR_NOT_IN_RANGE;

    return self.drop(resourceType);
}





function update(self, conf) {

    let result;
    self.reverseDirection = false;

    if (result !== OK) {
        result = creepTransfer(self, global.creepsNeedingEnergy);
    }

    if (result !== OK) {
        result = structureTransfer(self, conf.transfers);
    }

    if (result !== OK) {
        result = structureWithdraw(self, conf.pickups);
    }

    if (result !== OK) {
        result = resourcePickup(self, conf.pickups);
    }

    if (result !== OK) {
        result = resourceDrop(self, conf.dropoffs);
    }

    if (self.fatigue > 0) return; 
    let moveRes = self.moveOnRails(conf.route);

    return result || moveRes;
}


module.exports = { update };
