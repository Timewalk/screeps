const util = require('util');

conf = {};

conf.creeps = [
    { 
        name: 'bob', 
        spawn: 'Spawn1',
        body: {
            pattern: [WORK, WORK, MOVE],
            max: 3
        },
        instructions: [
            {'moveTo()': ['sim', 34, 21]},
            {'harvest()': ['sim', 35, 20]}
        ]
    }
];

module.exports = conf;