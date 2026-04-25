import Item from "./Item.js";

class Interactable extends Item {
    constructor(
        id,
        name,
        description,
        location,
        action = {},
        conditions = [],
        output
    ) {
        super(id, name, description, location);
        this.action = action;
        this.conditions = conditions;
        this.output = output;
    }

    use(world) {
            if (this.checkConditions()) {
                world.message = this.output;
                this.action.handler(world);
            } else {
                world.message = "You can't do that right now.";
            }
    }
}