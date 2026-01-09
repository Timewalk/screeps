const utils = {};

utils.refreshCache = function() {
    // Clear and rebuild cache every tick
    global.cache = {
        structures: {},
        sources: {},
        sites: {},
        dropped: {}
    };
    
    // Cache all room objects
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        
        // Cache room structures
        let structures = room.find(FIND_STRUCTURES);
        for (let structure of structures) {
            global.cache.structures[structure.id] = structure;
        }
        
        // Cache room sources
        let sources = room.find(FIND_SOURCES);
        for (let source of sources) {
            global.cache.sources[source.id] = source;
        }
        
        // Cache construction sites
        let sites = room.find(FIND_CONSTRUCTION_SITES);
        for (let site of sites) {
            global.cache.sites[site.id] = site;
        }
        
        // Cache dropped resources
        let dropped = room.find(FIND_DROPPED_RESOURCES);
        for (let resource of dropped) {
            global.cache.dropped[resource.id] = resource;
        }
    }
};

utils.getCacheObject = function(type, conf) {
    for (let id in global.cache[type]) {
        let obj = global.cache[type][id];
        if (obj.room.name === conf.roomName &&
            obj.pos.x === conf.x &&
            obj.pos.y === conf.y) {
            return obj;
        }
    }
    return null;
};

utils.getObjectById = function(id) {
    return global.cache.structures[id] || 
           global.cache.sources[id] || 
           global.cache.sites[id] || 
           global.cache.dropped[id] ||
           Game.getObjectById(id);
};

utils.getStructureAt = function(conf) {
    return utils.getCacheObject('structures', conf);
};

utils.getSourceAt = function(conf) {
    return utils.getCacheObject('sources', conf);
};

utils.getSiteAt = function(conf) {
    return utils.getCacheObject('sites', conf);
};

utils.getDroppedAt = function(conf, resourceType = RESOURCE_ENERGY) {
    for (let id in global.cache.dropped) {
        let obj = global.cache.dropped[id];
        if (obj.resourceType === resourceType && 
            obj.room.name === conf.roomName && 
            obj.pos.x === conf.x && 
            obj.pos.y === conf.y) {
            return obj;
        }
    }
    return null;
}

utils.getAllDamagedStructures = function(roomName, threshold = 0.8) {
    let damagedStructures = [];
    for (let id in global.cache.structures) {
        let structure = global.cache.structures[id];
        if (structure.room.name === roomName && 
            structure.hits < structure.hitsMax * threshold) {
            damagedStructures.push(structure);
        }
    }
    return damagedStructures;
};

utils.toRoomPosition = function(conf) {
    return new RoomPosition(conf.x, conf.y, conf.roomName);
};


utils.buildStructures = function(roomArray) {
    for (let conf of roomArray) {
        let room = Game.rooms[conf.roomName];
        let RCL = room ? room.controller.level : 0;
        if (!room || conf.rcl > RCL || conf.type === 'source') continue;
        
        // Check if structure already exists
        let existing = utils.getStructureAt(conf);
        let existingSite = utils.getSiteAt(conf);
        
        if (!existing && !existingSite) {
            let pos = utils.toRoomPosition(conf);
            room.createConstructionSite(pos, conf.type);
        }
    }
};

utils.buildStructuresForRoom = function(roomName, roomConfig) {
    let room = Game.rooms[roomName];
    if (!room || !room.controller) return;
    
    let currentRCL = room.controller.level;
    
    // Build structures for each type, respecting RCL limits
    for (let structureType in roomConfig.structures) {
        let positions = roomConfig.structures[structureType];
        
        // Check if we can build this structure type at current RCL
        if (!CONTROLLER_STRUCTURES[structureType] || 
            !CONTROLLER_STRUCTURES[structureType][currentRCL]) {
            continue;
        }
        
        let maxAllowed = CONTROLLER_STRUCTURES[structureType][currentRCL];
        let existingCount = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === structureType
        }).length;
        let siteCount = room.find(FIND_CONSTRUCTION_SITES, {
            filter: s => s.structureType === structureType
        }).length;
        
        let totalCount = existingCount + siteCount;
        
        for (let posData of positions) {
            // Only build if room RCL is >= structure's required RCL
            if (currentRCL >= posData.rcl && totalCount < maxAllowed) {
                let pos = new RoomPosition(posData.x, posData.y, roomName);
                
                // Check if structure already exists
                let existingStructure = utils.getStructureAt(structureType, [roomName, posData.x, posData.y]);
                let existingSite = utils.getSiteAt([roomName, posData.x, posData.y]);
                
                if (!existingStructure && !existingSite) {
                    room.createConstructionSite(pos, structureType);
                    totalCount++;
                }
            }
        }
    }
};

module.exports = utils;
