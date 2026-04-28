import {world} from "./model.js";



let roomNameEl
let roomDescEl
let messageEl
let roomExitsEl
let itemsAreaEl
let inventoryEl

export function initView() {
    roomNameEl = document.querySelector("#room-name");
    roomDescEl = document.querySelector("#room-desc");
    messageEl = document.querySelector("#message-area");
    roomExitsEl = document.querySelector("#exits-area");
    itemsAreaEl = document.querySelector("#items-area");
    inventoryEl = document.querySelector("#inventory-list");

    return {
        roomNameEl,
        roomDescEl,
        messageEl,
        roomExitsEl,
        itemsAreaEl,
        inventoryEl
    };
}


function createExitLink(room, dir) {
    const destId = room.exits[dir];
    if (!destId) return null;
    const destRoom = world.rooms[destId];
    return `<a href="#" data-exit="${dir}">${dir}</a> to the ${destRoom.name}`;
}

function createItemExamine(item) {
    return `<a href="#" data-item="${item.id}">${item.name}</a>`;
}

export function createItemAction(item, actions) {
 
    messageEl.innerHTML = item.description;

    actions.forEach(action => {
        const btn = document.createElement("button");
        btn.textContent = action.label;

        btn.addEventListener("click", action.handler);

        messageEl.appendChild(document.createElement("br"));
        messageEl.appendChild(btn);
    })

}

function injectItemLinks(room) {
    let desc = room.description;

    if (!room.contents) return desc;

    const selectedId = world.selectedInventoryItem;

    room.contents.forEach(item => {
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


}

export function render() {
    if (!world.rooms) return;

    const room = world.rooms[world.currentRoomId];

    if (!room) return;

    renderRoomHeader(room);
    renderRoomDescription(room);
    renderMessageArea();
    renderExits(room);
    renderItems(room);
    renderInventory(world.player);
}

function renderRoomHeader(room) {
    roomNameEl.textContent = room.name ?? "Unknown Location";
}

function renderRoomDescription(room) {
    roomDescEl.innerHTML = injectItemLinks(room);
}

function renderMessageArea() {
    messageEl.innerHTML = world.message;
}

function renderExits(room) {
    const exits = room.exits ? Object.keys(room.exits) : [];
    if (exits.length === 0) {
        roomExitsEl.textContent = "There is no where to go from here.";
    } else {
        roomExitsEl.innerHTML = "You can go " + exits.map(dir => createExitLink(room, dir)).join(", ");
    }
}

function renderItems(room) {
    const items = room.contents || [];
    if (items.length === 0) {
        itemsAreaEl.textContent = "There are no items here.";
    } else {
        itemsAreaEl.innerHTML = "You see " + items.map(item => createItemExamine(item)).join(", ");
    }
}

function renderInventory(player) {
    const inventory = player.contents || [];
    if (inventory.length === 0) {
        inventoryEl.innerHTML = "<li>You have no items.</li>";
    } else {
        inventoryEl.innerHTML = inventory.map(item => {
            const isSelected = item.id === world.selectedInventoryItem;

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


