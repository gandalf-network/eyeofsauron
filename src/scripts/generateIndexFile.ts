import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function generateIndexFile(folder: string) {
  const textFilePath = join(__dirname, 'transformSDK.txt');
  const tsFilePath = `${folder}/index.ts`;
  
  try {
    const data = readFileSync(textFilePath, 'utf8')
    const tsContent = `// TypeScript file generated from ${textFilePath} \n ${data}`;

    writeFileSync(tsFilePath, tsContent)
    return true
  } catch (error) {
    console.error('Error reading / writing file:', error);
    return false;
  }
}

export default generateIndexFile;
