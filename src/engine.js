/**
 * Rails Engine
 * Executes hardcoded routines for creeps.
 */

// Direction constants (Screeps built-in)
// TOP: 1, TOP_RIGHT: 2, RIGHT: 3, BOTTOM_RIGHT: 4
// BOTTOM: 5, BOTTOM_LEFT: 6, LEFT: 7, TOP_LEFT: 8

/**
 * Evaluate a condition
 * @param {Creep} creep
 * @param {string} condition - condition property name (e.g., 'isFull', 'notEmpty')
 * @returns {boolean}
 */
function checkCondition(creep, condition) {
    if (!condition) return true;  // No condition = always true

    // Check if condition is a creep prototype property
    if (condition in creep) {
        return creep[condition];
    }

    console.log(`${creep.name}: unknown condition '${condition}'`);
    return false;
}

/**
 * Execute a single action
 * @param {Creep} creep
 * @param {string} action - action name
 * @param {string|object} target - target ID or position {x,y}
 * @returns {number} - Screeps result code
 */
function execute(creep, action, target) {
    // Resolve target - could be ID string or position object
    let resolved = target;
    if (typeof target === 'string') {
        resolved = Game.getObjectById(target);
        if (!resolved) {
            console.log(`${creep.name}: target not found: ${target}`);
            return ERR_INVALID_TARGET;
        }
    }

    switch (action) {
        case 'harvest':
            return creep.harvest(resolved);

        case 'transfer':
            return creep.transfer(resolved, RESOURCE_ENERGY);

        case 'pickup':
            // Target is position {x, y} - find resource there
            if (target && target.x !== undefined) {
                const resource = creep.room.lookForAt(LOOK_RESOURCES, target.x, target.y)[0];
                if (resource) return creep.pickup(resource);
                return ERR_NOT_FOUND;
            }
            return creep.pickup(resolved);

        case 'drop':
            return creep.drop(RESOURCE_ENERGY);

        case 'withdraw':
            return creep.withdraw(resolved, RESOURCE_ENERGY);

        case 'build':
            return creep.build(resolved);

        case 'upgrade':
            return creep.upgradeController(resolved);

        case 'repair':
            return creep.repair(resolved);

        case 'wait':
            return OK;  // Do nothing

        default:
            console.log(`${creep.name}: unknown action: ${action}`);
            return ERR_INVALID_ARGS;
    }
}

/**
 * Run a creep through its routine
 * @param {Creep} creep
 * @param {Array} routine - array of {pos, dir, actions}
 */
function run(creep, routine) {
    if (creep.spawning) return;
    if (creep.fatigue > 0) return;

    // Initialize step if needed
    if (creep.memory.step === undefined) {
        creep.memory.step = 0;
    }

    let step = creep.memory.step;
    const current = routine[step];

    // Verify position - if wrong, step back (move failed last tick)
    if (creep.pos.x !== current.pos.x || creep.pos.y !== current.pos.y) {
        step = (step - 1 + routine.length) % routine.length;
        creep.memory.step = step;
    }

    // Get current step (may have changed)
    const here = routine[step];

    // Execute actions for this tile
    for (const {action, condition, target} of here.actions) {
        // Check condition first
        if (!checkCondition(creep, condition)) continue;

        const result = execute(creep, action, target);
        if (result === OK) break;  // Stop on first success
    }

    // Move to next position if direction specified
    if (here.dir) {
        creep.move(here.dir);
    }

    // Always advance to next step
    creep.memory.step = (step + 1) % routine.length;
}

module.exports = { run, execute };
