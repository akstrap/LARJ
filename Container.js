import GameObject from "./GameObject.js"

class Container extends GameObject {
    constructor(
        id,
        name,
        description,
        location,
        contents = []
    ) {
        super(id, name, description, location);
        this.contents = contents;
    }
    constructor(
        id,
        name,
        description,
        contents = []
    ) {
        super(id, name, description);
        this.contents = contents;
    }

    addChild(item) {
        this.contents.push(item);
    }

    removeChild(item) {
        this.contents = this.contents.filter(o => o.id !== item.id)
    }

    getChildById(id) {
        this.contents.find(obj => obj.id === id)
    }

}

export default Container