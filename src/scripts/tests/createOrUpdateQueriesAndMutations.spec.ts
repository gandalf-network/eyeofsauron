import { existsSync, mkdirSync, writeFileSync } from 'fs';
import generateOperationsFromSchema from '../generateOperationsFromSchema';
import { rimraf } from 'rimraf';

import createOrUpdateQueriesAndMutations from '../createOrUpdateQueriesAndMutations';

jest.mock('fs');
jest.mock('../generateOperationsFromSchema');
jest.mock('rimraf');

describe('createOrUpdateQueriesAndMutations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const folder = '/some/folder';

  it('should create or update queries and mutations successfully', async () => {
    const subfolder = 'gql';
    const outputFile = `${folder}/${subfolder}/queries_mutations.graphql`;
    const queriesAndMutations = 'mocked queries and mutations';
    
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    (generateOperationsFromSchema as jest.Mock).mockResolvedValueOnce(queriesAndMutations);

    const result = await createOrUpdateQueriesAndMutations(folder);

    expect(result).toBe(true);
    expect(rimraf.sync).toHaveBeenCalledWith(folder);
    expect(mkdirSync).toHaveBeenCalledWith(folder, { recursive: true });
    expect(mkdirSync).toHaveBeenCalledWith(`${folder}/${subfolder}`, { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(outputFile, queriesAndMutations);
  });

  it('should handle errors during folder creation', async () => {

    (existsSync as jest.Mock).mockReturnValueOnce(true);
    (rimraf.sync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Error during folder deletion');
    });
    const result = await createOrUpdateQueriesAndMutations(folder);
    expect(result).toBe(false);
  });

  it('should handle errors during generating queries and mutations', async () => {

    (existsSync as jest.Mock).mockReturnValueOnce(true);
    (generateOperationsFromSchema as jest.Mock).mockRejectedValueOnce(new Error('Error during query generation'));

    const result = await createOrUpdateQueriesAndMutations(folder);

    expect(result).toBe(false);
  });
});
