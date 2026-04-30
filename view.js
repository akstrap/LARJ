import {world} from './model.js'; 

 let roomNameEl
 let roomDescEl
 let messageEl
 let actionBarEl
 let inventoryEl
 let exitsMapEl
 let hintCardEl
 let hintTextEl
 let modalOverlay
 let hintModal
 let exitsModal
 let hintReveal
 let hintIndex
 let hintPrev
 let hintNext
 let openHints
 let openExits
 let toggleItems

 const state = {
  itemsCollapsed: true,
  selectedExitId: null,
  currentHint: 0,
  hintCreditsRemaining: 3,
  resolvedHints: [],
  openModal: null
};
 

 export function initView() {
    roomNameEl = document.querySelector("#room-name");
    roomDescEl = document.querySelector("#room-description");
    messageEl = document.querySelector("#message-text");
    actionBarEl = document.querySelector("#action-bar");
    inventoryEl = document.querySelector("#inventory-list");
    exitsMapEl = document.querySelector("#exits-map");
    hintCardEl = document.querySelector("#hint-card");
    hintTextEl = document.querySelector("#hint-text");
    toggleItems = document.querySelector("#toggle-items");
    itemsToggleIcon = document.querySelector("#items-toggle-icon");
    modalOverlay = document.querySelector("#modal-overlay");
    hintModal = document.querySelector("#hint-modal");
    exitsModal = document.querySelector("#exits-modal");
    hintReveal = document.querySelector("#hint-reveal");
    hintIndex = document.querySelector("#hint-index");
    hintPrev = document.querySelector("#hint-prev");
    hintNext = document.querySelector("#hint-next");
    openHints = document.querySelector("#open-hints");
    openExits = document.querySelector("#open-exits");

    return {
        roomNameEl,
        roomDescEl,
        messageEl,
        actionBarEl,
        inventoryEl,
        exitsMapEl,
        hintCardEl,
        hintTextEl,
        modalOverlay,
        hintModal,
        exitsModal,
        hintReveal,
        hintIndex,
        hintPrev,
        hintNext,
        openHints,
        openExits,
        toggleItems
    }

 }

 export function render() {

    const room = world.currentRoom;
    renderRoom(room);
    renderInventory();
    renderActions();
    renderMessage();
    renderExits(room);
 }

 function bindEvents() {
    toggleItems.addEventListener("click", () => {
      state.itemsCollapsed = !state.itemsCollapsed;
      renderItemsPanel();
    });

    openHints.addEventListener("click", () => state.openModal("hint"));
    openExits.addEventListener("click", () => state.openModal("exits"));

    hintPrev.addEventListener("click", () => {
      state.currentHint = Math.max(0, state.currentHint - 1);
      renderHints();
    });

    hintNext.addEventListener("click", () => {
      state.currentHint = Math.min(getUnlockableHintIndex(), state.currentHint + 1);
      renderHints();
    });

    hintReveal.addEventListener("click", () => {
      if (isHintResolved() || state.hintCreditsRemaining < 1) {
        return;
      }

      state.hintCreditsRemaining -= 1;
      state.resolvedHints[state.currentHint] = true;
      renderHints();
    });

    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) {
        closeModal();
        return;
      }

      const closeButton = event.target.closest("[data-close-modal]");
      if (closeButton) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.openModal) {
        closeModal();
      }
    });
  }


  function renderRoom(room) {
    roomNameEl.textContent = room.name;
    let text = room.description;
    const usedObjects = new Set();
    roomDescEl.innerHTML = "";

    room.getContents().forEach(obj => {
        const name = obj.name.toLowerCase();
        const lowerText = text.toLowerCase();

        if (lowerText.includes(name)) {
            const parts = text.split(name);
            if (parts[0]) {
                roomDescEl.append(document.createTextNode(parts[0]))
            }
            const btn = document.createElement("button");
            btn.className = "description-link";
            btn.textContent = name;
            btn.dataset.item = obj.id;
            roomDescEl.append(btn);
            usedObjects.add(obj.id)
            text = parts.slice(1).join(name);
        }
    });

    if (text) {
        roomDescEl.append(document.createTextNode(text));
    }

    const remaining = room.getContents().filter(obj => !usedObjects.has(obj.id));

    if (remaining.length > 0) {
        roomDescEl.append(document.createElement("br"));

        const prefix = document.createTextNode("You also see: ");
        roomDescEl.append(prefix);

        remaining.forEach((obj, index) => {
            const btn = document.createElement("button");
            btn.className = "description-link";
            btn.textContent = obj.name;
            btn.dataset.item = obj.id;

            roomDescEl.append(btn);

            if (index < remaining.length -1) {
                roomDescEl.append(document.createTextNode(", "))
            }
        })
    }
  }

  function renderInventory() {
    inventoryEl.innerHTML = "";

    world.player.getContents().forEach(obj => {
        const btn = document.createElement("button");
        btn.className = "sidebar__item"
        btn.type = "button"
        btn.textContent = obj.name;

        if (world.selectedItem === obj) {
            btn.classList.add("is-active")
        }
        btn.dataset.item = obj.id;

        inventoryEl.append(btn)
    });
  }

  function renderActions() {
    actionBarEl.innerHTML = "";

    if (!world.selectedItem) return;

    const actions = world.selectedItem.getActions(world);

    actions.forEach(action => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "button action-button";
        btn.textContent = action.name;
        btn.dataset.action = index;

        actionBarEl.append(btn)
    })

  }

  function renderMessage() {
    messageEl.textContent = world.message;
  }

  function renderExits(room) {
    exitsMapEl.innerHTML = "";
    Object.entries(room.exits).forEach(([dir, targetRoom]) => {
        const btn = document.createElement("button")
        btn.className = "exit-node";
        btn.dataset.exit = dir;
        btn.textContent =  `${dir.toUpperCase()} - ${targetRoom?.name || "Unknown"}`;

        exitsMapEl.append(btn);
    })
  }
  