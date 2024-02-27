import generateCodeFromSchema from "./generateCodeFromSchema";
import createOrUpdateQueriesAndMutations from "./createOrUpdateQueriesAndMutations";
import generateIndexFile from "./generateIndexFile";
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

    const indexFileGenerated = await generateIndexFile(folder)
    if (!indexFileGenerated) {
        throw new Error("Could not index file")
    }

    if (generateJSFiles) {
        transpileToJs(folder)
    }
}

export default generate