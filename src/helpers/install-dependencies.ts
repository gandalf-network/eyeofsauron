/* eslint-disable import/no-extraneous-dependencies */
import { cyan } from 'picocolors'
import { exec } from 'child_process';
import type { PackageManager } from './get-pkg-manager'

const dependencies = ['graphql', 'graphql-tag', 'graphql-request', 'elliptic'];
const devDependencies = ['@types/elliptic'];

export function installDependencies(packageManager: PackageManager) {
    console.log("\nInstalling dependencies:");
    for (const dependency of dependencies)
        console.log(`- ${cyan(dependency)}`);
  
    console.log("\nInstalling devDependencies:");
    for (const dependency of devDependencies)
        console.log(`- ${cyan(dependency)}`);

    const depsInstallCmd = dependencies.join(' ');
    const devDepsInstallCmd = devDependencies.join(' ');

    let installCmd = `npm install ${depsInstallCmd} && npm install -D ${devDepsInstallCmd}`;
  
    switch (packageManager) {
        case 'yarn':
          installCmd = `yarn add ${depsInstallCmd} && yarn add --dev ${devDepsInstallCmd}`;
          break;
        case 'pnpm':
          installCmd = `pnpm add ${depsInstallCmd} && pnpm add --save-dev ${devDepsInstallCmd}`;
          break;
        case 'bun':
          installCmd = `bun add ${depsInstallCmd} ${devDepsInstallCmd}`;
          break;
      }
  
    exec(installCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
      console.log('Project setup complete.');
    });
  }