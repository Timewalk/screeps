require('prototypes');  // Load prototype extensions first
const Sam = require('sam');
const Hugo = require('hugo');
const Tucker = require('tucker');
const Travis = require('travis');
const Uma = require('uma');
const Bob = require('bob');

module.exports.loop = function() {
    // Clean up dead creep memory
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Cleared memory for dead creep:', name);
        }
    }

    Sam.run();
    Hugo.run();
    Tucker.run();
    Travis.run();
    Uma.run();
    Bob.run();  // Builder - only spawns if construction sites exist
};
