import Container from "./Container.js"

class Gatherer extends Container {
    constructor(data) {
        super(data);
        this.action = data.action || {};
        this.conditions = data.conditions || {};
        this.interact = data.interact || {};
        this.hiddenContents = data.hiddenContents || [];
    }

    interact(itemId, world) {
        if (this.interact[itemId]) {
            this.contents.push(itemId);
            world.player.removeChild(itemId);
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

    getActions(world) {
        const actions = super(world);

        actions.push({
            name: Object.keys(this.action)[0],
            handler: (world) => this.action(itemId, world)
        })
    }



}

export default Gatherer