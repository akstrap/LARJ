import GameObject from "./GameObject.js";

class Item extends GameObject{
    constructor(
        id,
        name,
        description,
        data = {}
    ){
        super(id, name, description);
        this.takeable = data.takeable || false;
        this.action = data.action || {};
        this.interact = data.interact || {};
        this.selectedSide = data.selectedSide || null;
    }

    take(world) {
        const room = world.currentRoomId;

        if (world.player.contents.length >= 6) {
            world.message = "You can't carry any more items.";
            return;
        }

        world.rooms[room].removeChild(this);
        world.player.addChild(this);

        world.message = `You picked up the ${this.name}.`;
    }

    drop(world) {
        const room = world.currentRoomId;

        world.player.removeChild(this);
        world.rooms[room].addChild(this);

        world.message = `You dropped the ${this.name}.`;
    }

    getActions(world){
        return Object.keys(this.action);
    }
}

export default Item