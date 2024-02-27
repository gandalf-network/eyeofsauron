import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

function transpileToJS(dir: string): void {
    const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        outDir: dir,
        declaration: true,
        declarationDir: dir,
    };
    const fileNames = getFilesRecursive(dir)
        .filter(fileName => fileName.endsWith('.ts'));

    const program = ts.createProgram(fileNames, compilerOptions);
    const emitResult = program.emit();

    if (emitResult.emitSkipped) {
        console.error('Compilation failed');
    } else {
        console.log('Compilation successful');
    }
}

function getFilesRecursive(dir: string): string[] {
    const files: string[] = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            files.push(...getFilesRecursive(filePath));
        } else {
            files.push(filePath);
        }
    });
    return files;
}

export default transpileToJS;
