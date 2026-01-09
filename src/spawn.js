Object.defineProperty(StructureSpawn.prototype, 'softSpawning', {
    configurable: true,
    enumerable: false,
    get: function () {
        return this.memory.softSpawning || false;
    },
    set: function (value) {
        this.memory.softSpawning = value;
    }
});


Object.defineProperty(StructureSpawn.prototype, 'cooldownRemaining', {
    configurable: true,
    enumerable: false,
    get: function () {
        if (!this.memory.cooldownUntil) return 0;
        return Math.max(0, this.memory.cooldownUntil - Game.time);
    }
});

Object.defineProperty(StructureSpawn.prototype, 'ready', {
    configurable: true,
    enumerable: false,
    get: function () {
        const room = this.room;
        return !this.spawning && 
            !this.softSpawning &&
            this.cooldownRemaining === 0 &&
            room.energyAvailable >= 300
    }
});


if (!StructureSpawn.prototype._spawnCreep) {
    StructureSpawn.prototype._spawnCreep = StructureSpawn.prototype.spawnCreep;
    
    StructureSpawn.prototype.spawnCreep = function (body, name, opts) {
        const res = this._spawnCreep(body, name, opts);
        if (res === OK) {
            this.softSpawning = true;
            // Set cooldown of 20 ticks after successful spawn
            this.memory.cooldownUntil = Game.time + 40;
        }
        return res;
    }
}
    

module.exports = {};
