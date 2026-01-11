/**
 * Main Loop
 */

const ColonyManager = require('manager.colony');

module.exports.loop = function() {
    // Clean dead creep memory
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    const colony = new ColonyManager();
    colony.run();
};
