// Screeps Console PathFinder Script
// Edit START and END, then paste into game console

// === CONFIGURE THESE ===
const ROOM = 'E49S55';
const START = { x: 38, y: 34 };  // spawn position
const END = { x: 37, y: 12 };    // north source
const RANGE = 1;                  // how close to get (1 = adjacent)

// === RUN ===
const from = new RoomPosition(START.x, START.y, ROOM); const to = new RoomPosition(END.x, END.y, ROOM); const result = PathFinder.search(from, { pos: to, range: RANGE }); JSON.stringify(result.path.map(p => ({ x: p.x, y: p.y })));
