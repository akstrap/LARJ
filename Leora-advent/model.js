import Player from "./js-classes/Playerl.js";

export const world = {
    currentRoomId: null,
    rooms: {},
    message: "You wake up...",
    player: new Player(),
    items: {},
    selectedInventoryItem: null
}
