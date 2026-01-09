# ClaudeBot

Room E48S56 on shard3.

## Deploy
```bash
grunt --branch=E48S56_1    # deploy to current branch
grunt --branch=default     # deploy to different branch
```

## Design Philosophy

**"Efficiency through simplicity"**

Trade operational efficiency for logical consistency and structural predictability. A "dumb" factory that runs without thinking beats a "smart" system with complex decision logic. Minimize CPU cost by eliminating pathfinding, searching, and conditional logic at runtime.

## Creep Design: Rails System

Creeps run on **hardcoded rails** - explicit scripts that define exactly what happens on every tile, every tick. Zero runtime decisions.

### Module Structure

Each creep type is its own module with:
- `conf` - configuration (name, body, spawn settings, target IDs)
- `routine` - array of positions/directions/actions
- `actions` - module-specific methods with conditions baked in
- `spawn()` - spawning logic
- `run()` - main loop

```javascript
// Example: hugo.js
const conf = {
    name: 'Hugo',
    idealBody: [WORK, MOVE, WORK, WORK, WORK, WORK],
    minEnergy: 250,
    spawn: 'Spawn1',
    spawnDirection: RIGHT,
    sourceId: '5bbcafe99099fc012e63b601',
};

const routine = [
    { pos: { x: 15, y: 15 }, dir: BOTTOM },
    { pos: { x: 15, y: 16 }, dir: RIGHT },
    // ... more steps
    { pos: { x: 26, y: 9 }, dir: null, actions: ['harvest'] },
];

const actions = {
    harvest(creep) {
        return creep.harvest(Game.getObjectById(conf.sourceId));
    }
};
```

### Naming Convention

Creeps get **creative names** starting with their role letter:
- **S** - Spawn harvesters (Sam) - feed the spawn directly
- **H** - Harvesters (Hugo, Hank) - pure harvesters at sources
- **T** - Transporters/Haulers (Tucker) - move energy around
- **U** - Upgraders - upgrade controller
- **B** - Builders - build construction sites

### Body Scaling

Bodies scale to room energy capacity using `buildBody()` from `util.js`:

```javascript
const { buildBody } = require('util');

// Ideal body in PRIORITY ORDER - essential parts first
const idealBody = [WORK, MOVE, WORK, WORK, WORK, WORK];

// Build what we can afford
const body = buildBody(idealBody, room.energyCapacityAvailable);
// With 300 energy: [WORK, MOVE, WORK] (250 cost)
// With 550 energy: [WORK, MOVE, WORK, WORK, WORK, WORK] (full)
```

Each creep defines `minEnergy` - don't spawn if room has less (e.g., 250 for a useful harvester with 2 WORK).

### Routine Structure

```javascript
routine = [
  {
    pos: {x, y},           // tile position
    dir: DIRECTION,        // direction to move to NEXT tile (null if destination)
    actions: ['action1', 'action2']  // action method names (only on destination tiles)
  },
]
```

Actions are string names that map to methods in the module's `actions` object. Conditions are baked into each method:

```javascript
const actions = {
    harvest(creep) {
        if (!creep.notFull) return;  // condition baked in
        return creep.harvest(Game.getObjectById(conf.sourceId));
    },
    transfer(creep) {
        if (!creep.isFull) return;
        return creep.transfer(Game.getObjectById(conf.spawnId), RESOURCE_ENERGY);
    },
    drop(creep) {
        if (!creep.isFull) return;
        return creep.drop(RESOURCE_ENERGY);
    }
};
```

### Prototype Extensions

Custom properties on `Creep.prototype` (defined in `prototypes.js`):
- `creep.isFull` - no free capacity
- `creep.isEmpty` - zero energy
- `creep.notFull` - has free capacity
- `creep.notEmpty` - has some energy
- `creep.energyRatio` - percentage full (0 to 1)

### Execution Logic

Each tick:
1. **Verify position** - Am I at `routine[step].pos`?
   - **NO** → Move failed last tick. Decrement step.
2. **Execute actions** - Try each action method until one returns OK
3. **Check fatigue** - Skip movement if fatigued (but actions still run!)
4. **Move** in `routine[step].dir` direction
5. **Increment step** (optimistic)

### Spawn Conventions

- `spawnDirection` - spawn creeps away from traffic paths
- Check `room.energyAvailable >= conf.minEnergy` before spawning
- Use `room.energyCapacityAvailable` for body scaling (not current energy)

### Memory

Creep only stores one integer:
```javascript
creep.memory.step = 0  // current routine index
```

## Room Layout: E48S56

```
Spawn: (14, 15)
West Source: (13, 16) - Sam harvests from (13, 15)
East Source: (27, 8) - Hugo harvests from (26, 9)
Controller: (27, 5)
```

## Tools

- `tools/room_render.py` - Render room terrain and structures
  ```bash
  python tools/room_render.py E48S56 --json docs/E48S56_room.json --fetch --save room.png
  ```
  - `--fetch` pulls live objects (roads, creeps, construction sites) from API
  - `--json` overlays structures from local JSON file

- `docs/E48S56_room.json` - Room data (terrain, structures, planned routes)

## Files

- `src/main.js` - Main loop, loads all creep modules
- `src/prototypes.js` - Creep prototype extensions
- `src/util.js` - Utilities (buildBody)
- `src/sam.js` - Spawn harvester
- `src/hugo.js` - East source harvester
