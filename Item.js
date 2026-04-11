import GameObject from "./GameObject.js"

class Item extends GameObject {
    constructor(
        id,
        name,
        description,
        location
    ) {
        super(id, name, description, location)
    }

    take(world) {
        this.location.removeChild(this);
        world.player.addChild(this);
        this.setLocation(player);

        world.message = `You picked up the ${this.name}.`
    }

    drop(world) {
        world.player.removeChild(this);
        world.player.location.addChild(this);
        this.setLocation(world.player.location);

        world.message = `You dropped the ${this.name}.`
    }

    use(world) {

    }

    getActions(world) {
        const actions = super(getActions(world));
        const currentRoom = world.currentRoom;

        if (this.location === world.player) {
            actions.push({
                name: "Drop",
                handler: (world) => this.drop(world)
            })
            actions.push({
                name: "Use",
                handler: (world) => this.use(world)
            })
        } else if (this.location === currentRoom) {
            actions.push({
                name: "Take",
                handler: (world) => this.take(world)
            })
        }

        return actions;
    }
}

export default Item