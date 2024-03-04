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
import { WATSON_URL } from '../constants';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
  extensionsType: string;
}

const additionalExportedTypes = `
export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;
`;

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
    });

    autoBind(this);

    const typeImport = this.config.useTypeImports ? 'import type' : 'import';

    this._additionalImports.push(
      `${typeImport} { GraphQLClient, RequestOptions } from 'graphql-request';`,
    );

    this._additionalImports.push(
        `import { createSign, createPrivateKey, createHash, KeyObject } from 'crypto';`,
    );

    this._additionalImports.push(
        `import { GraphQLClient as GQLClient } from 'graphql-request';`,
    );

    if (this.config.rawRequest) {
      if (this.config.documentMode !== DocumentMode.string) {
        this._additionalImports.push(`import { GraphQLError, print } from 'graphql'`);
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
    console.log
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
          return `${operationName}(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ${
            o.operationResultType
          }; errors?: GraphQLError[]; extensions?: ${
            this.config.extensionsType
          }; headers: Headers; status: number; }> {
            const requestBody = {
                query: ${docVarName},
                variables: {
                  ...variables
                }
            }
            requestHeaders = {...requestHeaders, ...this.addSignatureToHeader(requestBody)}
    return this.withWrapper((wrappedRequestHeaders) => this.client.rawRequest<${
      o.operationResultType
    }>(${docArg}, variables, {...requestHeaders, ...wrappedRequestHeaders}), '${operationName}', '${operationType}', variables);
}`;
        }
        return `${operationName}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, requestHeaders?: GraphQLClientRequestHeaders): Promise<${o.operationResultType}> {
            const requestBody = {
                query: ${docVarName},
                variables: {
                  ...variables
                }
            }
            requestHeaders = {...requestHeaders, ...this.addSignatureToHeader(requestBody)}
  return this.withWrapper((wrappedRequestHeaders) => this.client.request<${
    o.operationResultType
  }>(${docVarName}, variables, {...requestHeaders, ...wrappedRequestHeaders}), '${operationName}', '${operationType}', variables);
}`;
      })
      .filter(Boolean)
      .map(s => indentMultiline(s, 2));

    return `${additionalExportedTypes}

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();
${extraVariables.join('\n')}
export default class Eye {
    private client: GraphQLClient = new GQLClient('${WATSON_URL}');
    private withWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();
    privateKey: KeyObject;

    constructor(privateKey: string) {
        this.privateKey = Eye.generatePrivateKeyFromHex(privateKey)
    }

    ${allPossibleActions.join('\n')}

    private signRequestBody(privateKey: KeyObject, requestBody: any): string {
        const hash = createHash('SHA256').update(JSON.stringify(requestBody)).digest('hex');
        const sign = createSign('SHA256');
        sign.update(hash);
        return sign.sign(privateKey, 'base64');
    }

    private addSignatureToHeader(requestBody: any) {
        const signature = this.signRequestBody(this.privateKey, requestBody)
        const headers = new Headers();
        headers.append('X-Gandalf-Signature', signature);
        return headers
    }
  
    private static generatePrivateKeyFromHex(hexPrivateKey: string): KeyObject {
        const keyBuffer = Buffer.from(hexPrivateKey, 'hex');
        const privateKey = createPrivateKey({
            key: keyBuffer,
            format: 'der',
            type: 'pkcs8',
        });
        return privateKey
    }
}`
  }
}