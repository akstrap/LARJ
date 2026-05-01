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
 let inventoryPanel
 let itemsToggleIcon

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
    inventoryPanel = document.querySelector("#inventory-panel");
    itemsToggleIcon = document.querySelector("#items-toggle-icon");

    bindEvents();

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
        toggleItems,
        inventoryPanel,
        itemsToggleIcon
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

    openHints.addEventListener("click", () => openModal("hint"));
    openExits.addEventListener("click", () => openModal("exits"));

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

  function renderItemsPanel() {
    const isExpanded = !state.itemsCollapsed;
    toggleItems.setAttribute("aria-expanded", String(isExpanded));
    inventoryPanel.classList.toggle("sidebar__panel--collapsed", state.itemsCollapsed);
    itemsToggleIcon.textContent = isExpanded ? "-" : "+";
  }

  function renderHints() {
    const unlockableHintIndex = getUnlockableHintIndex();
    const isResolved = isHintResolved();
    hintTextEl.textContent = isResolved ? this.scene.hints[this.state.currentHint] : "";
    hintCardEl.classList.toggle("hint-card--locked", !isResolved);
    hintCardEl.classList.toggle("hint-card--revealed", isResolved);
    hintTextEl.classList.toggle("modal__copy--locked", !isResolved);
    hintReveal.disabled =
      isResolved || state.hintCreditsRemaining < 1 || state.currentHint !== unlockableHintIndex;
    hintIndex.textContent = `1/${state.hintCreditsRemaining}`;
    hintPrev.disabled = state.currentHint === 0;
    hintNext.disabled = state.currentHint >= unlockableHintIndex;
  }

  function isHintResolved() {
    return Boolean(state.resolvedHints[state.currentHint]);
  }

  function setActiveHintIndex() {
    state.currentHint = getUnlockableHintIndex();
  }

  function getUnlockableHintIndex() {
    const nextUnresolvedIndex = hints.findIndex((_, index) => !state.resolvedHints[index]);
    return nextUnresolvedIndex === -1 ? hints.length - 1 : nextUnresolvedIndex;
  }

  function openModal(name) {
    state.openModal = name;
    modalOverlay.classList.remove("hidden");
    modalOverlay.setAttribute("aria-hidden", "false");
    hintModal.classList.toggle("hidden", name !== "hint");
    exitsModal.classList.toggle("hidden", name !== "exits");

    if (name === "hint") {
      setActiveHintIndex();
      renderHints();
    }
  }

  function closeModal() {
    state.openModal = null;
    modalOverlay.classList.add("hidden");
    modalOverlay.setAttribute("aria-hidden", "true");
    hintModal.classList.add("hidden");
    exitsModal.classList.add("hidden");
  }


  function renderRoom(room) {
    roomNameEl.textContent = room.name;
    roomDescEl.innerHTML = "";

    console.log("Room contents: ", room.getContents())
    const text = room.description;

    // match [label:id] OR [id]
    const regex = /\[(.*?)\]/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const content = match[1];

        // add text before match
        roomDescEl.append(
            document.createTextNode(text.slice(lastIndex, match.index))
        );

        let label, id;

        if (content.includes(":")) {
            [label, id] = content.split(":");
        } else {
            label = content;
            id = content;
        }

        const obj = world.objects[id];

        if (obj) {
            const btn = document.createElement("button");
            btn.className = "description-link";
            btn.textContent = label;
            btn.dataset.item = obj.id;

            roomDescEl.append(btn);
        } else {
            // fallback if object missing
            roomDescEl.append(document.createTextNode(label));
        }

        lastIndex = match.index + fullMatch.length;
    }

    // remaining text
    roomDescEl.append(
        document.createTextNode(text.slice(lastIndex))
    );

    renderRemainingContents(room);
}


  function renderRemainingContents(room) {
    const describedIds = [...room.description.matchAll(/\[(.*?)\]/g)]
        .map(match => {
            const content = match[1];
            return content.includes(":") ? content.split(":")[1] : content;
        });

    const remaining = room.getContents().filter(
        obj => !describedIds.includes(obj.id)
    );

    if (remaining.length === 0) return;

    roomDescEl.append(document.createElement("br"));
    roomDescEl.append(document.createTextNode("You also see: "));

    remaining.forEach((obj, i) => {
        const btn = document.createElement("button");
        btn.className = "description-link";
        btn.textContent = obj.name;
        btn.dataset.item = obj.id;

        roomDescEl.append(btn);

        if (i < remaining.length - 1) {
            roomDescEl.append(document.createTextNode(", "));
        }
    });
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
        btn.dataset.action = action.name;

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
        btn.dataset.slot = dir;
        btn.textContent =  `${dir.toUpperCase()} - ${targetRoom?.name || "Unknown"}`;

        exitsMapEl.append(btn);
    })
    Object.entries(room.lockedExits).forEach(([dir, targetRoom]) => {
        const btn = document.createElement("button")
        btn.className = "exit-node";
        btn.dataset.exit = dir;
        btn.dataset.slot = dir;
        btn.textContent = `${dir.toUpperCase()} - ${targetRoom?.name || "Unknown"}`;
        btn.disabled = true;

        exitsMapEl.append(btn);
    })
  }
  
  export function closeActiveModal() {
    state.openModal = null;
    modalOverlay.classList.add("hidden");
    modalOverlay.setAttribute("aria-hidden", "true");
    hintModal.classList.add("hidden");
    exitsModal.classList.add("hidden");
}