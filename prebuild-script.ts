const fs = require('fs');
const path = require('path');
require('dotenv').config();

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const modifiedContent = content.replace(/process\.env\.(\w+)/g, (match, p1) => {
        return JSON.stringify(process.env[p1] || '');
    });
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
}

function main() {
    const pathParam = path.join(__dirname, 'src/lib/constants.ts');
    processFile(pathParam);
}

main();
