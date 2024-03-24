import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function generateFiles(folder: string, esModules: boolean) {
  let filesToBeGenerated = [
    {
      filename: './templates/errors.txt',
      location: 'errors.ts',
    },
    {
      filename: './templates/index.txt',
      location: 'index.ts',
    },
  ]

  let completed = true

  if (esModules) {
    filesToBeGenerated = [
      {
        filename: './templates/errors.txt',
        location: 'errors.ts',
      },
      {
        filename: './templates/esm/index.txt',
        location: 'index.ts',
      },
    ]
  }
  
  for (const i of filesToBeGenerated) {
    const textFilePath = join(__dirname, i.filename);
    const tsFilePath = `${folder}/${i.location}`;
    
    try {
      const data = readFileSync(textFilePath, 'utf8')
      const tsContent = `// TypeScript file generated from ${textFilePath} \n ${data}`;
      writeFileSync(tsFilePath, tsContent)
    } catch (error) {
      completed = false
      console.error('Error reading / writing file:', error);
      break
    }
  }

  return completed
}

export default generateFiles;
