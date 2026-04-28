import Container from "./Containerl.js";

class Player extends Container{
    constructor(
        id = "player",
        name = "Player",
        description = "It's you.",
        contents = [],
        location = "Main-Castle-Room"
    ) {
        super(id, name, description, contents);
        this.location = location;
    }

    inventoryDescription(){
        if (this.contents.length === 0) {
            return "You have no items.";
        }

        return this.contents.map(item => item.name).join(", ");
    }
}

export default Player;