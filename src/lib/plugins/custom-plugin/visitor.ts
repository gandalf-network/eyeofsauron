import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  getConfigValue,
  indentMultiline,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { RawGraphQLRequestPluginConfig } from './config.js';
import { WATSON_URL } from '../../constants.js';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
  extensionsType: string;
  esModules: boolean;
}

let additionalExportedTypes = `
export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;
`;

additionalExportedTypes = additionalExportedTypes + `
  export type EyeInput = {
    privateKey: string;
  };
`
export class GraphQLRequestVisitor extends ClientSideBaseVisitor<
  RawGraphQLRequestPluginConfig,
  GraphQLRequestPluginConfig
> {
  private _externalImportPrefix: string;
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: RawGraphQLRequestPluginConfig,
  ) {
    super(schema, fragments, rawConfig, {
      rawRequest: getConfigValue(rawConfig.rawRequest, false),
      extensionsType: getConfigValue(rawConfig.extensionsType, 'any'),
      esModules: getConfigValue(rawConfig.esModules, false),
    });

    autoBind(this);

    const typeImport = this.config.useTypeImports ? 'import type' : 'import';

    this._additionalImports.push(
      `${typeImport} { GraphQLClient, RequestOptions } from 'graphql-request';`,
    );

    this._additionalImports.push(
        `import { createHash } from 'crypto';`,
    );

    this._additionalImports.push(
        `import { GraphQLClient as GQLClient } from 'graphql-request';`,
    );
    
    if (this.config.esModules) {
      this._additionalImports.push(
        `import pkg from 'elliptic';`,
      );
      this._additionalImports.push(
        `const { ec: EC } = pkg;`,
      );
      this._additionalImports.push(
        `import { GandalfErrorCode, GandalfError, handleErrors } from '../../errors.js';`,
      );
    } else {
      this._additionalImports.push(
        `import { ec as EC } from 'elliptic';`,
      );
      this._additionalImports.push(
        `import { GandalfErrorCode, GandalfError, handleErrors } from '../../errors';`,
      );
    }
    if (this.config.rawRequest) {
      if (this.config.documentMode !== DocumentMode.string) {
        this._additionalImports.push(`import { print } from 'graphql'`);
      } else {
        this._additionalImports.push(`import { GraphQLError } from 'graphql'`);
      }
    }

    this._additionalImports.push(
      `type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];`,
    );

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : '';
  }
  // @ts-ignore
  public OperationDefinition(node: OperationDefinitionNode) {
    const operationName = node.name?.value;

    if (!operationName) {
      // eslint-disable-next-line no-console
      console.warn(
        `Anonymous GraphQL operation was ignored in "typescript-graphql-request", please make sure to name your operation: `,
        print(node),
      );

      return null;
    }

    return super.OperationDefinition(node);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
  ): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });
    // @ts-ignore
    return null;
  }

  private getDocumentNodeVariable(documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external
      ? `Operations.${documentVariableName}`
      : documentVariableName;
  }

  public get sdkContent(): string {
    const extraVariables: string[] = [];
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const operationType = o.node.operation;
        // @ts-ignore
        const operationName = o.node.name.value;
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(
            v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue,
          );
        const docVarName = this.getDocumentNodeVariable(o.documentVariableName);

        if (this.config.rawRequest) {
          let docArg = docVarName;
          if (this.config.documentMode !== DocumentMode.string) {
            docArg = `${docVarName}String`;
            extraVariables.push(`const ${docArg} = print(${docVarName});`);
          }
          return `async ${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, requestHeaders?: GraphQLClientRequestHeaders) {
  const requestBody = {
    query: ${docVarName}String,
    variables: {
      ...variables
    },
    operationName: '${operationName}'
  }
  const headers = await this.addSignatureToHeader(requestBody)
  requestHeaders = {...requestHeaders, ...headers}
  try {
    const { data } = await this.withWrapper((wrappedRequestHeaders) => this.client.rawRequest<${
      o.operationResultType
    }>(${docArg}, variables, {...requestHeaders, ...wrappedRequestHeaders}), '${operationName}', '${operationType}', variables);
    return {
      data: data['${operationName}'],
    };
  } catch (error: any) {
    throw handleErrors(error)
  }
}`;
        }
        return `${operationName}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, requestHeaders?: GraphQLClientRequestHeaders): Promise<${o.operationResultType}> {
  return this.withWrapper((wrappedRequestHeaders) => this.client.request<${
    o.operationResultType
  }>(${docVarName}, variables, {...requestHeaders, ...wrappedRequestHeaders}), '${operationName}', '${operationType}', variables);
}`;
      })
      .filter(Boolean)
      .map(s => indentMultiline(s, 2));

    return `${additionalExportedTypes}

${extraVariables.join('\n')}
const ec = new EC('secp256k1');
export default class Eye {
  private client: GraphQLClient = new GQLClient('${WATSON_URL}');
  private withWrapper: SdkFunctionWrapper = (action) => action();
  privateKey: string;

  constructor(input: EyeInput) {
    if (/^0x/i.test(input.privateKey)) {
      input.privateKey = input.privateKey.slice(2)
    }
    this.privateKey = input.privateKey
  }

  private async signRequestBody(requestBody: any): Promise<string> {
    const privateKey = Eye.generatePrivateKeyFromHex(this.privateKey)
    try {
      const hash = createHash('sha256').update(JSON.stringify(requestBody)).digest();
      const signature = privateKey.sign(hash);
      const signatureDer = signature.toDER();
      const signatureB64 = Buffer.from(signatureDer).toString('base64');
      return signatureB64
    } catch (error: any) {
        throw new GandalfError(
          error.message + ' verify your private key', 
          GandalfErrorCode.InvalidSignature,
        )
    }
  }

  private async addSignatureToHeader(requestBody: any) {
    const signature = await this.signRequestBody(requestBody);
    const headers: GraphQLClientRequestHeaders = {
        'X-Gandalf-Signature': signature,
    };
    return headers;
  }

  private static generatePrivateKeyFromHex(hexPrivateKey: string): EC.KeyPair {
    try {
      const key = ec.keyFromPrivate(hexPrivateKey, 'hex');
      return key;
    } catch (error: any) {
      throw new GandalfError(
        error.message + ' verify your private key', 
        GandalfErrorCode.InvalidSignature,
      )
    }
  } \n
  ${allPossibleActions.join('\n')}
}`
  }
}