const util = require('util');

Creep.prototype.update = function() {
    if (!this.memory.instructions || this.memory.instructions.length === 0) {
        return;
    }
    
    // Get current instruction (first one in the array)
    let currentInstruction = this.memory.instructions[0];
    if (!currentInstruction) return;
    
    // Extract action and parameters
    let action = Object.keys(currentInstruction)[0];
    let params = currentInstruction[action];
    
    // Execute the action
    let result = this.executeAction(action, params);
    
    // If action completed successfully, move to next instruction
    if (result === OK || result === ERR_NOT_IN_RANGE) {
        // For moveTo, only advance when we reach the target
        if (action === 'moveTo()' && result === ERR_NOT_IN_RANGE) {
            return; // Still moving, don't advance instruction
        }
        
        // Remove completed instruction
        this.memory.instructions.shift();
    }
};

Creep.prototype.executeAction = function(action, params) {
    switch (action) {
        case 'moveTo()':
            if (Array.isArray(params) && params.length >= 3) {
                let [roomName, x, y] = params;
                if (this.room.name !== roomName) {
                    // Handle room movement later
                    return ERR_NOT_IN_RANGE;
                }
                return this.moveTo(x, y);
            }
            break;
            
        case 'harvest()':
            if (Array.isArray(params) && params.length >= 3) {
                let [roomName, x, y] = params;
                let source = util.getSourceAt([roomName, x, y]);
                if (source) {
                    return this.harvest(source);
                }
            }
            break;
            
        case 'transfer()':
            if (Array.isArray(params) && params.length >= 3) {
                let [roomName, x, y] = params;
                let structure = util.getStructureAt([roomName, x, y]);
                if (structure) {
                    return this.transfer(structure, RESOURCE_ENERGY);
                }
            }
            break;
            
        case 'upgradeController()':
            if (this.room.controller) {
                return this.upgradeController(this.room.controller);
            }
            break;
            
        default:
            console.log(`Unknown action: ${action} for creep ${this.name}`);
            return ERR_INVALID_ARGS;
    }
    
    return ERR_INVALID_TARGET;
};