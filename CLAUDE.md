# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Screeps AI bot repository located in the Screeps client's scripts directory. Screeps is a MMO RTS game for programmers where you control your colony by writing JavaScript code.

## Architecture

- **main.js**: Entry point for the Screeps AI bot (currently empty)
- This appears to be a fresh Screeps bot project named "claude_bot2"

## Development Context

- **Platform**: Screeps game environment
- **Language**: JavaScript (ES6+ supported by Screeps engine)
- **Execution**: Code runs in the Screeps game world, managing creeps (units), rooms, and resources
- **File Structure**: Screeps uses a flat file structure where all .js files are automatically loaded

## Design Approach

This bot uses a **completely config-based approach** for creep behavior. Creeps are controlled through instruction arrays rather than hardcoded logic.

### Instruction Format
```javascript
creep.instructions = [
    {'moveTo()', ['sim', 20, 21]},
    {'harvest()', 'source', ['sim', 21, 21]}
]
```

This allows for:
- Dynamic behavior modification without code changes
- Easy AI configuration through data structures
- Separation of logic from behavior definitions

## Screeps-Specific Notes

- The main.js file serves as the entry point and is executed every game tick
- Screeps provides global objects like Game, Memory, and console for interacting with the game world
- Code is deployed directly to the Screeps servers via the client or API
- No traditional build process - JavaScript files are uploaded directly to the game

## Common Development Pattern

Since this is a Screeps bot, development typically involves:
1. Writing AI logic in main.js or additional modules
2. Testing in the Screeps simulation environment
3. Deploying to live servers through the Screeps client

## Memory and Performance

- Screeps has CPU limits per tick, so code efficiency is crucial
- Use Memory object for persistent data between ticks
- Avoid expensive operations in tight loops