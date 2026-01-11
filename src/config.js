/**
 * Colony Configuration
 */

module.exports = {
    username: 'TimeWalk',
    sources: [
        {
            id: '5bbcaf7b9099fc012e63aa73',
            parking: { room: 'E42S48', x: 24, y: 12 },  // TODO: set actual parking
        },
        {
            id: '5bbcaf7b9099fc012e63aa72',
            parking: { room: 'E42S48', x: 25, y: 12 },  // TODO: set actual parking
        },
        {
            id: '5bbcaf7b9099fc012e63aa74',
            parking: { room: 'E42S47', x: 22, y: 27 },  // TODO: set actual parking
        },
    ],

    controllers: [
        { id: '5bbcae209099fc012e637cba', room: 'E42S48', targetLevel: 8 },
    ],

    /** Repair container when hits drop below this percentage */
    containerRepairThreshold: 0.75,
};
