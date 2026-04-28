import { init } from "./controller.js";
init();

// MODEL
/* const world = {
    currentRoomId: "main-castle-room",
    rooms: null,
    message: "You wake up...",
    inventory: [],
    items: null,
    selectedInventoryItem: null
}

const roomNameEl = document.querySelector("#room-name");
const roomDescEl = document.querySelector("#room-desc");
const messageEl = document.querySelector("#message-area");
const roomExitsEl = document.querySelector("#exits-area");
const itemsAreaEl = document.querySelector("#items-area");
const inventoryEl = document.querySelector("#inventory-list");

function createExitLink(room, dir) {
    const destId = room.exits[dir];
    if (!destId) return null;
    const destRoom = world.rooms[destId];
    return `<a href="#" data-exit="${dir}">${dir}</a> to the ${destRoom.name}`;
}

function createItemExamine(item) {
    return `<a href="#" data-item="${item.id}">${item.name}</a>`;
}

function resolveUnknownExit(room, dir) {
    if (room.id === "main-castle-room" && dir === "west") {
        const knob = world.items["knob"];
        if (knob.selectedSide === "blue") {
            return "town";
        } else if (knob.selectedSide === "red") {
            return "busy-city";
        } else if (knob.selectedSide === "green") {
            return "flower-fields";
        } else if (knob.selectedSide === "black") {
            return "???";
        }
    }
}

// VIEW
function render() {
    const currentRoom = world.rooms[world.currentRoomId];
    if (!currentRoom) {

        return;
    }

    roomNameEl.textContent = currentRoom.name;
    roomDescEl.innerHTML = injectItemLinks(currentRoom);
    messageEl.innerHTML = world.message;

    const exits = currentRoom.exits ? Object.keys(currentRoom.exits) : [];
    if (exits.length === 0) {
        roomExitsEl.textContent = "There is no where to go from here.";
    } else {
        roomExitsEl.innerHTML = "You can go " + exits.map(dir => createExitLink(currentRoom, dir)).join(", ");
    }

    const items = currentRoom.items ? currentRoom.items.map(itemId => world.items[itemId]) : [];
    if (items.length === 0) {
        itemsAreaEl.textContent = "There are no items here.";
    } else {
        itemsAreaEl.innerHTML = "You see " + items.map(item => createItemExamine(item)).join(", ");
    }

    const inventory = world.inventory || [];
    if (inventory.length === 0) {
        inventoryEl.innerHTML = "<li>You have no items.</li>";
    } else {
        inventoryEl.innerHTML = inventory.map(itemId => {
            const item = world.items[itemId];
            const isSelected = itemId === world.selectedInventoryItem;

            return `
        <li class="${isSelected ? "selected" : ""}">
            <a href="#" data-inventory-item="${item.id}">
                ${item.name}
            </a>
        </li>
    `;
        }).join("");
    }

}

// CONTROLLER
async function init() {
    const resp = await fetch("./db.json");
    const db = await resp.json();
    world.rooms = db.rooms;
    world.items = db.items;

    render();
}

roomExitsEl.addEventListener("click", (e) => {
    console.log("clicked on an exit");
    const link = e.target.closest("a[data-exit]")
    if (!link) return;

    e.preventDefault();

    const dir = link.dataset.exit;
    const room = world.rooms[world.currentRoomId];
    let destId = room.exits?.[dir];
    if (destId === "unknown") {
        destId = resolveUnknownExit(room, dir);
    }

    if (!destId) return;

    world.message = "You just came from the " + world.rooms[world.currentRoomId].name + "."

    world.currentRoomId = destId;
    world.selectedInventoryItem = null;
    render();

})

document.addEventListener("click", (e) => {
    console.log("clicked on an item");
    const link = e.target.closest("a[data-item]")

    if (!link) return;

    e.preventDefault();

    const item = world.items[link.dataset.item];
    const selectedId = world.selectedInventoryItem;
    if (selectedId && (!item.interact || !item.interact[selectedId])) {
        world.selectedInventoryItem = null;
    }
    world.message = item.description || "You see nothing special about the " + item + ".";
    if (item.takeable) {
        takeItem(item);
    }
    else {
        takeAction(item);
    }
})

function takeItem(item) {


    // Create button
    const btn = document.createElement("button");
    btn.textContent = `Take ${item.name}?`;
    btn.dataset.take = item.id;


    // When clicked → move item to inventory
    btn.addEventListener("click", () => {
        const currentRoom = world.rooms[world.currentRoomId];
        if (world.inventory.length === 6) {
            world.message = "You can't carry any more items.";
            render();
            return;
        }
        // Remove item from room
        currentRoom.items = currentRoom.items.filter(id => id !== item.id);

        // Add item to inventory
        world.inventory.push(item.id);

        world.message = `You picked up the ${item.name}.`;

        render();
    });

    // Add button under the message
    messageEl.innerHTML = world.message;
    messageEl.appendChild(btn);
}

function takeAction(item) {

    const selectedId = world.selectedInventoryItem;
    if (selectedId && item.interact && item.interact[selectedId]) {
        const interaction = item.interact[selectedId];
        world.message = interaction.message;
        item.description = interaction.newDescription;
        if (interaction.consume) {
            world.inventory = world.inventory.filter(
                id => id !== selectedId
            );
        }

        render();
        return;
    }

    if (!item.action || Object.keys(item.action).length === 0) {
        render();
        return;
    }
    // Clear and show base description first
    messageEl.innerHTML = item.description;

    // Create a button for each action
    Object.keys(item.action).forEach(actionKey => {

        if (item.id === "knob" && actionKey === `turn-to-${item.selectedSide}`) {
            return; // Skip current side
        }

        const btn = document.createElement("button");

        // Make button text readable
        btn.textContent = actionKey.replace(/-/g, " ");

        btn.addEventListener("click", () => {

            // Set world message to the action result
            world.message = item.action[actionKey];

            // Special example: knob tracking selected side
            if (item.id === "knob") {
                item.selectedSide = actionKey.replace("turn-to-", "");
            }

            render();
        });

        messageEl.appendChild(document.createElement("br"));
        messageEl.appendChild(btn);
    });
}

inventoryEl.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-inventory-item]")
    if (!link) return;

    e.preventDefault();

    const item = world.items[link.dataset.inventoryItem];
    messageEl.innerHTML = item.description || "You see nothing special about the " + item + ".";

    if (world.selectedInventoryItem === item.id) {
        world.selectedInventoryItem = null;
    } else {
        world.selectedInventoryItem = item.id;
    }

    const drpBtn = document.createElement("button");
    drpBtn.textContent = `Drop ${item.name}?`;

    drpBtn.addEventListener("click", () => {
        world.inventory = world.inventory.filter(id => id !== item.id);

        const currentRoom = world.rooms[world.currentRoomId];
        currentRoom.items.push(item.id);
        if (!currentRoom.description.includes(item.name)) {
            currentRoom.description += ` There is a ${item.name} on the ground.`;
        }
        world.message = `You dropped the ${item.name}.`;
        world.selectedInventoryItem = null;

        render();
    })

    messageEl.appendChild(document.createElement("br"));
    messageEl.appendChild(drpBtn);
})

function injectItemLinks(room) {
    let desc = room.description;

    if (!room.items) return desc;

    const selectedId = world.selectedInventoryItem;

    room.items.forEach(itemId => {
        const item = world.items[itemId];

        let className = "room-item";
        if (selectedId && item.interact && item.interact[selectedId]) {
            className += " interactable";
        }
        const regex = new RegExp(item.name, "gi");

        desc = desc.replace(regex,
            `<a href="#" data-item="${item.id}" class="${className}">${item.name}</a>`
        );
    });

    return desc;


} */



