/* eslint-disable import/no-extraneous-dependencies */
import { cyan } from 'picocolors'
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import type { PackageManager } from './get-pkg-manager';

const exec = promisify(execCallback);

const dependencies = {
  "elliptic": "^6.5.5",
  "graphql": "^16.8.1",
  "graphql-request": "^6.1.0",
  "graphql-tag": "^2.12.6",
}

let devDependencies: {} = {
  "@types/elliptic": "^6.4.18",
}

export async function installDependencies(packageManager: PackageManager, generateJSFiles: boolean) {
    console.log("\nInstalling dependencies:");
    let depsInstallCmd = "";
    for (const dependency of Object.keys(dependencies)) {
      const installCmd = `${dependency}@${dependencies[dependency as keyof typeof dependencies]}`
      depsInstallCmd = `${depsInstallCmd} ${installCmd}`
      console.log(`- ${cyan(dependency)}`);
    }
    
    if (generateJSFiles) {
      devDependencies = {
        ...devDependencies,
          "@babel/preset-env": "^7.24.0",
          "@babel/preset-typescript": "^7.23.3",
      }
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
  
    const { stdout, stderr } = await exec(installCmd);
    if (stderr !== "") {
      return {success: false, message: stderr}
    }
    return {success: true, message: stdout}
  }
  