const utils = require('utils');

function validateTarget(self) {
    const t = self.target;
    const isValid =
        t &&
        (t instanceof ConstructionSite || (t instanceof Structure && t.hits < t.hitsMax)) &&
        self.pos.inRangeTo(t, 3);

    if (!isValid) self.target = null;
}

function acquireTarget(self) {
    const targets = self.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
    if (targets.length > 0) {
        self.target = targets[0];
        return;
    }

    const structures = self.pos.findInRange(FIND_STRUCTURES, 3);
    for (let i = 0; i < structures.length; i++) {
        const s = structures[i];
        if (s.hits < s.hitsMax) {
            self.target = s;
            return;
        }
    }
}

function isValidPosition(self, conf) {
    const { x, y, roomName } = self.pos;
    const r = self.room.name;

    for (let i = 0; i < conf.blockTiles.length; i++) {
        const tile = conf.blockTiles[i];
        if (tile.x === x && tile.y === y && tile.r === r) {
            return false;
        }
    }

    return true;
}

function update(self, conf) {
    const hasEnergy = self.store.getUsedCapacity(RESOURCE_ENERGY) > 0;

    validateTarget(self);

    if (!self.target) {
        acquireTarget(self);
    }

    // Build or repair if target is valid and has energy
    if (self.target && hasEnergy) {
        if (self.target instanceof ConstructionSite) {
            self.build(self.target);
        } else if (self.target instanceof Structure) {
            self.repair(self.target);
        }
    }

    // Move only if fatigued check passes
    if ((!self.target || !isValidPosition(self, conf)) && self.fatigue === 0) {
        self.moveOnRails(conf.route);
    }
}

module.exports = { update };
