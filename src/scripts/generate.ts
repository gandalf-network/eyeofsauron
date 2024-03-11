import generateCodeFromSchema from "./generateCodeFromSchema";
import createOrUpdateQueriesAndMutations from "./createOrUpdateQueriesAndMutations";
import generateFiles from "./generateFiles";
import transpileToJs from "./transpileToJs";

async function generate(folder: string, generateJSFiles: boolean) {
    const mutationAndQueriesUpdated = await createOrUpdateQueriesAndMutations(folder)
    if (!mutationAndQueriesUpdated) {
        throw new Error("Could not create or update the mutations and queries")
    }
    
    const gqlTypesGenerated = await generateCodeFromSchema(folder)
    if (!gqlTypesGenerated) {
        throw new Error("Could not generate code from schema")
    }

    const indexFileGenerated = await generateFiles(folder)
    if (!indexFileGenerated) {
        throw new Error("Could not generate files")
    }

    if (generateJSFiles) {
        const transpiledToJS = await transpileToJs(folder)
        if (!transpiledToJS) {
            throw new Error("Could not transpile files to JS")
        }
    }
}

export default generate