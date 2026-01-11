/**
 * Colony Configuration
 *
 * Room states:
 *   CLAIMED  - owned room with controller
 *   RESERVED - reserved room for remote mining
 *   WATCHED  - monitoring only, no operations
 */

module.exports = {
    rooms: {
        'E42S48': {
            state: 'CLAIMED',
        },
    },
};
