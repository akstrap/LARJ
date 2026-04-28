
import GameObject from "./GameObjectl.js";

class Container extends GameObject{
    constructor(
        id,
        name,
        description,
        contents = []
    ) {
        super(id, name, description)
        this.contents = contents
    }
    addChild(obj){
        this.contents.push(obj)
    }
    removeChild(obj){
        this.contents = this.contents.filter(o => o.id !== obj.id)
    }
    getChildById(id) {
        return this.contents.find(obj => obj.id === id)
    }
}

export default Container