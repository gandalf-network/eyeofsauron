import { CodegenConfig, generate } from '@graphql-codegen/cli';
import { WATSON_URL } from '../lib/constants';

async function generateCodeFromSchema(folder: string) {
    const config: CodegenConfig = {
        schema: [
            {
                [WATSON_URL]: {},
            },
        ],
        documents: [`${folder}/gql/*.graphql`],
        generates: {
            [`${folder}/gql/__generated__/index.ts`]: {
                plugins: ["typescript", "typescript-operations", "./lib/custom-plugin/index.js"],
                presetConfig: {
                    gqlTagName: 'gql',
                },
            },
        },
        config: {
            rawRequest: true,
            useTypeImports: true,
        },
        ignoreNoDocuments: true,
    };

    try {
        await generate(config)
        return true
    } catch (error) {
        console.log("Could Not Generate GQL Types", error)
        return false
    }
}

export default generateCodeFromSchema
