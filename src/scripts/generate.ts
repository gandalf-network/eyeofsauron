import generateCodeFromSchema from "./generateCodeFromSchema";
import createOrUpdateQueriesAndMutations from "./createOrUpdateQueriesAndMutations";
import generateFiles from "./generateFiles";
import transpileToJs from "./transpileToJs";
import { getPkgManager } from "../helpers/get-pkg-manager";
import { installDependencies } from "../helpers/install-dependencies";

async function generate(folder: string, generateJSFiles: boolean, esModules: boolean) {
    const mutationAndQueriesUpdated = await createOrUpdateQueriesAndMutations(folder)
    if (!mutationAndQueriesUpdated) {
        throw new Error("Could not create or update the mutations and queries")
    }
    
    const gqlTypesGenerated = await generateCodeFromSchema(folder, esModules)
    if (!gqlTypesGenerated) {
        throw new Error("Could not generate code from schema")
    }

    const indexFileGenerated = await generateFiles(folder, esModules)
    if (!indexFileGenerated) {
        throw new Error("Could not generate files")
    }

    const packageManager = getPkgManager()

    const depsInstalled = await installDependencies(packageManager, generateJSFiles)
    if (!depsInstalled.success) {
      console.log(depsInstalled.message)
      throw new Error("Unable to install dependencies")
    }

    if (generateJSFiles) {
      await transpileToJs(folder, esModules)
    }

    console.log(depsInstalled.message)
    console.log("Setup Complete")
}

export default generate