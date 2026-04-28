import Player from "./js-classes/Player.js";

export const world = {
    currentRoomId: null,
    rooms: {},
    message: "You wake up...",
    player: new Player(),
    items: {},
    selectedInventoryItem: null
}
