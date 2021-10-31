import Section from './Section.js'

function sectionFilter ({ abstract, prefix, name, scope }) {
  return section => {
    if (typeof abstract !== 'undefined' && abstract !== section.abstract) {
      return false
    }

    if (typeof prefix !== 'undefined' && prefix !== section.prefix) {
      return false
    }

    if (typeof name !== 'undefined' && name !== section.name) {
      return false
    }

    if (typeof scope !== 'undefined' && scope !== section.scope) {
      return false
    }

    return true
  }
}

class Settings extends Map {
  add (section) {
    this.set(section.key, section)
  }

  filter (options) {
    let accept = options

    if (typeof options !== 'function') {
      accept = sectionFilter(options)
    }

    const settings = new Settings()

    for (const [key, value] of this) {
      if (accept(value)) {
        settings.add(new Section(key, value.entries()))
      }
    }

    return settings
  }

  importObject (object) {
    for (const [key, value] of Object.entries(object)) {
      this.merge(new Section(key, Object.entries(value)))
    }

    return this
  }

  map (callback) {
    return new Settings(new Map([...this.values()].map(section => {
      const mapped = callback(section)

      return [mapped.key, mapped]
    })))
  }

  merge (section) {
    if (this.has(section.key)) {
      const existing = this.get(section.key)

      for (const [key, value] of section.entries()) {
        existing.set(key, value)
      }
    } else {
      this.add(section)
    }
  }

  resolve (key, done = new Set()) {
    if (!key) {
      for (const key of this.keys()) {
        this.resolve(key)
      }
    } else {
      const section = this.get(key)

      if (!section) {
        return this
      }

      const parentsName = section.get('inherits')

      if (!parentsName) {
        return this
      }

      for (const parentName of parentsName.split(';').map(n => n.trim())) {
        if (done.has(parentName)) {
          return this
        }

        done.add(parentName)

        const parent = new Section()
        parent.prefix = section.prefix
        parent.name = parentName
        parent.scope = section.scope

        // first check section with scope...
        if (!this.has(parent.key)) {
          parent.scope = null
        }

        // ..then section without scope
        if (!this.has(parent.key)) {
          return this
        }

        this.resolve(parent.key, done)

        section.delete('inherits')

        for (const [key, value] of this.get(parent.key).entries()) {
          section.set(key, value)
        }
      }
    }

    return this
  }

  sort () {
    const output = new Settings()

    for (const section of this.values()) {
      const map = new Map()

      for (const key of [...section.keys()].sort()) {
        map.set(key, section.get(key))
      }

      output.add(new Section(section.key, map))
    }

    return output
  }

  toJSON () {
    const json = {}

    for (const [key, value] of this) {
      json[key] = value.toJSON()
    }

    return json
  }
}

export default Settings
