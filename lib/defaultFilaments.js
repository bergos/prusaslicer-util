import * as INI from './ini.js'
import Section from './Section.js'
import Settings from './Settings.js'

const url = 'https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/PrusaResearch.ini'

const excludeProperties = new Set([
  'compatible_printers',
  'compatible_printers_condition',
  'end_filament_gcode',
  'filament_ramming_parameters',
  'start_filament_gcode'
])

function keyCompare (a, b) {
  // put inherits to the top
  if (a === 'inherits') {
    return -1
  }

  if (b === 'inherits') {
    return 1
  }

  return a.localeCompare(b)
}

function extract (settings) {
  const isUsed = name => {
    const sections = [...settings.values()]
    const children = sections.filter(section => section.get('inherits') === name)

    // it's used if there is any child that is non-abstract
    if (children.some(section => !section.abstract)) {
      return true
    }

    // if there are only abstract children, do a nested check
    return children.some(section => isUsed(section.abstractName))
  }

  settings = settings.filter({ prefix: 'filament', scope: null })

  return settings
    .map(section => {
      const keys = [...section.keys()]
        .filter(key => !excludeProperties.has(key))
        .sort(keyCompare)

      const map = new Map()

      for (const key of keys) {
        map.set(key, section.get(key))
      }

      return new Section(section.key, map)
    })
    .filter(section => {
      if (!section.abstract) {
        return true
      }

      return isUsed(section.abstractName)
    })
}

async function defaultFilaments ({ scope } = {}) {
  const settings = (new Settings().importObject(await INI.fromURL(url)))

  let filaments = extract(settings)

  if (scope) {
    filaments = filaments.map(section => {
      if (!section.abstract) {
        section.scope = scope
      }

      return section
    })
  }

  return filaments
}

export default defaultFilaments
