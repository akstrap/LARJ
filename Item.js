import GameObject from "./GameObject.js"
import { formatText } from "./TextTemplate.js";

class Item extends GameObject {
    constructor(data) {
        super(data)
        this.usable = data.usable || false;
        this.messages = data.messages || {};
    }

    take(world) {
        this.acquiredFrom = this.location;
        this.location.removeChild(this);
        world.player.addChild(this);
        this.setLocation(world.player);

        world.message = formatText(this.messages.take, { name: this.name });
    }

    drop(world) {
        world.player.removeChild(this);
        world.currentRoom.addChild(this);
        this.setLocation(world.currentRoom);

        world.message = formatText(this.messages.drop, { name: this.name });
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
                name: formatText(this.messages.actionDrop, { name: this.name }),
                handler: (world) => this.drop(world)
            })
            if (this.usable) {
                actions.push({
                    name: formatText(this.messages.actionUse, { name: this.name }),
                    handler: (world) => this.use(world)
                })
            }
        } else {
            actions.push({
                name: formatText(this.messages.actionTake, { name: this.name }),
                handler: (world) => this.take(world)
            })
        }

        return actions;
    }
}

export default Item
