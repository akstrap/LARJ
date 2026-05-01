import GameObject from "./GameObject.js";

class Interactable extends GameObject {
    constructor(data) {
        super(data);
        this.action = data.action || {};
        this.newExit = data.newLockedExit || null;
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
        if (this.newExit) {
            const room = this.location;
            const door = world.objects["secret-door"]
            room.addChild(door);
            const dir = Object.keys(this.newExit)[0]
            room.lockedExits[dir] = this.newExit[dir]
            this.newExit = null;
        }
    }
}

export default Interactable