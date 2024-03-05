import { existsSync, mkdirSync, writeFileSync } from 'fs';
import generateOperationsFromSchema from './generateOperationsFromSchema';
import { WATSON_URL } from '../lib/constants';

import { rimraf } from 'rimraf';

function createEyeOfSauronFolder(folder: string, subfolder: string) {
  if (existsSync(folder)) {
    rimraf.sync(folder);
  }
  mkdirSync(`${folder}`, { recursive: true })
  mkdirSync(`${folder}/${subfolder}`, { recursive: true })
}

async function createOrUpdateQueriesAndMutations(folder: string) {
  const subfolder = 'gql'
  const outputFile = `${folder}/${subfolder}/queries_mutations.graphql`;

  try {
    createEyeOfSauronFolder(folder, subfolder)
  } catch (error) {
    console.log(error, "11111111111")
    return false
  }

  try {
    const queriesAndMutations = await generateOperationsFromSchema(WATSON_URL)
    console.log(WATSON_URL, "fiji111")
  
    writeFileSync(outputFile, queriesAndMutations)
    console.log('Query files updated successfully.');

    return true
  } catch (error: any) {
    console.error('Error updating query files:', error.message, "qkpw");
    return false
  }
}

export default createOrUpdateQueriesAndMutations
