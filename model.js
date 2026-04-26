import Player from './Player.js';

export const world = {
    currentRoom: null,
    rooms: {},
    player: new Player(),
    items: {},
    selectedInventoryItem: null
}

export default world;