/**
 * Utility functions
 */

// Body part costs
const BODY_COSTS = {
    [MOVE]: 50,
    [WORK]: 100,
    [CARRY]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600,
    [TOUGH]: 10,
};

/**
 * Build a body from an ideal template, adding parts until energy runs out.
 * Order matters - put essential parts first in the ideal array.
 *
 * @param {Array} ideal - Ideal body in priority order
 * @param {number} energy - Available energy
 * @returns {Array} - Body array with as many parts as energy allows
 *
 * Example:
 *   buildBody([WORK, MOVE, WORK, WORK, WORK, WORK], 300)
 *   => [WORK, MOVE, WORK] (100 + 50 + 100 = 250, next WORK would be 350)
 */
function buildBody(ideal, energy) {
    const body = [];
    let remaining = energy;

    for (const part of ideal) {
        const cost = BODY_COSTS[part];
        if (cost <= remaining) {
            body.push(part);
            remaining -= cost;
        }
    }

    return body;
}

module.exports = { buildBody, BODY_COSTS };
