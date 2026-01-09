const Hugo = require('hugo');
const Tucker = require('tucker');
const Hank = require('hank');
const Tina = require('tina');
const Uma = require('uma');

module.exports.loop = function() {
    Hugo.run();
    Tucker.run();
    Hank.run();
    Tina.run();
    Uma.run();
}
