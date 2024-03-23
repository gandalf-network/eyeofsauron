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
  .option('--ts, --typescript', 'Initialize as a TypeScript project.')
  .option('--js, --javascript', 'Initialize as a JavaScript project. (default)')
  .allowUnknownOption()
  .action(async (cliFlags) => {
    let { folder, typescript } = cliFlags;
    let generateJSFiles = !typescript

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
        }
      ]);
      folder = answers.folder;
      generateJSFiles = answers.language === 'javascript';
    }

    await generate(folder, generateJSFiles);
  });

program.parse(process.argv);