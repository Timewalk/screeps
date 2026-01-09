const utils = require('utils');
const roomConfig = require('conf.shard3.E51N48');

Creep.prototype.update = function(conf) {
    if (this.spawning) return;
    switch (conf.role) {
        case 'harvester':
            const parkingFlag = Game.flags[conf.parking];
            const source = Game.getObjectById(conf.sourceId);

            if (parkingFlag && source) {
                if (this.pos.isEqualTo(parkingFlag.pos)) {
                    return this.harvest(source);
                } else {
                    return this.moveTo(parkingFlag);
                }
            } else {
                console.log(`Missing flag ${conf.parking} or source ${conf.sourceId} for harvester ${this.name}`);
            }
            console.log(`Harvester ${this.name} is broken`);

            break;
        case 'hauler':
            if (this.store.getUsedCapacity() === 0) {
                let pickupFlag = Game.flags[conf.pickup];
                if (pickupFlag) {
                    let droppedEnergy = pickupFlag.pos.lookFor(LOOK_ENERGY)[0];
                    if (droppedEnergy) {
                        if (this.pickup(droppedEnergy) === OK) return;
                        let result = this.moveTo(droppedEnergy);
                        if (result === OK || result === ERR_TIRED) return;
                    }
                }

                let container = Game.getObjectById(conf.withdraw);
                if (container) {
                    if (this.withdraw(container, RESOURCE_ENERGY) === OK) return;
                    let result = this.moveTo(container);
                    if (result === OK || result === ERR_TIRED) return;
                }
                console.log(`Hauler ${this.name} is broken, no energy to pickup`);
                 
            } else {
                for (let id of conf.transfer) {
                    let structure = Game.getObjectById(id);
                    console.log(`Hauler ${this.name} transferring energy to structure ${structure ? structure.id : 'undefined'}`);
                    if (structure && structure.store && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        if (this.transfer(structure, RESOURCE_ENERGY) === OK) return;
                        let result = this.moveTo(structure);
                        if (result === OK || result === ERR_TIRED) {
                            return;
                        }
                    }
                }
                
                let dropoff = Game.flags[conf.dropoff];
                if (dropoff) {
                    if (this.pos.isEqualTo(dropoff.pos)) {
                        return this.drop(RESOURCE_ENERGY);
                    } else {
                        return this.moveTo(dropoff);
                    }
                } else {
                    console.log(`Flag ${conf.dropoff} not found for creep ${this.name}`);
                }
            }
            console.log(`Hauler ${this.name} is broken`);
            if (conf.parking && Game.flags[conf.parking]) {
                this.moveTo(Game.flags[conf.parking].pos);
            }

            break;
        case 'worker':
            if (this.store.getUsedCapacity() === 0) {
                let pickupFlag = Game.flags[conf.pickup];
                if (pickupFlag) {
                    let droppedEnergy = pickupFlag.pos.lookFor(LOOK_ENERGY)[0];
                    if (droppedEnergy) {
                        if (this.pickup(droppedEnergy) === OK) return;
                        let result = this.moveTo(droppedEnergy);
                        if (result === OK || result === ERR_TIRED) return;
                    }
                }

                let container = Game.getObjectById(conf.withdraw);
                if (container) {
                    if (this.withdraw(container, RESOURCE_ENERGY) === OK) return;
                    let result = this.moveTo(container);
                    if (result === OK || result === ERR_TIRED) return;
                }
            } else {
                for (let structConf of roomConfig) {
                    if (structConf.type === 'source') continue;
                    
                    let room = Game.rooms[structConf.roomName];
                    if (!room) continue;
                    
                    let currentRCL = room.controller.level;
                    if (structConf.rcl > currentRCL) continue;
                    
                    let pos = new RoomPosition(structConf.x, structConf.y, structConf.roomName);
                    let site = pos.lookFor(LOOK_CONSTRUCTION_SITES)[0];
                    
                    if (site) {
                        if (this.build(site) === OK) return;
                        let result = this.moveTo(site);
                        if (result === OK || result === ERR_TIRED) return;
                    }
                }

                let damagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: s => s.hits < s.hitsMax * 0.5 && s.structureType !== STRUCTURE_WALL
                });
                if (damagedStructure) {
                    if (this.repair(damagedStructure) === OK) return;
                    let result = this.moveTo(damagedStructure);
                    if (result === OK || result === ERR_TIRED) return;
                }

                let controller = Game.getObjectById(conf.controller);
                if (controller) {
                    if (this.upgradeController(controller) === OK) return;
                    let result = this.moveTo(controller);
                    if (result === OK || result === ERR_TIRED) return;
                }
            }

            break;
        }
};

