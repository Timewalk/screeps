module.exports = {
    cacheAllRooms: function() {
        // Clear cache every tick
        global.cache = {};
        
        // Cache entire room lookAtArea data for all visible rooms
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            
            // Cache full room scan (0,0 to 49,49) as array
            global.cache[roomName] = room.lookAtArea(0, 0, 49, 49, true);
        }
    },
    
    getObjectAt: function([roomName, x, y], type) {
        if (!global.cache[roomName]) return null;
        let items = global.cache[roomName].filter(item => 
            item.x === x && item.y === y && item.type === type
        );
        return items.length > 0 ? items[0] : null;
    },
    
    getStructureAt: function(pos) {
        let obj = this.getObjectAt(pos, 'structure');
        return obj ? obj.structure : null;
    },
    
    getSourceAt: function(pos) {
        let obj = this.getObjectAt(pos, 'source');
        return obj ? obj.source : null;
    },
    
    getSiteAt: function(pos) {
        let obj = this.getObjectAt(pos, 'constructionSite');
        return obj ? obj.constructionSite : null;
    },
    
    getTerrainAt: function(pos) {
        let obj = this.getObjectAt(pos, 'terrain');
        return obj ? obj.terrain : null;
    },
    
    getCreepAt: function(pos) {
        let obj = this.getObjectAt(pos, 'creep');
        return obj ? obj.creep : null;
    },
    
    getResourceAt: function(pos) {
        let obj = this.getObjectAt(pos, 'resource');
        return obj ? obj.resource : null;
    },
    
    getAllAt: function([roomName, x, y]) {
        if (!global.cache[roomName]) return [];
        return global.cache[roomName].filter(item => 
            item.x === x && item.y === y
        );
    },
    
    getAllOfType: function(roomName, type) {
        if (!global.cache[roomName]) return [];
        return global.cache[roomName].filter(item => item.type === type);
    }
};