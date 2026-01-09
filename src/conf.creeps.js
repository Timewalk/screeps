module.exports = [
    {
        name: 'Dave',
        role: 'hauler',
        spawn: 'Spawn1',
        pickup: 'Flag2',
        transfer: ['68711dc1e8f97e001249bcde'],
        dropoff: null,
        parking: 'parking',
        body: [MOVE, CARRY, CARRY],
        rcl: 1,
        gcl: 0
    },
    {
        name: 'Henry',
        role: 'harvester',
        spawn: 'Spawn1',
        sourceId: '5bbcb00b9099fc012e63b831',
        parking: 'Flag1',
        body: [MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK],
        rcl: 1,
        gcl: 0
    },
    {
        name: 'Tom',
        role: 'hauler',
        spawn: 'Spawn1',
        pickup: 'Flag1',
        withdraw: null,
        transfer: [],
        dropoff: 'Flag2',
        parking: null,
        body: [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY],
        rcl: 1,
        gcl: 0
    },
    {
        name: 'Harold',
        role: 'harvester',
        spawn: 'Spawn1',
        sourceId: '5bbcb00b9099fc012e63b832',
        parking: 'Flag3',
        body: [MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK],
        rcl: 1,
        gcl: 0
    },
    {
        name: 'Ted',
        role: 'hauler',
        spawn: 'Spawn1',
        pickup: 'Flag3',
        withdraw: null,
        transfer: [],
        dropoff: 'Flag2',
        parking: null,
        body: [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY],
        rcl: 1,
        gcl: 0
    },
    {
        name: 'Walter',
        role: 'worker',
        spawn: 'Spawn1',
        pickup: 'Flag2',
        withdraw: '687189dde1144e7b2c6574bb',
        parking: 'walter',
        controller: '5bbcb00b9099fc012e63b830',
        body: [MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY],
        rcl: 1,
        gcl: 0
    },
    {
        name: 'Wesley',
        role: 'worker',
        spawn: 'Spawn1',
        pickup: 'Flag2',
        withdraw: '687189dde1144e7b2c6574bb',
        parking: 'wesley',
        controller: '5bbcb00b9099fc012e63b830',
        body: [MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY],
        rcl: 1,
        gcl: 0
    },
];
