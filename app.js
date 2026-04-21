class GreatHallScene {
  constructor() {
    this.room = {
      id: "great-hall",
      name: "Great Hall",
      descriptionParts: [
        { type: "text", value: "An expansive main hall with a huge " },
        { type: "feature", value: "table", featureId: "table" },
        { type: "text", value: " in the middle surrounded by " },
        { type: "feature", value: "chairs", featureId: "chairs" },
        { type: "text", value: "." },
      ],
      defaultMessage: "You have moved into the Great Hall",
    };

    this.hints = [
      "It seems like these jewels probably belong somewhere.",
      "A loose cushion and a dusty rug are better hiding places than they look.",
      "The mysterious room is easier to solve once the scattered jewels have been found.",
    ];

    this.features = {
      table: {
        id: "table",
        label: "table",
        message: "A huge table with the remnants of a feast with carrots, bread, and a jug",
        actions: [
          { label: "Take carrot", type: "take", itemId: "carrot" },
          { label: "Take bread", type: "take", itemId: "bread" },
          { label: "Take jug", type: "take", itemId: "jug" },
        ],
      },
      chairs: {
        id: "chairs",
        label: "chairs",
        message: "One of the chairs has a loose cushion. Something beneath it glints in the dark.",
        actions: [
          { label: "Search chair", type: "message", message: "You find a hint tucked beneath the cushion." },
        ],
      },
    };

    this.items = {
      bread: {
        id: "bread",
        name: "Bread",
        description: "A loaf of old, stale bread",
        highlight: true,
        useMessage: "You tear off a piece of bread. It is every bit as stale as it looks.",
        dropMessage: "You drop the bread back onto the stone floor.",
      },
      carrot: {
        id: "carrot",
        name: "Carrots",
        description: "A bunch of feast carrots, slightly soft but still bright.",
        useMessage: "You crunch into a carrot. At least one part of the feast survived.",
        dropMessage: "You place the carrots beside the table.",
      },
      jug: {
        id: "jug",
        name: "Jug",
        description: "A weighty ceramic jug with the last drops of a banquet drink inside.",
        useMessage: "You tip the jug. A thin splash echoes across the hall.",
        dropMessage: "You set the jug down carefully before it can shatter.",
      },
    };

    this.exits = [
      {
        id: "north",
        shortLabel: "North",
        detailLabel: "Bathroom",
        slot: "north",
        enabled: true,
        preview: "North Bathroom",
      },
      {
        id: "west",
        shortLabel: "West",
        detailLabel: "Throne Room",
        slot: "west",
        enabled: true,
        preview: "West Throne Room",
      },
      {
        id: "east",
        shortLabel: "East",
        detailLabel: "Courtyard",
        slot: "east",
        enabled: true,
        preview: "East Courtyard",
      },
      {
        id: "south",
        shortLabel: "South",
        detailLabel: "",
        slot: "south",
        enabled: false,
        preview: "South",
      },
    ];
  }
}

class LARJInterface {
  constructor(scene) {
    this.scene = scene;
    this.state = {
      currentFocus: "room",
      inventory: [],
      itemsCollapsed: true,
      selectedExitId: null,
      currentHint: 0,
      hintCreditsRemaining: 3,
      resolvedHints: [],
      openModal: null,
    };

    this.elements = {
      roomName: document.querySelector("#room-name"),
      roomDescription: document.querySelector("#room-description"),
      messageText: document.querySelector("#message-text"),
      actionBar: document.querySelector("#action-bar"),
      inventoryList: document.querySelector("#inventory-list"),
      inventoryPanel: document.querySelector("#inventory-panel"),
      toggleItems: document.querySelector("#toggle-items"),
      itemsToggleIcon: document.querySelector("#items-toggle-icon"),
      exitsMap: document.querySelector("#exits-map"),
      modalOverlay: document.querySelector("#modal-overlay"),
      hintModal: document.querySelector("#hint-modal"),
      exitsModal: document.querySelector("#exits-modal"),
      hintCard: document.querySelector("#hint-card"),
      hintText: document.querySelector("#hint-text"),
      hintReveal: document.querySelector("#hint-reveal"),
      hintIndex: document.querySelector("#hint-index"),
      hintPrev: document.querySelector("#hint-prev"),
      hintNext: document.querySelector("#hint-next"),
      openHints: document.querySelector("#open-hints"),
      openExits: document.querySelector("#open-exits"),
    };
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.elements.toggleItems.addEventListener("click", () => {
      this.state.itemsCollapsed = !this.state.itemsCollapsed;
      this.renderItemsPanel();
    });

    this.elements.openHints.addEventListener("click", () => this.openModal("hint"));
    this.elements.openExits.addEventListener("click", () => this.openModal("exits"));

    this.elements.hintPrev.addEventListener("click", () => {
      this.state.currentHint = Math.max(0, this.state.currentHint - 1);
      this.renderHints();
    });

    this.elements.hintNext.addEventListener("click", () => {
      this.state.currentHint = Math.min(this.getUnlockableHintIndex(), this.state.currentHint + 1);
      this.renderHints();
    });

    this.elements.hintReveal.addEventListener("click", () => {
      if (this.isHintResolved() || this.state.hintCreditsRemaining < 1) {
        return;
      }

      this.state.hintCreditsRemaining -= 1;
      this.state.resolvedHints[this.state.currentHint] = true;
      this.renderHints();
    });

    this.elements.modalOverlay.addEventListener("click", (event) => {
      if (event.target === this.elements.modalOverlay) {
        this.closeModal();
        return;
      }

      const closeButton = event.target.closest("[data-close-modal]");
      if (closeButton) {
        this.closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.state.openModal) {
        this.closeModal();
      }
    });
  }

