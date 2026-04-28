import { world } from "./model.js";
import Room from "./js-classes/Room.js";
import Item from "./js-classes/Item.js";
import Player from "./js-classes/Player.js";
import { initView, render, createItemAction } from "./view.js";

let els;

export async function init() {

    els = initView();

    const resp = await fetch("./db.json");
    const db = await resp.json();

    // Create items
    Object.values(db.items).forEach(data => {
        world.items[data.id] = new Item(
            data.id,
            data.name,
            data.description,
            data
        );
    });

    // Create rooms
    Object.values(db.rooms).forEach(data => {
        const room = new Room(
            data.id,
            data.name,
            data.description,
            [],
            data.exits
        );

        // Attach items
        if (data.items) {
            data.items.forEach(id => {
                room.addChild(world.items[id]);
            });
        }

        world.rooms[data.id] = room;
    });

    world.currentRoomId = "main-castle-room";
    world.player = new Player();

    render();
    bindUI();
}

function resolveUnknownExit(room, dir) {
    if (room.id === "main-castle-room" && dir === "west") {
        const knob = world.items["knob"];

        switch (knob.selectedSide) {
            case "blue": return "town";
            case "red": return "busy-city";
            case "green": return "flower-fields";
            case "black": return "???";
        }
    }
}

function bindUI() {
    const {
        roomNameEl,
        roomDescEl,
        messageEl,
        roomExitsEl,
        itemsAreaEl,
        inventoryEl,
    } = els;
}

document.addEventListener("click", (e) => {
    const exit = e.target.closest("[data-exit]");
    if (exit) {
        e.preventDefault();

        const dir = exit.dataset.exit;
        const room = world.rooms[world.currentRoomId];
        let dest = room.getExit(dir);

        if (dest === "unknown") {
            dest = resolveUnknownExit(room, dir);
        }

        if (dest) {
            world.currentRoomId = dest;

            world.selectedInventoryItem = null;

            render();
        }
    }

    const itemLink = e.target.closest("[data-item]");
    if (itemLink) {
        e.preventDefault();

        const item = world.items[itemLink.dataset.item];
        const selectedId = world.selectedInventoryItem;

        const actions = [];

        if (item.takeable && !world.player.contents.includes(item)) {
            actions.push({
                label: `Take ${item.name}?`,
                handler: () => {
                    item.take(world);
                    render();
                }
            });
        }
        if (item.interact && selectedId && item.interact[selectedId]) {
            const interactData = item.interact[selectedId];
            actions.push({
                label: `Use ${world.items[selectedId].name} with ${item.name}?`,
                handler: () => {
                    world.message = interactData.message;
                    if (interactData.newDescription) {
                        item.setDescription(interactData.newDescription);
                    }
                    if (interactData.consume) {
                        const invItem = world.items[selectedId];
                        world.player.removeChild(invItem);
                    }
                    world.selectedInventoryItem = null;
                    render();
                }
            });
        }
        item.getActions(world).forEach(actionKey => {
            actions.push({
                label: actionKey.replace(/-/g, " "),
                handler: () => {
                    world.message = item.action[actionKey];

                    if (item.id === "knob") {
                        item.selectedSide = actionKey.replace("turn-to-", "");
                    }

                    render();
                }
            })
        })
        if (selectedId &&
            (!item.interact || !item.interact[selectedId])) {
            world.selectedInventoryItem = null;
            }

        render();
        createItemAction(item, actions);
    }

    const inv = e.target.closest("[data-inventory-item]");
    if (inv) {
        e.preventDefault();

        const item = world.items[inv.dataset.inventoryItem];
        const actions = [];
        
        if (world.selectedInventoryItem === item.id) {
            world.selectedInventoryItem = null;
        } else {
            world.selectedInventoryItem = item.id;
        }

        actions.push({
            label: `Drop ${item.name}?`,
            handler: () => {
                item.drop(world);
                world.selectedInventoryItem = null;
                world.message = `You dropped the ${item.name}.`;
                render();
            }
        });
        render();
        createItemAction(item, actions);
    }
});

