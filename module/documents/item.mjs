import { KSRoll } from "../helpers/roll.mjs";
import { diffDialog } from "../helpers/dice-dialog.mjs";
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class KSItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    if (this.system.equipped === false) {
      this.collections.effects.forEach((e) => e.update({ transfer: false }));
    }
  }
  /**
   * Returns a given item's attack roll formula.
   * @type {string}
   */
  get attackFormula() {
    let weaponType = this.system.type || "ranged";
    switch (weaponType) {
      case "ranged":
        return "@skills.shooting.mod";
      case "melee":
        return "@skills.brawl.mod";
      case "thrown":
        return "@skills.athletics.mod";
      case "acrobatics":
        return "@skills.acrobatics.mod";
      default:
        console.log("improper weapon type given, defaulting to ranged");
        return "@skills.shooting.mod";
    }
  }
  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const rollData = { ...super.getRollData() };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;
    console.log(item);
    await this.system;
    console.log(this.system);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    console.log(this.actor);
    const rollMode = game.settings.get("core", "rollMode");
    const label = `${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      if (this.system.reload) {
        // Retrieve roll data.
        const rollData = await this.getRollData();

        // Invoke the roll and submit it to chat.
        const roll = new KSRoll("1d6", rollData, {
          targetNumber: rollData.reload,
        });
        // If you need to store the value first, uncomment the next line.
        // const result = await roll.evaluate();
        roll.toMessage({
          speaker: speaker,
          rollMode: rollMode,
          flavor: "Reload",
        });
        return roll;
      } else
        ChatMessage.create({
          speaker: speaker,
          rollMode: rollMode,
          flavor: label,
          content: item.system.description ?? "",
        });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = await this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new KSRoll(rollData.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
  /**
   * Handle attack rolls from a given weapon.
   * @param {Event} event   The originating click event
   * @private
   */
  async attackRoll() {
    const item = this;
    await this.system;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.attackFormula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? "",
      });
    } else {
      // Retrieve roll data.
      const rollData = await this.getRollData();
      let formula = this.attackFormula;
      const amendedFormula = await diffDialog(formula);
      // Invoke the roll and submit it to chat.
      const roll = new KSRoll(amendedFormula, rollData.actor, {
        reload: this.system.reload,
        damage: this.system.damage || 0,
        damageTags: this.system.weaponTraits,
      });
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });

      return roll;
    }
  }
  equipToggle() {
    //toggles equip value and whether the items are deleted or not
    if (this.system.equipped) {
      this.update({ system: { equipped: false } });
      this.collections.effects.forEach((e) => e.update({ transfer: false }));
    } else {
      this.update({ system: { equipped: true } });
      this.collections.effects.forEach((e) => e.update({ transfer: true }));
    }
  }
}
