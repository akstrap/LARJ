import Container from "./Container.js"

class Gatherer extends Container {
    constructor(data) {
        super(data);
        this.action = data.action || {};
        this.conditions = data.conditions || {};
        this.interactions = data.interact || {};
        this.hiddenContents = data.hiddenContents || [];
    }

    interact(item, world) {
        if (this.interactions[item.id]) {
            this.contents.push(item);
            world.player.removeChild(item);
            world.message = this.interactions[item.id];
            world.selectedItem = null;
            world.selectedInventoryItem = null;
            const condition = this.checkConditions();
            if (condition) {
                this.applyCondition(condition, world);
            }
        }
        else {
            world.message = "I don't think those two items go together.";
        }
    }

    checkConditions() {
    for (const key in this.conditions) {
      const condition = this.conditions[key];
      if (condition.contains.every(id => this.contents.includes(id))) {
        return condition;
      }
    }
    return null;
    }

    getActions(world) {
        const actions = super.getActions(world);
        const actionName = Object.keys(this.action)[0];
        if (actionName) {
            actions.push({
                name: actionName,
                handler: () => world.message = this.action[actionName]
        })
        }

        return actions;
    }

    canAdd() {
        return true;
    }

    applyCondition(condition, world) {
        if (condition.newDescription) {
            this.setDescription(condition.newDescription);
        }
        if (condition.reveal) {
            condition.reveal.forEach(id => {
                const obj = world.objects[id];
                this.addChild(obj);
                this.hiddenContents = this.hiddenContents.filter(hiddenId => hiddenId !== id);
            })
        }
        if (condition.newAction) {
            this.action = condition.newAction;
        }
        if (condition.unlockExit) {
            const room = world.rooms[world.currentRoomId];
            room.unlockExit(condition.unlockExit);
        }
    }

}

export default Gatherer