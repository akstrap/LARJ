import GameObject from "./GameObject.js"
import { render } from "./view.js"

class Container extends GameObject {
    constructor(data) {
        super(data);
        this.contents = data.contents || [];
        this.action = data.action || {};
        this.opened = data.opened || false;
    }

    addChild(item) {
        this.contents.push(item);
    }

    removeChild(item) {
        this.contents = this.contents.filter(o => o.id !== item.id)
    }

    getChildById(id) {
        return this.contents.find(obj => obj.id === id);
    }

    getContents() {
        return this.contents;
    }

    canContain() {
        return true;
    }

    getActions(world) {
        const actions = super.getActions(world)

        if (!this.opened) {
            const key = Object.keys(this.action)[0];
            actions.push({
                name: key,
                handler: (world) => {
                    
                    this.opened = true;
                    world.selectedItem = this;
                    world.message = this.action[key];

                    render();
                }
            })
        return actions;
        }
        for (const item of this.contents) {
            if (!item) continue;

            const childActions = item.getActions(world);

            if (Array.isArray(childActions)) {
                actions.push(...childActions);
            }
        }

        return actions;
    }

}

export default Container