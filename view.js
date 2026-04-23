import {world} from './model.js'; 

 let roomNameEl
 let roomDescEl
 let messageEl
 let actionBarEl
 let inventoryEl
 let itemsEl
 let exitsMapEl
 let hintCardEl
 let hintTextEl
 

 export function initView() {
    roomNameEl = document.querySelector(".room-name");
    roomDescEl = document.querySelector(".room-description");
    messageEl = document.querySelector(".message");
    actionBarEl = document.querySelector(".action-bar");
    inventoryEl = document.querySelector(".inventory");
    itemsEl = document.querySelector(".items");
    exitsMapEl = document.querySelector(".exits-map");
    hintCardEl = document.querySelector(".hint-card");
    hintTextEl = document.querySelector(".hint-text");

    return {
        roomNameEl,
        roomDescEl,
        messageEl,
        actionBarEl,
        inventoryEl,
        itemsEl,
        exitsMapEl,
        hintCardEl,
        hintTextEl
    }

 }

 export function render() {

    const room = world.rooms[world.currentRoom];
    roomNameEl.textContent = room.name;
    renderDescription(room);
    renderMessage(room);
    renderActionBar(room);
    renderInventory(world.player.inventory);
    renderItemsPanel(room);
    renderExitsMap(room);

    if (this.state.openModal === "hint") {
      this.renderHints();
    }
  }

  renderDescription(room) {
    roomDescEl.innerHTML = "";

    room.contents.forEach((part) => {
      if (part.type === "text") {
        roomDescEl.append(document.createTextNode(part.value));
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "description-link";
      button.textContent = part.value;
      button.addEventListener("click", () => {
        this.state.currentFocus = `feature:${part.featureId}`;
        this.state.selectedExitId = null;
        this.render();
      });

      this.elements.roomDescription.append(button);
    });
  }

  buildActionButton(label, handler, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button action-button";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", handler);
    return button;
  }

  renderActionBar() {
    this.elements.actionBar.innerHTML = "";

    const selectedFeature = this.getSelectedFeature();
    const selectedItem = this.getSelectedItem();
    const selectedExit = this.getSelectedExit();

    if (selectedFeature) {
      selectedFeature.actions.forEach((action) => {
        if (action.type === "take") {
          const alreadyOwned = this.state.inventory.includes(action.itemId);
          this.elements.actionBar.append(
            this.buildActionButton(
              action.label,
              () => {
                if (!alreadyOwned) {
                  this.state.inventory.push(action.itemId);
                }
                this.state.currentFocus = `item:${action.itemId}`;
                this.render();
              },
              alreadyOwned,
            ),
          );
          return;
        }

        this.elements.actionBar.append(
          this.buildActionButton(action.label, () => {
            this.state.currentFocus = "room";
            this.scene.room.defaultMessage = action.message;
            this.render();
          }),
        );
      });
      return;
    }

    if (selectedItem) {
      this.elements.actionBar.append(
        this.buildActionButton(`Drop ${selectedItem.name}`, () => {
          this.state.inventory = this.state.inventory.filter((id) => id !== selectedItem.id);
          this.scene.room.defaultMessage = selectedItem.dropMessage;
          this.state.currentFocus = "room";
          this.render();
        }),
      );
      this.elements.actionBar.append(
        this.buildActionButton(`Use ${selectedItem.name}`, () => {
          this.scene.room.defaultMessage = selectedItem.useMessage;
          this.render();
        }),
      );
      return;
    }

    if (selectedExit) {
      this.elements.actionBar.append(
        this.buildActionButton(
          "Go",
          () => {
            this.scene.room.defaultMessage = selectedExit.enabled
              ? `You head ${selectedExit.shortLabel} toward the ${selectedExit.detailLabel}.`
              : "You push against the blocked path, but nothing gives.";
            this.state.currentFocus = "room";
            this.state.selectedExitId = null;
            this.closeModal();
            this.render();
          },
          !selectedExit.enabled,
        ),
      );
    }
  }

  renderInventory() {
    this.elements.inventoryList.innerHTML = "";

    if (!this.state.inventory.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Nothing yet";
      this.elements.inventoryList.append(empty);
      return;
    }

    this.state.inventory.forEach((itemId) => {
      const item = this.scene.items[itemId];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sidebar__item";

      if (this.state.currentFocus === `item:${itemId}` || item.highlight) {
        button.classList.add("is-active");
      }

      button.textContent = item.name;
      button.addEventListener("click", () => {
        this.state.currentFocus = `item:${itemId}`;
        this.state.selectedExitId = null;
        this.render();
      });

      this.elements.inventoryList.append(button);
    });
  }

  renderItemsPanel() {
    const isExpanded = !this.state.itemsCollapsed;
    this.elements.toggleItems.setAttribute("aria-expanded", String(isExpanded));
    this.elements.inventoryPanel.classList.toggle("sidebar__panel--collapsed", this.state.itemsCollapsed);
    this.elements.itemsToggleIcon.textContent = isExpanded ? "-" : "+";
  }

  renderExitsMap() {
    this.elements.exitsMap.innerHTML = "";

    this.scene.exits.forEach((exit) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "exit-node";
      button.dataset.slot = exit.slot;
      button.disabled = !exit.enabled;

      if (this.state.selectedExitId === exit.id) {
        button.classList.add("is-active");
      }

      button.innerHTML = exit.detailLabel
        ? `${exit.shortLabel}<br />${exit.detailLabel}`
        : exit.shortLabel;

      button.addEventListener("click", () => {
        this.state.selectedExitId = exit.id;
        this.state.currentFocus = "exit";
        this.render();
      });

      this.elements.exitsMap.append(button);
    });
  }

  renderHints() {
    const unlockableHintIndex = this.getUnlockableHintIndex();
    const isResolved = this.isHintResolved();
    this.elements.hintText.textContent = isResolved ? this.scene.hints[this.state.currentHint] : "";
    this.elements.hintCard.classList.toggle("hint-card--locked", !isResolved);
    this.elements.hintCard.classList.toggle("hint-card--revealed", isResolved);
    this.elements.hintText.classList.toggle("modal__copy--locked", !isResolved);
    this.elements.hintReveal.disabled =
      isResolved || this.state.hintCreditsRemaining < 1 || this.state.currentHint !== unlockableHintIndex;
    this.elements.hintIndex.textContent = `1/${this.state.hintCreditsRemaining}`;
    this.elements.hintPrev.disabled = this.state.currentHint === 0;
    this.elements.hintNext.disabled = this.state.currentHint >= unlockableHintIndex;
  }