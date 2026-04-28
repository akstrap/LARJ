import Player from './Player.js';

export const world = {
    currentRoom: null,
    rooms: {},
    player: new Player(),
    items: {},
    selectedInventoryItem: null,
    message: "You wake up..."
}

export default world;