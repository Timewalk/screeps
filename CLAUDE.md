# Screeps AI Bot

## Overview
Configuration-driven Screeps AI bot with CPU-efficient caching system.

## Architecture
- **main.js**: Main game loop with spawn management
- **conf.js**: Pure data configuration for creeps, spawns, and roles
- **utils.js**: Utility functions for caching and body calculations

## Key Features
- Global object caching system for CPU efficiency
- Dynamic body scaling based on room energy capacity
- Position-based configuration using [room, x, y] arrays
- Configuration-driven creep spawning

## Files
- `main.js` - Main loop, spawn iteration, creep spawning
- `conf.js` - Creep configurations (name, role, spawn location, source, parking, bodyTemplate)
- `utils.js` - Cache management, object lookups, body calculations

## Current Creeps
- **Henry**: Harvester at spawn [sim, 22, 24], source [sim, 35, 20], parking [sim, 34, 21]

## System Design Specifications

### UNIX Design Principles
- **Do One Thing Well**: Each function has a single, clear purpose
- **Fail Fast**: No defensive programming - expect correct input, fail immediately on bad data
- **Small and Simple**: Minimal, focused modules that compose together
- **Trust the Configuration**: `conf.js` parameters assumed to be correct and well-formed

### Data Validation Strategy
- **Trust Internal Data**: Configuration data assumed valid, no safety checks
- **Validate External Data**: Game objects validated before function calls
- **Fail Loudly**: Let errors bubble up rather than masking them
- **Caller Responsibility**: Functions expect valid input, callers must validate Game data

### Tool Philosophy
- **Functions Are Tools**: Like a hammer, functions should work when used correctly
- **No Defensive Programming**: Don't wrap functions in validation layers and safety checks
- **Sharp Tools**: Fast, predictable behavior when used properly - crashes are user error
- **Single Validation Point**: Validate once at the boundary, not scattered throughout
- **Trust the User**: Don't protect users from themselves with "helpful" safeguards
- **Keep Functions Pure**: Focus on core purpose, not input sanitization