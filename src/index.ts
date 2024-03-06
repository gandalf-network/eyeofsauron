#!/usr/bin/env node

import { Command } from 'commander';
import generate from './scripts/generate';
import { getPkgManager } from './helpers/get-pkg-manager'
import { installDependencies } from './helpers/install-dependencies';

const program = new Command();

program
  .name("Eye Of Sauron")
  .version("1.0.0")
  .description('A CLI tool for generating prebuilt functions to access the Gandalf Network')

program
  .command('generate')
  .alias('g')
  .description('Generate the prebuilt funtions')
  .option('-f, --folder <folder>', 'Set the destination folder for generated files')
  .option('-j, --javascript', 'Use when generating Javascript files')
  .action(async (options) => {
    const folder = options.folder ? options.folder: 'eyeofsauron'
    const generateJSFiles = options.javascript
    await generate(folder, generateJSFiles);

    const packageManager = getPkgManager()

    await installDependencies(packageManager)
  });

  program.parse(process.argv);