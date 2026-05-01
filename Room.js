import Container from "./Container.js"

class Room extends Container {
    constructor(data) {
        super(data);
        this.exits = data.exits || {};
        this.lockedExits = data.lockedExits || {};
    }

    getExit(dir) {
        return this.exits[dir];
    }

    getExits() {
        return Object.keys(this.exits);
    }

    unlockExit(exitObj, world) {
        for (const dir in exitObj) {
            const roomId = exitObj[dir];
            this.exits[dir] = world.rooms[roomId];
            delete this.lockedExits[dir]
        }
    }

}

export default Room