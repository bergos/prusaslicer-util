#!/usr/bin/env node

import { Command } from 'commander/esm.mjs'
import Config from '../lib/Config.js'
import loadDefaultFilaments from '../lib/defaultFilaments.js'

const program = new Command()

program
  .command('ini')
  .option('--default-filaments [scope]', 'import default filaments')
  .option('--filter <section>', 'only export the given section')
  .option('--resolve []', 'resolve inherit property')
  .option('--sort-properties', 'sort the properties')
  .argument('<files...>')
  .action(async (filenames, { defaultFilaments, filter, resolve, sortProperties }) => {
    let config = new Config()

    for (const filename of filenames) {
      config.import(await Config.fromFile(filename))
    }

    if (defaultFilaments) {
      config.import(await loadDefaultFilaments({
        scope: typeof defaultFilaments === 'string' && defaultFilaments
      }))
    }

    if (resolve) {
      config = new Config(config.settings.resolve(typeof resolve === 'string' && resolve))
    }

    if (filter) {
      config = new Config(config.settings.filter(section => section.key === filter))
    }

    if (sortProperties) {
      config = new Config(config.settings.sort())
    }

    process.stdout.write(`${config.toString()}\n`)
  })

program.parse(process.argv)
