import { ESLintUtils } from '@typescript-eslint/utils';
import { InterfaceDeclaration, Node, Program } from 'typescript';
import { SYMBOL_FLAGS } from '../constants/ts-internal-flags';
import { extractImplementsTypeNamesFromJsdoc } from '../utils/extract-implements-type-names';
import { findMissingProperties } from '../utils/find-missing-properties';

type InterfaceInfo = {
  readonly name: string;
  readonly node: InterfaceDeclaration;
  readonly filePath: string;
};

export const jsdocRule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Check if type alias properly implements the interface specified in @implements JSDoc tag',
    },
    messages: {
      missingProperty:
        "Property '{{propertyName}}' is missing in type '{{typeName}}' but required by interface '{{interfaceName}}'",
      interfaceNotFound:
        "Interface '{{interfaceName}}' specified in @implements tag was not found in the project",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const program = parserServices.program;
    const checker = program.getTypeChecker();
    const sourceCode = context.sourceCode;

    return {
      TSTypeAliasDeclaration(node) {
        const allInterfaces = collectAllInterfaces(program);
        const implementsTypeName = extractImplementsTypeNamesFromJsdoc(node, sourceCode);
        if (!implementsTypeName) return;

        const targetInterface = allInterfaces.find(({ name }) => name === implementsTypeName);
        if (!targetInterface) {
          context.report({
            node,
            messageId: 'interfaceNotFound',
            data: { interfaceName: implementsTypeName },
          });
          return;
        }

        const implementationType = parserServices.getTypeAtLocation(node);
        const interfaceType = checker.getTypeAtLocation(targetInterface.node);

        const missingProps = findMissingProperties(implementationType, interfaceType, checker);
        for (const propName of missingProps) {
          context.report({
            node,
            messageId: 'missingProperty',
            data: {
              propertyName: propName.name,
              typeName: node.id.name,
              interfaceName: implementsTypeName,
            },
          });
        }
      },
    };
  },
});

const collectAllInterfaces = (program: Program): readonly InterfaceInfo[] => {
  return program
    .getSourceFiles()
    .filter(({ fileName }) => !fileName.includes('node_modules'))
    .flatMap(({ statements, fileName }) =>
      statements.reduce<InterfaceInfo[]>((acc, statement) => {
        if (!isInterfaceDeclaration(statement)) return acc;
        return [
          ...acc,
          {
            name: statement.name.text,
            node: statement,
            filePath: fileName,
          },
        ];
      }, []),
    );
};

const isInterfaceDeclaration = (node: Node): node is InterfaceDeclaration => {
  // NOTE: In order not to make it dependent on the typescript library, it defines its own unions.
  //       Therefore, the type information structures do not match.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return node.kind === SYMBOL_FLAGS.INTERFACE_DECLARATION;
};
