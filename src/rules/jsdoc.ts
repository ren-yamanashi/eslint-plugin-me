import { ESLintUtils } from '@typescript-eslint/utils';
import { InterfaceDeclaration, Node, Program } from 'typescript';
import { SYMBOL_FLAGS } from '../constants/ts-internal-flags';
import { extractImplementsTypeNamesFromJsdoc } from '../utils/extract-implements-type-names';
import { findIncompatibleProperties, findMissingProperties } from '../utils/find-properties';

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
      wrongType:
        "Property '{{propertyName}}' has type '{{actualType}}' but interface '{{interfaceName}}' expects '{{expectedType}}'",
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

        // NOTE: check if the interface exists
        // Extract base interface name (remove generic type parameters)
        const baseInterfaceName = extractBaseInterfaceName(implementsTypeName);
        const targetInterface = allInterfaces.find(({ name }) => name.text === baseInterfaceName);
        if (!targetInterface) {
          context.report({
            node,
            messageId: 'interfaceNotFound',
            data: { interfaceName: implementsTypeName },
          });
          return;
        }

        const implementationType = parserServices.getTypeAtLocation(node);
        const interfaceType = checker.getTypeAtLocation(targetInterface);

        // NOTE: check missing properties
        const missingProps = findMissingProperties(implementationType, interfaceType, checker);
        for (const prop of missingProps) {
          context.report({
            node,
            messageId: 'missingProperty',
            data: {
              propertyName: prop.name,
              typeName: node.id.name,
              interfaceName: implementsTypeName,
            },
          });
        }

        // NOTE: check incompatible properties
        const incompatibleProps = findIncompatibleProperties(
          implementationType,
          interfaceType,
          checker,
        );
        for (const prop of incompatibleProps) {
          context.report({
            node,
            messageId: 'wrongType',
            data: {
              propertyName: prop.name,
              actualType: prop.actual,
              expectedType: prop.expected,
              interfaceName: implementsTypeName,
            },
          });
        }
      },
    };
  },
});

/**
 * Extract base interface name from generic type specification
 * @param typeName - Type name that might include generic parameters (e.g., "MyInterface<string>")
 * @returns Base interface name without generic parameters (e.g., "MyInterface")
 */
const extractBaseInterfaceName = (typeName: string): string => {
  const genericIndex = typeName.indexOf('<');
  return genericIndex === -1 ? typeName : typeName.substring(0, genericIndex);
};

const collectAllInterfaces = (program: Program): readonly InterfaceDeclaration[] => {
  return program
    .getSourceFiles()
    .filter(({ fileName }) => !fileName.includes('node_modules'))
    .flatMap(({ statements }) =>
      statements.reduce<InterfaceDeclaration[]>((acc, statement) => {
        if (!isInterfaceDeclaration(statement)) return acc;
        return [...acc, statement];
      }, []),
    );
};

const isInterfaceDeclaration = (node: Node): node is InterfaceDeclaration => {
  // NOTE: In order not to make it dependent on the typescript library, it defines its own unions.
  //       Therefore, the type information structures do not match.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return node.kind === SYMBOL_FLAGS.INTERFACE_DECLARATION;
};
