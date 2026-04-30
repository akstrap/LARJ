class GameObject{
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.location = data.location;
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

    canContain() {
        return false;
    }

    canTake(){
        return false;
    }

    canAdd() {
        return false;
    }
}

export default GameObject;