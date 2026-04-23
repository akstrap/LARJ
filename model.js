import Player from './player.js';

export const world = {
    currentRoom: null,
    rooms: {},
    player: new Player(),
    items: {},
    selectedInventoryItem: null
}