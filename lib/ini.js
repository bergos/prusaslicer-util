import { readFile } from 'fs/promises'
import fetch from 'nodeify-fetch'

const rules = {
  floatValue: /^-?[0-9]+\.[0-9]+$/,
  intValue: /^-?[0-9]+$/,
  keyValue: /^([^=]*)=(.*)$/,
  section: /^\[([^\]]*)\]$/
}

async function fromFile (filename) {
  return parse((await readFile(filename)))
}

async function fromURL (url) {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(await res.text())
  }

  return parse(await res.text())
}

function parse (content, { parseValues = true } = {}) {
  const lines = content.toString('utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => !line.startsWith('#'))
    .filter(line => Boolean(line))

  const ini = {}
  let section = ''

  for (const line of lines) {
    if (rules.section.test(line)) {
      section = line.match(rules.section)[1]

      ini[section] = {}
    }

    if (rules.keyValue.test(line)) {
      let [key, value] = line.match(rules.keyValue).slice(1).map(part => part.trim())

      if (parseValues) {
        if (rules.floatValue.test(value)) {
          value = parseFloat(value)
        } else if (rules.intValue.test(value)) {
          value = parseInt(value)
        }
      }

      ini[section][key] = value
    }
  }

  return ini
}

function stringify (ini) {
  const lines = []

  for (const [section, pairs] of Object.entries(ini)) {
    lines.push(`[${section}]`)

    for (const [key, value] of Object.entries(pairs)) {
      lines.push(`${key} = ${value}`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

export {
  fromFile,
  fromURL,
  parse,
  stringify
}
