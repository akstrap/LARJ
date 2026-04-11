import Container from "./Container.js"

class Gatherer extends Container {
    constructor(
        id,
        name,
        description,
        location,
        action = {},
        conditions = [],
        output
    ) {
        super(id, name, description, location, []);
        action = this.action;
        conditions = this.conditions;
        output = this.output;
    }

    checkConditions() {
        if (this.contents.length !== this.conditions.length) return false;

        const idsContents = this.contents.map(obj => obj.id).sort();
        const idsConditions = this.conditions.map(obj => obj.id).sort();

        return idsContents.every((id, i) => id === idsConditions[i]);
    }

    getActions(world) {
        const actions = super(world);

        actions.push({
            name: action.
        })
    }

}

export default Gatherer