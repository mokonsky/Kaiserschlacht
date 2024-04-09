import Tagify from "@yaireo/tagify";
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';
// let weaponTagInput = document.querySelector('input[name=system.weaponTraits]');
// 
// let typeInput = document.querySelector('input[name=system.type]');

// initialize Tagify on the above input node reference


/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class KSItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['kaiserschlacht', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/kaiserschlacht/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    let context = super.getData();
    // Use a safe clone of the item data for further operations.
    const itemData = context.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = this.item.getRollData();

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
    // toggle item equip
    html.on('click', '.equip-toggle', (ev) => {

      //const li = $(ev.currentTarget).parents('.item');
      this.item.equipToggle()

    });
    // Roll handlers, click handlers, etc. would go here.
    let weaponTagInput = html[0].querySelector('input[name=system.weaponTraits]');
    console.log(weaponTagInput);
    this.weaponTagify = new Tagify(weaponTagInput, {
      id: 'system.weaponTraits',
      whitelist: CONFIG.weaponTagWhitelist,
      userInput: false
    });
    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );
  }
}
