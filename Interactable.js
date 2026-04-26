import GameObject from "./GameObject.js";

class Interactable extends GameObject {
    constructor(data) {
        super(data);
        this.action = data.action || {};
    }

    getActions(world) {
        const actions = super.getActions(world);
        
        actions.push({
            name: Object.keys(this.action)[0],
            handler: (world) => this.use(world, Object.keys(this.action)[0])
        })
    }

    use(world, actionName) {
        return this.action[actionName] || "Nothing happens.";
    }
}