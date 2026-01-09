/**
 * Prototype Extensions
 * Adds custom properties to game objects.
 */

// Creep.isFull - no free capacity
Object.defineProperty(Creep.prototype, 'isFull', {
    get: function() {
        return this.store.getFreeCapacity() === 0;
    },
    enumerable: false,
    configurable: true
});

// Creep.isEmpty - zero energy
Object.defineProperty(Creep.prototype, 'isEmpty', {
    get: function() {
        return this.store[RESOURCE_ENERGY] === 0;
    },
    enumerable: false,
    configurable: true
});

// Creep.notFull - has free capacity
Object.defineProperty(Creep.prototype, 'notFull', {
    get: function() {
        return this.store.getFreeCapacity() > 0;
    },
    enumerable: false,
    configurable: true
});

// Creep.notEmpty - has some energy
Object.defineProperty(Creep.prototype, 'notEmpty', {
    get: function() {
        return this.store[RESOURCE_ENERGY] > 0;
    },
    enumerable: false,
    configurable: true
});

// Creep.energyRatio - percentage full (0 to 1)
Object.defineProperty(Creep.prototype, 'energyRatio', {
    get: function() {
        const capacity = this.store.getCapacity();
        if (capacity === 0) return 0;
        return this.store[RESOURCE_ENERGY] / capacity;
    },
    enumerable: false,
    configurable: true
});

module.exports = {};
