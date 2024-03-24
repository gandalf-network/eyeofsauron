#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import generate from './scripts/generate';

const program = new Command();

program
  .name("Eye Of Sauron")
  .version("1.0.0")
  .description('A CLI tool for generating prebuilt functions to access the Gandalf Network');

program
  .command('generate')
  .alias('g')
  .description('Generate the prebuilt functions')
  .option('-f, --folder <folder>', 'Set the destination folder for the generated files')
  .option('-ts, --typescript', 'Initialize as a TypeScript project.')
  .option('-esm, --esModules', 'Initialize as an ESModules JavaScript project. i.e [ import Eye, { Source } from "./eyeofsauron/index.js" ]')
  .option('-c, --commonJS', 'Initialize as a CommonJS JavaScript project. i.e [ const Eye = require("./eyeofsauron").default ]')
  .allowUnknownOption()
  .action(async (cliFlags) => {
    let { folder, typescript, commonJS } = cliFlags;
    let generateJSFiles = !typescript
    let generateESMFiles = generateJSFiles && !commonJS

    if (!folder) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'folder',
          message: 'Set the destination folder for the generated files:',
          default: 'eyeofsauron',
        },
        {
          type: 'list',
          name: 'language',
          message: 'Select the language for generating the files:',
          choices: ['javascript', 'typescript'],
          default: 'javascript',
        },
        {
          type: 'list',
          name: 'moduleSystem',
          message: 'Select the Javascript Module system for generating the JS files:',
          choices: [
            'ESModules { import syntax: import Eye, { Source } from "./eyeofsauron/index.js" }', 
            'CommonJS { import syntax: const Eye = require("./eyeofsauron").default }'
          ],
          default: 'ESModules',
          when: (answers) => answers.language === 'javascript',
        },
      ]);
      
      folder = answers.folder;
      generateJSFiles = answers.language === 'javascript'
      generateESMFiles = generateJSFiles && answers.moduleSystem === 'ESModules';
    }

    await generate(folder, generateJSFiles, generateESMFiles);
  });

program.parse(process.argv);