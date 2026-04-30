import GameObject from "./GameObject.js";

class Interactable extends GameObject {
    constructor(data) {
        super(data);
        this.action = data.action || {};
    }

    getActions(world) {
        const actions = super.getActions(world);
        
        Object.keys(this.action).forEach(actionName => {
            actions.push({
                name: actionName,
                handler: (world) => this.use(world, actionName)
            })
        });
        return actions;
    }

    use(world, actionName) {
        world.message = this.action[actionName] || "Nothing happens.";
    }
}

export default Interactable