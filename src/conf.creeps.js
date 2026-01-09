const creeps = {};

const haulers = {
    route: [
        {c: 0, x:  6, y: 13, d: 8},
        {c: 8, x:  5, y: 12, d: 1},
        {c: 1, x:  5, y: 10, d: 3},
        {c: 3, x: 14, y: 10, d: 4},
        {c: 4, x: 37, y: 33, d: 3},
        {c: 3, x: 39, y: 33, d: 6},
        {c: 6, x: 31, y: 41, d: 1},
        {c: 1, x: 31, y: 29, d: 8},
        {c: 8, x: 17, y: 15, d: 7},
        {c: 7, x:  5, y: 15, d: 1},
    ],
    body: [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY],
    pickups: [
        {x: 40, y: 34, r: 'W6N1', t: RESOURCE_ENERGY},
        {x: 31, y: 42, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
    transfers: [
        {x:  4, y: 14, r: 'W6N1', t: RESOURCE_ENERGY, i: '6879ecb39bafec0064d1df01'},
        {x:  4, y: 15, r: 'W6N1', t: RESOURCE_ENERGY, i: '687a553047f0a40065454286'},
        {x:  5, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, i: '687a5738664c6e00587e29eb'},
        {x:  6, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, i: '687a581faaf5c60062f3c8db'},
        {x:  7, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, i: '687a67d7e6645e0041605657'},
        {x:  9, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, i: '687a6a210c5c1500c638b890'},
        {x: 10, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, i: '687a6c78f60b19003b57f7dd'},
        {x: 11, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, },
        {x: 12, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, },
        {x: 13, y: 16, r: 'W6N1', t: RESOURCE_ENERGY, },
        {x:  6, y: 14, r: 'W6N1', t: RESOURCE_ENERGY, i: '6879afbe35ff6d00b629d419'},
    ],
    dropoffs: [
    ],
};
creeps['Hiccup'] = {
    name: 'Hiccup',
    body: [MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK],
    role: 'harvester',
    spawn: 'Spawn1',
    spawnDirections: [3],
    target: '87e60773144aa25',
    route: [
        {c: 0, x: 34, y: 33, d: 4},
        {c: 4, x: 35, y: 34, d: 3},
        {c: 3, x: 40, y: 34, d: 99},
    ],
};

creeps['Harvey'] = {
    name: 'Harvey',
    body: [MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK],
    role: 'harvester',
    spawn: 'Spawn1',
    spawnDirections: [7],
    target: 'd05c07731440e6d',
    route: [
        {c: 0, x: 32, y: 33, d: 6},
        {c: 6, x: 31, y: 34, d: 5},
        {c: 5, x: 31, y: 42, d: 99},
    ]
};

creeps['Toothless'] = {
    name: 'Toothless',
    body: haulers.body,
    role: 'hauler',
    spawn: 'Spawn1',
    spawnDirections: [3],
    route: [
        {c: 0, x: 34, y: 33, d: 4},
        {c: 4, x: 35, y: 34, d: 3},
        {c: 3, x: 39, y: 34, d: 7},
        {c: 7, x: 35, y: 34, d: 8},
        {c: 8, x: 33, y: 32, d: 4},
    ],
    pickups: [
        {x: 40, y: 34, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
    transfers: [
        {x: 33, y: 33, r: 'W6N1', t: RESOURCE_ENERGY, i: '687e5d55dca819005243ef0e'},
        {x: 36, y: 33, r: 'W6N1', t: RESOURCE_ENERGY, i: '688651ffa8e45d00557b6b0b'},
    ],
    dropoffs: [
        {x: 33, y: 32, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
};

creeps['Thor'] = {
    name: 'Thor',
    body: haulers.body,
    role: 'hauler',
    spawn: 'Spawn1',
    spawnDirections: [7],
    route: [
        {c: 0, x: 32, y: 33, d: 6},
        {c: 6, x: 31, y: 34, d: 5},
        {c: 5, x: 31, y: 41, d: 1},
        {c: 1, x: 31, y: 34, d: 2},
        {c: 2, x: 33, y: 32, d: 6},
    ],
    pickups: [
        {x: 31, y: 42, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
    transfers: [
        {x: 33, y: 33, r: 'W6N1', t: RESOURCE_ENERGY, i: '687e5d55dca819005243ef0e'},
        {x: 30, y: 39, r: 'W6N1', t: RESOURCE_ENERGY, i: '6886451569e0e300603c08c5'},
        {x: 30, y: 40, r: 'W6N1', t: RESOURCE_ENERGY, i: '6886490b5c12a30051db86fa'},
    ],
    dropoffs: [
        {x: 33, y: 32, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
};

creeps['Tempest'] = {
    name: 'Tempest',
    body: haulers.body,
    role: 'hauler',
    spawn: 'Spawn1',
    spawnDirections: [1],
    route: [
        {c: 0, x: 33, y: 32, d: 1},
        {c: 1, x: 33, y: 31, d: 8},
        {c: 8, x:  9, y:  7, d: 4},
        {c: 4, x: 33, y: 31, d: 5},
        {c: 5, x: 33, y: 32, d: 1},
    ],
    pickups: [
        {x: 33, y: 32, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
    transfers: [

    ],
    dropoffs: [
        {x:  9, y:  7, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
};

creeps['Tonia'] = {
    name: 'Tonia',
    body: haulers.body,
    role: 'hauler',
    spawn: 'Spawn1',
    spawnDirections: [1],
    route: [
        {c: 0, x: 33, y: 32, d: 1},
        {c: 1, x: 33, y: 31, d: 8},
        {c: 8, x:  9, y:  7, d: 4},
        {c: 4, x: 33, y: 31, d: 5},
        {c: 5, x: 33, y: 32, d: 1},
    ],
    pickups: [
        {x: 33, y: 32, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
    transfers: [

    ],
    dropoffs: [
        {x:  9, y:  7, r: 'W6N1', t: RESOURCE_ENERGY},
    ],
};

creeps['Ultron'] = {
    name: 'Ultron',
    role: 'upgrader',
    body: [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK],
    spawn: 'Spawn1',
    spawnDirections: [8],
    target: 'cf030773144fccf',
    pickup: {x: 9, y: 7, r: 'W6N1', t: RESOURCE_ENERGY},
    route: [
        {c: 0, x: 32, y: 32, d: 8},
        {c: 8, x:  9, y:  9, d: 1},
        {c: 1, x:  9, y:  6, d: 99},
    ],
};

creeps['Ulysses'] = {
    name: 'Ulysses',
    role: 'upgrader',
    body: [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK],
    spawn: 'Spawn1',
    spawnDirections: [8],
    target: 'cf030773144fccf',
    pickup: {x: 9, y: 7, r: 'W6N1', t: RESOURCE_ENERGY},
    route: [
        {c: 0, x: 32, y: 32, d: 8},
        {c: 8, x:  9, y:  9, d: 1},
        {c: 1, x:  9, y:  7, d: 8},
        {c: 8, x:  8, y:  6, d: 99},
    ],
};

creeps['Umbra'] = {
    name: 'Umbra',
    body: [MOVE, CARRY, WORK, CARRY, WORK, CARRY, WORK, CARRY, WORK, CARRY, WORK],
    role: 'upgrader',
    spawn: 'Spawn1',
    target: 'cf030773144fccf',
    pickup: {x: 6, y: 10, r: 'W6N1', t: RESOURCE_ENERGY},
    route: [
        {c: 0, x:  6, y: 13, d: 1},
        {c: 1, x:  6, y:  9, d: 99},
    ],
};

creeps['Bob'] = {
    name: 'Bob',
    body: [MOVE, CARRY, WORK, CARRY, WORK, MOVE, CARRY, WORK, CARRY, WORK],
    role: 'builder',
    spawn: 'Spawn1',
    spawnDirections: [8],
    blockTiles: [
        {x: 31, y: 34, r: 'W6N1'},
        {x: 32, y: 33, r: 'W6N1'},
        {x: 32, y: 32, r: 'W6N1'},
        {x: 33, y: 35, r: 'W6N1'},
    ],
    route: [
        {c: 0, x: 32, y: 32, d: 5},
        {c: 5, x: 32, y: 40, d: 1},
        {c: 1, x: 32, y: 35, d: 3},
        {c: 3, x: 38, y: 35, d: 7},
        {c: 7, x: 32, y: 35, d: 1},
        {c: 1, x: 32, y: 31, d: 8},
        {c: 8, x: 10, y:  9, d: 4},
        {c: 4, x: 32, y: 31, d: 5},
    ],
};

module.exports = creeps;
