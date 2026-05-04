import Player from './Player.js';

export const world = {
    currentRoom: null,
    rooms: {},
    player: new Player(),
    objects: {},
    selectedItem: null,
    message: "",
    selectedInventoryItem: null,
    messages: {}
}

export function setWorldMessages(messages = {}) {
    world.messages = messages;
    world.message = messages.initialWorldMessage;
}
