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

    unlockExit(dir, newExit) {
        this.exits[dir] = newExit;
        delete this.lockedExits[dir];
    }

}

export default Room