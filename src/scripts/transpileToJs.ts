import * as babel from "@babel/core";
import * as fs from "fs";
import * as path from "path";

async function transpileToJS(dir: string, esModules: boolean): Promise<void> {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      await transpileToJS(fullPath, esModules);
    } else if (/\.(ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let presets: babel.PluginItem[] = [
        ["@babel/preset-env", { modules: "commonjs" }],
        "@babel/preset-typescript",
      ]
      if (esModules) {
        presets = [
            ["@babel/preset-env", { modules: false}],
            "@babel/preset-typescript",
        ]
      }
      const output = await babel.transformAsync(content, {
        presets,
        sourceMaps: true,
        filename: fullPath,
      });

      if (output && output.code) {
        const outputFilePath = fullPath.replace(/\.(ts|tsx)$/, '.js');
        fs.writeFileSync(outputFilePath, output.code as string);
        if (output.map) {
          const mapFilePath = `${outputFilePath}.map`;
          fs.writeFileSync(mapFilePath, JSON.stringify(output.map));
        }

        fs.unlinkSync(fullPath)
      }
    }
  }
}

export default transpileToJS;