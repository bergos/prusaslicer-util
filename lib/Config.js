import * as INI from './ini.js'
import Settings from './Settings.js'

class Config {
  constructor (input) {
    this.settings = new Settings()

    if (input) {
      this.import(input)
    }
  }

  get filaments () {
    return this.settings.filter({ prefix: 'filament' })
  }

  get printers () {
    return this.settings.filter({ prefix: 'printer' })
  }

  get printerModels () {
    return this.settings.filter({ prefix: 'printer_model' })
  }

  get prints () {
    return this.settings.filter({ prefix: 'print' })
  }

  get vendor () {
    return this.settings.filter({ prefix: 'vendor' })
  }

  toJSON () {
    return {
      ...this.vendor.toJSON(),
      ...this.printerModels.toJSON(),
      ...this.printers.toJSON(),
      ...this.prints.toJSON(),
      ...this.filaments.toJSON()
    }
  }

  toString () {
    return INI.stringify(this.toJSON())
  }

  import (object) {
    object = (typeof object.toJSON === 'function' && object.toJSON()) || object

    this.settings.importObject(object)

    return this
  }

  static async fromFile (filename) {
    return new Config(await INI.fromFile(filename))
  }
}

export default Config
