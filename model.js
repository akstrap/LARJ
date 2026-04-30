import Player from './Player.js';

export const world = {
    currentRoom: null,
    rooms: {},
    player: new Player(),
    objects: {},
    selectedItem: null,
    message: "You wake up..."
}
