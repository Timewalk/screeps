StructureSpawn.prototype.buildBody = function(bodyPattern, maxRepeats) {
    if (!bodyPattern) return [];
    
    let availableEnergy = this.room.energyCapacityAvailable;
    
    // Calculate cost of one pattern
    let patternCost = bodyPattern.reduce((cost, part) => {
        return cost + BODYPART_COST[part];
    }, 0);
    
    // Calculate how many times we can repeat this pattern
    let affordableRepeats = Math.floor(availableEnergy / patternCost);
    let actualRepeats = Math.min(affordableRepeats, maxRepeats);
    
    // Build the body by repeating the pattern
    let finalBody = [];
    for (let i = 0; i < actualRepeats; i++) {
        finalBody = finalBody.concat(bodyPattern);
    }
    
    return finalBody;
};

StructureSpawn.prototype.spawnCreepFromConfig = function(creepConfig) {
    let body = this.buildBody(creepConfig.body.pattern, creepConfig.body.max);
    let memory = {
        instructions: creepConfig.instructions || []
    };
    
    return this.spawnCreep(body, creepConfig.name, { memory: memory });
};