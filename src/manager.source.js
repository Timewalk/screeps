/**
 * Source Manager
 *
 * Manages a single source and its harvester(s).
 * One instance per source defined in config.
 */

class SourceManager {
    constructor(sourceId, parking, spawnManager) {
        this.sourceId = sourceId;
        this.parking = parking;
        this.spawnManager = spawnManager;

        this.source = Game.getObjectById(this.sourceId);
        this.room = this.source ? this.source.room : null;
        this.harvester = _.find(Game.creeps, c =>
            c.memory.role === 'harvester' &&
            c.memory.sourceId === this.sourceId
        );
    }

    run() {
        if (!this.harvester) {
            this.spawnHarvester();
        }

        if (this.harvester) {
            this.runHarvester(this.harvester);
        }

        this.drawVisuals();
    }

    drawVisuals() {
        if (!this.source) return;

        const visual = new RoomVisual(this.source.room.name);
        const label = this.sourceId.slice(-4);

        visual.text(label, this.source.pos.x, this.source.pos.y - 1, {
            font: 0.5,
            color: '#ffff00',
            stroke: '#000000',
            strokeWidth: 0.1,
        });
    }

    spawnHarvester() {
        const name = `H${this.sourceId.slice(-4)}`;

        // Body scales: essentials first, then more WORK
        // At 300 energy: [MOVE, CARRY, WORK, WORK] - minimum viable
        // At 550 energy: [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK] - full
        const body = [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK];

        this.spawnManager.spawnCreep(
            body,
            name,
            {
                memory: {
                    role: 'harvester',
                    sourceId: this.sourceId,
                    parking: this.parking,
                },
                priority: 1,
                near: new RoomPosition(this.parking.x, this.parking.y, this.room.name),
            }
        );
    }

    /**
     * Harvester: go to parking, harvest forever
     */
    runHarvester(creep) {
        const parkingPos = new RoomPosition(
            creep.memory.parking.x,
            creep.memory.parking.y,
            this.room.name
        );

        // Move to parking if not there
        if (!creep.pos.isEqualTo(parkingPos)) {
            creep.moveTo(parkingPos);
            return;
        }

        // At parking - harvest
        if (this.source) {
            creep.harvest(this.source);
        }
    }
}

module.exports = SourceManager;
