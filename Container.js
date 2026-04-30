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
        return this.contents.find(obj => obj.id === id);
    }

    getContents() {
        return this.contents;
    }

    canContain() {
        return true;
    }

    getActions(world) {
        const actions = super.getActions(world)

        if (this.action) {
            actions.push({
                name: Object.keys(this.action)[0],
                handler: (world) => handleAction(world)
        })
        } else {
            this.contents.forEach(item => {
                actions.push(item.getActions())
            })
        }
    }

    handleAction(world) {
        world.message = this.action[0];
        this.action.filter(this.action[0])
    }

}

export default Container