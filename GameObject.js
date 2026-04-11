class GameObject{
    constructor(
        id,
        name,
        description,
        location
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
    }

    constructor(
        id,
        name,
        description
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = "world"
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.description;
    }

    setDescription(newDesc) {
        this.description = newDesc;
    }

    getLocation() {
        return this.location;
    }

    setLocation(newLoc) {
        this.location = newLoc;
    }

    getActions(world) {
        const actions = [];

        return actions;
    }
}

export default GameObject;