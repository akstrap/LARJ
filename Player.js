import Container from "./Container.js";

class Player extends Container {
    constructor(data) {
        super({
            id: "player",
            name: "Player",
            description: "You",
            location: "room"
        });
    }
}

export default Player