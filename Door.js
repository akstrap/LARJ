import GameObject from './GameObject.js'

class Door extends GameObject {
    constructor(data) {
        super(data);
        this.conditions = data.conditions || {};
        this.currentItems = [];
        this.key = data.interact || {};
    }

    interact(world, itemId) {
        if (!this.key[itemId]){
            world.message = "I don't think that item will work here.";
            return;
        }
        this.currentItems.push(itemId);
        world.player.removeChild(itemId);
        const condition = this.checkConditions();
        if (condition) {
            world.currentRoom = condition.nextRoom;
            world.message = condition.message;
            this.applyCondition(condition, world);
        } else {
            world.message = this.key[itemId];
        }
    }

    checkConditions() {
        for (const key in this.conditions) {
            const condition = this.conditions[key];
            if (condition.contains.every(id => this.currentItems.includes(id))) {
                return condition;
            }
        }
        return null;
    }

    applyCondition(condition, world) {
        if (condition.newDescription) {
            this.setDescription(condition.newDescription);
        }
        if (condition.newAction) {
            this.key = condition.newAction;
        }
        if (condition.reveal) {
            condition.reveal.forEach(id => {
                const obj = world.objects[id];
                world.rooms[world.currentRoom].addChild(obj);
            })
        }  
        if (condition.unlockExit) {
            world.rooms[world.currentRoom].unlockExit(condition.unlockExit);
        }
    }
}

export default Door