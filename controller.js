import { world } from "./model.js";
import { initView, render } from "./view.js";
import Player from "./Player.js";
import Item from "./Item.js";
import Container from "./Container.js";
import Gatherer from "./Gatherer.js";
import Interactable from "./Interactable.js";
import Knob from "./Knob.js";
import Room from "./Room.js";

let els;

export async function init() {
    els = initView();

    const resp = await fetch('./db.json')
    const data = await resp.json();

    createItems(data);
    createGatherers(data);
    createContainers(data);
    createInteractables(data);
    createRooms(data);

    linkWorld();

    world.currentRoom = world.rooms["room"];
    world.player = new Player();
    world.selectedItem = null;

    render();
    bindUI();

}

function createItems(data) {
    Object.values(data.items).forEach(data => {
        world.objects[data.id] = new Item(data);
    })
}

function createGatherers(data) {
    Object.values(data.gatherers).forEach(data => {
        world.objects[data.id] = new Gatherer(data);
    })
}

function createContainers(data) {
    Object.values(data.containers).forEach(data => {
        world.objects[data.id] = new Container(data);
    })
}

function createInteractables(data) {
    Object.values(data.interactables).forEach(data => {
        if (data.sides) {
            world.objects[data.id] = new Knob(data);
        } else {
            world.objects[data.id] = new Interactable(data);
        }
    })
}

function createRooms(data) {
    Object.values(data.rooms).forEach(data => {
        world.rooms[data.id] = new Room(data);
    })
}

function linkWorld() {
    Object.values(world.objects).forEach(obj => {
        if (typeof obj.location === "string") {
            obj.location = world.objects[obj.location] || world.rooms[obj.location];
        }
    });

    Object.values(world.objects).forEach(obj => {
        if (obj.contents) {
            obj.contents = obj.contents.map(id => world.objects[id]);
        }
    });

    Object.values(world.rooms).forEach(room => {
        if (room.contents) {
            room.contents = room.contents.map(id => world.objects[id]);
        }
    });

    Object.values(world.rooms).forEach(room => {
        for (const dir in room.exits) {
            room.exits[dir] = world.rooms[room.exits[dir]];
        }
        for (const dir in room.lockedExits) {
            room.lockedExits[dir] = world.rooms[room.lockedExits[dir]];
        }
    })
}


export function selectObject(obj) {
    world.selectedItem = obj;
    render();
}

export function runAction(action) {
    action.handler(world);
    world.selectedItem = null;
    render();
}

function bindUI() {
    document.addEventListener("click", handleClick);
}

function handleClick(e) {
    const exitBtn = e.target.closest("[data-exit]");
    if (exitBtn) return handleExit(exitBtn.dataset.exit)

    const itemBtn = e.target.closest("[data-item]");
    if (itemBtn) return handleItem(itemBtn.dataset.item)

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) return handleAction(actionBtn.dataset.action)
}

function handleExit(dir) {
    const room = world.currentRoom;
    let dest = room.getExit(dir);

    if (dest === "unknown") {
        dest = resolveUnknownExit(room, dir);
    }
    if (!dest) return;

    world.currentRoom = dest;
    world.selectedItem = null;
    world.message = `You moved ${dir}`

    render();
}

function handleItem(itemId) {
    const item = world.items[itemId]
    if (!world.selectedItem) {
        world.selectedItem = item
        world.message = item.description
        render();
        return;
    }
    else {
        item.interact(world.selectedItem.id, world);
        render();
    }
}

function handleAction(actionId) {
    const item = world.selectedItem;
    if (!item) return;
    const actions = item.getActions(world)
    const action = actions[actionId];

    if (!action) return;

    action.handler(world);

    world.selectedItem = null;
    render();
}
