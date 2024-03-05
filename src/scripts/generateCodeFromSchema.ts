import { CodegenConfig, generate } from '@graphql-codegen/cli';
import { WATSON_URL } from '../lib/constants';
import { join } from 'path';

async function generateCodeFromSchema(folder: string) {
    const customPluginFilePath = join(__dirname, '../lib/plugins/custom-plugin/index.js');
    const typescriptPluginFilePath = join(__dirname, '../lib/plugins/typescript/index.js');
    const operationsPluginFilePath = join(__dirname, '../lib/plugins/operations/index.js');
    const config: CodegenConfig = {
        schema: [
            {
                [WATSON_URL]: {},
            },
        ],
        documents: [`${folder}/gql/*.graphql`],
        generates: {
            [`${folder}/gql/__generated__/index.ts`]: {
                plugins: [typescriptPluginFilePath, operationsPluginFilePath, customPluginFilePath],
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
