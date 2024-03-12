/* eslint-disable import/no-extraneous-dependencies */
import { cyan } from 'picocolors'
import { exec } from 'child_process';
import type { PackageManager } from './get-pkg-manager'

const dependencies = {
  "elliptic": "^6.5.5",
  "graphql": "^16.8.1",
  "graphql-request": "^6.1.0",
  "graphql-tag": "^2.12.6",
}

const devDependencies = {
  "@types/elliptic": "^6.4.18",
}

export function installDependencies(packageManager: PackageManager) {
    console.log("\nInstalling dependencies:");
    let depsInstallCmd = "";
    for (const dependency of Object.keys(dependencies)) {
      const installCmd = `${dependency}@${dependencies[dependency as keyof typeof dependencies]}`
      depsInstallCmd = `${depsInstallCmd} ${installCmd}`
      console.log(`- ${cyan(dependency)}`);
    }
  
    console.log("\nInstalling devDependencies:");
    let devDepsInstallCmd = "";
    for (const dependency of Object.keys(devDependencies)) {
      const installCmd = `${dependency}@${devDependencies[dependency as keyof typeof devDependencies]}`
      devDepsInstallCmd = `${devDepsInstallCmd} ${installCmd}`
      console.log(`- ${cyan(dependency)}`);
    }

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