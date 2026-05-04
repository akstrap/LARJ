class Hint {
    constructor(world, maxCredits = 3) {
        this.world = world;
        this.maxCredits = maxCredits;
        this.creditsRemaining = maxCredits;
        this.currentIndex = 0;
        this.resolvedHints = {};
        this.hints = [];
        this.conditionTemplates = {};
    }

    setDefinitions(definitions = [], conditionTemplates = {}) {
        this.conditionTemplates = conditionTemplates;
        this.hints = definitions.map(definition => ({
            id: definition.id,
            text: definition.text,
            isRelevant: () => this.isConditionRelevant(definition.condition)
        }));
        this.currentIndex = 0;
    }

    previous() {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
    }

    next() {
        this.currentIndex = Math.min(this.getUnlockableHintIndex(), this.currentIndex + 1);
    }

    reveal() {
        if (this.isResolved() || this.creditsRemaining < 1) {
            return false;
        }

        const activeHints = this.getActiveHints();
        this.creditsRemaining -= 1;
        this.resolvedHints[activeHints[this.currentIndex].id] = true;
        return true;
    }

    setActiveHintIndex() {
        this.currentIndex = this.getUnlockableHintIndex();
    }

    getViewModel() {
        const activeHints = this.getActiveHints();
        this.currentIndex = Math.min(this.currentIndex, activeHints.length - 1);

        const unlockableHintIndex = this.getUnlockableHintIndex();
        const isResolved = this.isResolved();

        return {
            text: isResolved ? activeHints[this.currentIndex].text : "",
            isResolved,
            revealDisabled: isResolved || this.creditsRemaining < 1 || this.currentIndex !== unlockableHintIndex,
            counterText: `${this.creditsRemaining}/${this.maxCredits}`,
            prevDisabled: this.currentIndex === 0,
            nextDisabled: this.currentIndex >= unlockableHintIndex
        };
    }

    isResolved() {
        const activeHints = this.getActiveHints();
        return Boolean(this.resolvedHints[activeHints[this.currentIndex].id]);
    }

    getUnlockableHintIndex() {
        const activeHints = this.getActiveHints();
        const nextUnresolvedIndex = activeHints.findIndex(hint => !this.resolvedHints[hint.id]);
        return nextUnresolvedIndex === -1 ? activeHints.length - 1 : nextUnresolvedIndex;
    }

    getActiveHints() {
        const activeHints = this.hints.filter(hint => this.resolvedHints[hint.id] || hint.isRelevant());
        return activeHints.length ? activeHints : [this.hints[this.hints.length - 1] || this.getFallbackHint()];
    }

    isConditionRelevant(condition) {
        const template = typeof condition === "string" ? this.conditionTemplates[condition] : condition;
        return this.matchesTemplate(template, this.world);
    }

    matchesTemplate(template, context) {
        if (!template) {
            return false;
        }

        if (template.all) {
            return template.all.every(rule => this.matchesTemplate(rule, context));
        }

        if (template.any) {
            return template.any.some(rule => this.matchesTemplate(rule, context));
        }

        if (template.not) {
            return !this.matchesTemplate(template.not, context);
        }

        const value = this.resolvePath(context, template.path);

        if (template.some) {
            return Array.isArray(value) && value.some(item => this.matchesTemplate(template.some, item));
        }

        if (Object.prototype.hasOwnProperty.call(template, "equals") && value !== template.equals) {
            return false;
        }

        if (Object.prototype.hasOwnProperty.call(template, "notEquals") && value === template.notEquals) {
            return false;
        }

        if (template.in && !template.in.includes(value)) {
            return false;
        }

        return true;
    }

    resolvePath(context, path) {
        if (!path) {
            return context;
        }

        return path.split(".").reduce((value, key) => value?.[key], context);
    }

    getFallbackHint() {
        return {
            id: "fallback",
            text: "Try using what you have.",
            isRelevant: () => true
        };
    }
}

export default Hint;
