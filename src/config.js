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
            sources: [
                { id: '5bbcaf7b9099fc012e63aa76', parking: { x: 24, y: 14 } },
                { id: '5bbcaf7b9099fc012e63aa77', parking: { x: 25, y: 14 } },
            ],
        },
    },
};
