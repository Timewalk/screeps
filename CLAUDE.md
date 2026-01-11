# ClaudeBot

Room E42S48 on shard3.

## Deploy
```bash
grunt --branch=world    # deploy to live server
```

## Design Philosophy

**Colony-Centric, Not Room-Centric**

The colony is the unit of organization, not the room. A source is a source regardless of which room it's in. "Remote" and "local" are not categories - distance is a parameter that affects body composition and logistics, not fundamentally different roles.

**Current State:** Room-centric with `role.remoteHarvester.js` as a special case.

**Target State:** Unified roles that work on any source, anywhere. Configuration lists sources by ID, not by room.

### Design Principles

1. **No "remote" vs "local" distinction** - distance is a number, not a type
2. **Sources drive behavior** - each source needs a harvester, maybe a hauler
3. **Controllers drive behavior** - each controller needs upgraders
4. **Spawns are shared resources** - SpawnManager prioritizes across all needs
5. **Keep it simple** - functions and data, minimize OOP

### Planned Architecture

```
config.js           ← source IDs, controller IDs (no room distinctions)
manager.source.js   ← iterates sources, requests creeps based on need
manager.spawn.js    ← priority queue, finds available spawn
role.harvester.js   ← works on ANY source (travels if needed)
role.hauler.js      ← works on ANY source→destination route
role.upgrader.js    ← works on ANY controller
role.builder.js     ← works on ANY construction site
```

---

**Legacy Pattern (being phased out)**

Static harvesters + haulers + role-based creeps with room-centric assumptions.

## Architecture

### Roles

| Role | File | Purpose | Status |
|------|------|---------|--------|
| harvester | role.harvester.js | Static miner - walks to source, parks, harvests forever | Refactor to handle any source |
| hauler | role.hauler.js | Picks up energy, delivers to spawn/extensions/towers | Refactor to handle any route |
| upgrader | role.upgrader.js | Gets energy, upgrades controller | OK |
| builder | role.builder.js | Gets energy, builds sites (or repairs/upgrades as fallback) | OK |
| remoteHarvester | role.remoteHarvester.js | Harvester for non-owned rooms | **DEPRECATED** - merge into harvester |
| remoteHauler | role.remoteHauler.js | Hauler for non-owned rooms | **DEPRECATED** - merge into hauler |

### Key Files

- `main.js` - Main loop, runs spawn manager and all creep roles
- `config.js` - Colony configuration (sources, controllers) **NEW**
- `spawn.js` - Population management, spawns creeps based on need
- `prototypes.js` - Creep prototype extensions (isFull, isEmpty, etc.)
- `util.js` - Utilities (buildBody)

### Creep Behavior

**Harvesters** (static miners):
1. Walk to assigned source (uses `moveTo` once)
2. Set `memory.inPosition = true`
3. Harvest forever (no more pathfinding)

**Haulers/Upgraders/Builders**:
1. State machine: collecting vs delivering/working
2. Find closest target using `findClosestByPath`
3. Use `moveTo` with `reusePath: 20-50` for efficiency

### Prototype Extensions

```javascript
creep.isFull     // no free capacity
creep.isEmpty    // zero energy
creep.notFull    // has free capacity
creep.notEmpty   // has some energy
creep.energyRatio // percentage full (0 to 1)
```

### Body Scaling

Bodies scale to room energy using `buildBody()`:

```javascript
const { buildBody } = require('util');
const body = buildBody(idealBody, room.energyCapacityAvailable);
```

### Spawn Priority

1. Harvesters (need energy income)
2. Haulers (move energy to spawn)
3. Upgraders (level up)
4. Builders (only if construction sites exist)

### Population Targets

Configured in `spawn.js`:
- 2 harvesters (one per source)
- 2 haulers
- 2 upgraders
- 1 builder (when needed)

## Room Layout: E42S48

```
Spawn: (25, 18)
Source 1: (24, 13)  ← sources are adjacent!
Source 2: (25, 13)
Controller: (19, 27)
Mineral: (6, 9) - Hydrogen
```

## Source Registry

All sources managed by the colony. Defined in `config.js`.

| Room | Source ID | Position | Notes |
|------|-----------|----------|-------|
| E42S48 | `5bbcaf7b9099fc012e63aa73` | (24, 13) | Adjacent to other source |
| E42S48 | `5bbcaf7b9099fc012e63aa72` | (25, 13) | Adjacent to other source |
| E42S47 | `5bbcaf7b9099fc012e63aa74` | (22, 28) | Near south edge |

### Future Sources

| Room | Position | Notes |
|------|----------|-------|
| E43S48 | (5, 15) | Near west edge |
| E42S49 | (31, 16) | |
| E41S48 | (41, 4) | Corner |

## Tools

- `tools/room_render.py` - Render room terrain and structures
  ```bash
  python tools/room_render.py E42S48 --json docs/E42S48_room.json --fetch --save room.png
  ```

- `tools/economy_calc.py` - Economy calculator (production vs consumption)
  ```bash
  python tools/economy_calc.py E42S48           # summary view
  python tools/economy_calc.py E42S48 -v        # verbose (per-creep details)
  ```
  Shows: energy allocation, spawn overhead, structure maintenance, upgrader utilization
