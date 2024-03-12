import { exec as execCallback } from 'child_process';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { promisify } from 'util';

const exec = promisify(execCallback);

async function transpileToJS(dir: string) {
    const compileCommand = `npx babel ${dir} --out-dir ${dir} --presets=@babel/preset-typescript --extensions ".ts,.tsx" --source-maps`;
    try {
        const { stdout, stderr } = await exec(compileCommand);
        console.log(stdout);
        if (stderr !== "") {
          console.error('stderr:', stderr);
          return false
        }

        return deleteTSFiles(dir)
    } catch (error) {
        console.error('Error during compilation:', error);
        return false
    }
}

function deleteTSFiles(dir: string) {
    try {
        const files = readdirSync(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            const stat = statSync(filePath);

            if (stat.isDirectory()) {
                deleteTSFiles(filePath);
            } else if (extname(file) === '.ts') {
                unlinkSync(filePath);
            }
        }
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

export default transpileToJS;
