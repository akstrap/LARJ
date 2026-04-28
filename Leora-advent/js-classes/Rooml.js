import Container from "./Containerl.js";

class Room extends Container{
    constructor(
        id,
        name,
        description,
        contents = [],
        exits = {}
    ) {
        super(id, name, description, contents)
        this.exits = exits
    }

    getExit(dir) {
        return this.exits[dir];
    }

    getExits() {
        return Object.keys(this.exits);
    }
}

export default Room