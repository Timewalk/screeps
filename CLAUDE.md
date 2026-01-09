# ClaudeBotOld (alpha3)

Reference implementation - the original working bot.

## Files
- `main.js` - Main loop, spawn management
- `conf.creeps.js` - Creep configs (Hiccup, Toothless, Harvey, Thor, Bob, Tempest, Ultron, Ulysses, Tonia)
- `role.builder.js` - Builder role logic
- `role.hauler.js` - Hauler role logic
- `spawn.js` - Spawn prototype extensions
- `utils.js` - Utility functions (clearDeadCreeps, buildBody)

## Key Patterns
- Config-driven creep spawning via `conf.creeps.js`
- `creep.update(conf)` pattern for running creep logic
- `spawn.ready` / `spawn.softSpawning` for spawn management
- Dynamic body building based on available energy
