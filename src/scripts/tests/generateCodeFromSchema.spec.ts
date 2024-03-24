import { CodegenConfig, generate } from '@graphql-codegen/cli';
import { WATSON_URL } from '../../lib/constants';
import generateCodeFromSchema from '../generateCodeFromSchema';

jest.mock('@graphql-codegen/cli');

describe('generateCodeFromSchema', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const folder = '/some/folder';
  const generateESMFiles = false;

  it('should generate code from schema successfully', async () => {
    const config: CodegenConfig = {
      schema: [{ [WATSON_URL]: {} }],
      documents: [`${folder}/gql/*.graphql`],
      generates: {
        [`${folder}/gql/__generated__/index.ts`]: {
          plugins: [expect.any(String), expect.any(String), expect.any(String)],
          config: {
            esModules: generateESMFiles,
        },
          presetConfig: { gqlTagName: 'gql' },
        },
      },
      config: { rawRequest: true, useTypeImports: true, addTypeName: true },
      ignoreNoDocuments: true,
    };

    const result = await generateCodeFromSchema(folder, generateESMFiles);
    expect(generate).toHaveBeenCalledWith(config);
    expect(result).toBe(true);
  });

  it('should handle errors during code generation', async () => {
    const error = new Error('Error during code generation');
    (generate as jest.MockedFunction<typeof generate>).mockRejectedValueOnce(error);

    const result = await generateCodeFromSchema(folder, generateESMFiles);
    expect(result).toBe(false);
  });
});