  getSelectedItem() {
    if (!this.state.currentFocus.startsWith("item:")) return null;
    const itemId = this.state.currentFocus.replace("item:", "");
    return this.scene.items[itemId];
  }

  getSelectedFeature() {
    if (!this.state.currentFocus.startsWith("feature:")) return null;
    const featureId = this.state.currentFocus.replace("feature:", "");
    return this.scene.features[featureId];
  }

  getSelectedExit() {
    return this.scene.exits.find((exit) => exit.id === this.state.selectedExitId) || null;
  }

  getMessage() {
    const selectedItem = this.getSelectedItem();
    if (selectedItem) return selectedItem.description;

    const selectedFeature = this.getSelectedFeature();
    if (selectedFeature) return selectedFeature.message;

    const selectedExit = this.getSelectedExit();
    if (selectedExit) {
      return selectedExit.enabled
        ? `You can go ${selectedExit.shortLabel} to the ${selectedExit.detailLabel}`
        : "That route is sealed for now.";
    }

    return this.scene.room.defaultMessage;
  }

  render() {
    this.elements.roomName.textContent = this.scene.room.name;
    this.renderDescription();
    this.elements.messageText.textContent = this.getMessage();
    this.renderActionBar();
    this.renderInventory();
    this.renderItemsPanel();
    this.renderExitsMap();

    if (this.state.openModal === "hint") {
      this.renderHints();
    }
  }

  renderDescription() {
    this.elements.roomDescription.innerHTML = "";

    this.scene.room.descriptionParts.forEach((part) => {
      if (part.type === "text") {
        this.elements.roomDescription.append(document.createTextNode(part.value));
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

  isHintResolved() {
    return Boolean(this.state.resolvedHints[this.state.currentHint]);
  }

  setActiveHintIndex() {
    this.state.currentHint = this.getUnlockableHintIndex();
  }

  getUnlockableHintIndex() {
    const nextUnresolvedIndex = this.scene.hints.findIndex((_, index) => !this.state.resolvedHints[index]);
    return nextUnresolvedIndex === -1 ? this.scene.hints.length - 1 : nextUnresolvedIndex;
  }

  openModal(name) {
    this.state.openModal = name;
    this.elements.modalOverlay.classList.remove("hidden");
    this.elements.modalOverlay.setAttribute("aria-hidden", "false");
    this.elements.hintModal.classList.toggle("hidden", name !== "hint");
    this.elements.exitsModal.classList.toggle("hidden", name !== "exits");

    if (name === "hint") {
      this.setActiveHintIndex();
      this.renderHints();
    }
  }

  closeModal() {
    this.state.openModal = null;
    this.elements.modalOverlay.classList.add("hidden");
    this.elements.modalOverlay.setAttribute("aria-hidden", "true");
    this.elements.hintModal.classList.add("hidden");
    this.elements.exitsModal.classList.add("hidden");
  }
}

const scene = new GreatHallScene();
const app = new LARJInterface(scene);

app.init();
