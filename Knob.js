import Interactable from './Interactable.js'

class Knob extends Interactable {
    constructor(data) {
        super(data);
        this.sides = data.sides || [];
        this.selectedSide = data.selectedSide || this.sides[0];
    }

    use(world, actionName) {
        super.use(world, actionName);
        const currentIndex = this.sides.indexOf(this.selectedSide);
        const nextIndex = (currentIndex + 1) % this.sides.length;
        this.selectedSide = this.sides[nextIndex];
    }
}

export default Knob