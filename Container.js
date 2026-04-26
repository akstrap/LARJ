import GameObject from "./GameObject.js"

class Container extends GameObject {
    constructor(data) {
        super(data);
        this.contents = data.contents || [];
        this.action = data.action || {};
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

    accessContents() {
        return this.contents;
    }

}

export default Container