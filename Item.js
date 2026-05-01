import GameObject from "./GameObject.js"

class Item extends GameObject {
    constructor(data) {
        super(data)
        this.usable = data.usable || false;
    }

    take(world) {
        this.location.removeChild(this);
        world.player.addChild(this);
        this.setLocation(world.player);

        world.message = `You picked up the ${this.name}.`
    }

    drop(world) {
        world.player.removeChild(this);
        world.currentRoom.addChild(this);
        this.setLocation(world.currentRoom);

        world.message = `You dropped the ${this.name}.`
    }

    use(world) {
        world.selectedInventoryItem = this;
    }

    canTake() {
        return true;
    }

    getActions(world) {
        const actions = super.getActions(world);

        if (this.location === world.player) {
            actions.push({
                name: `Drop ${this.name}`,
                handler: (world) => this.drop(world)
            })
            if (this.usable) {
                actions.push({
                    name: `Use ${this.name}`,
                    handler: (world) => this.use(world)
                })
            }
        } else {
            actions.push({
                name: `Take ${this.name}`,
                handler: (world) => this.take(world)
            })
        }

        return actions;
    }
}

export default Item