import Container from "./Container.js";

class Player extends Container {
    constructor(data = {}) {
        super({
            id: data.id,
            name: data.name,
            description: data.description,
            location: data.location
        });
    }
}

export default Player
