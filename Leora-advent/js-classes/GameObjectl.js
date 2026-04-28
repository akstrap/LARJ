class GameObject{
    constructor(
        id,
        name,
        description,
        location = "world"
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
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
}

export default GameObject