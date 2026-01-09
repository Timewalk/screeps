// Room configuration for S3E49S8

module.exports = {
    name: 'E49S8',
    shard: 'shard3',

    spawn: { x: 38, y: 34, name: 'Spawn1' },

    sources: [
        { x: 37, y: 12, id: '5bbcaffd9099fc012e63b77e' },  // north
        { x: 40, y: 36, id: '5bbcaffd9099fc012e63b77f' },  // south (near spawn)
    ],

    controller: { x: 43, y: 42, id: '5bbcaffd9099fc012e63b780' },

    mineral: { x: 27, y: 22, id: '5bbcb6b6d867df5e54207af4', type: RESOURCE_OXYGEN },
};
