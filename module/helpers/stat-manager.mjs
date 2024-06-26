/**
 * Popout menu handling stat increases etc.
 *
 * @param {KSActor} actor
 * @param {object} [options={}]
 * @param {string} [options.statType]
 * @param {string} [options.statKey]
 * @param {string} [options.stat]
 */
export class StatManager extends FormApplication {
  constructor(actor, options = {}) {
    super(options);

    this.actor = actor;
    this.statType = options.statType;
    this.statKey = options.statKey;
    this.stat = options.stat;
  }
  /** @inheritdoc */
  getData() {
    return {
      cssClass: "editable",
      statType: this.statType,
      stat: this.stat,
      statKey: this.statKey,
      actor: this.actor,
      title: `${this.stat.label} Configuration`,
    };
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/kaiserschlacht/templates/helpers/stat-manager.hbs",
      width: 420,
      height: 130,
      resizable: true,
      title: "Stat Configuration",
    });
  }
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _updateObject(event, formData) {
    console.log(formData);
    return this.actor.update(formData);
  }
}
