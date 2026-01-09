// Creep configurations for S3E49S8

module.exports = [
    {
        name: 'Hugo',
        role: 'harvester',
        body: [WORK, WORK, MOVE],
        spawn: 'Spawn1',
        spawnDirection: 3,  // RIGHT
        route: [3, 4],      // right, then bottom-right to parking
        park: { x: 41, y: 35 },
        source: { room: 'E49S8', source: 1 },  // south source (40, 36)
    },
];
