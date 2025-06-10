import { ESLintUtils } from '@typescript-eslint/utils';
import { InterfaceDeclaration, Node, Program } from 'typescript';
import { SYNTAX_KINDS } from '../../shared/constants/ts-internal-flags';
import { extractImplementsTypeNamesFromJsdoc } from './extract-implements-type-names';
import { findIncompatibleProperties, findMissingProperties } from './find-properties';

export const typeImplementsInterface = ESLintUtils.RuleCreator.withoutDocs({
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
      unsupportedGeneric:
        "Generic interfaces are not supported. Interface '{{interfaceName}}' contains generic type parameters.",
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

        // NOTE: Check for generic type usage (not supported)
        if (implementsTypeName.includes('<')) {
          context.report({
            node,
            messageId: 'unsupportedGeneric',
            data: { interfaceName: implementsTypeName },
          });
          return;
        }

        // NOTE: Check if the interface exists
        const targetInterface = allInterfaces.find(({ name }) => name.text === implementsTypeName);
        if (!targetInterface) {
          context.report({
            node,
            messageId: 'interfaceNotFound',
            data: { interfaceName: implementsTypeName },
          });
          return;
        }

        // NOTE: Check if the interface itself has generic type parameters (not supported)
        if (targetInterface.typeParameters?.length) {
          context.report({
            node,
            messageId: 'unsupportedGeneric',
            data: { interfaceName: implementsTypeName },
          });
          return;
        }

        // NOTE: Get types using the correct TypeScript API
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const implementationType = checker.getTypeAtLocation(tsNode);
        const interfaceType = checker.getTypeAtLocation(targetInterface);

        // NOTE: Check missing properties
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

        // NOTE: Check incompatible properties
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
 * Collect all interface declarations from the program
 * @param program - TypeScript program
 * @returns Array of interface declarations with their names
 */
const collectAllInterfaces = (program: Program): InterfaceDeclaration[] => {
  return program
    .getSourceFiles()
    .filter(({ fileName }) => !fileName.includes('node_modules'))
    .reduce<InterfaceDeclaration[]>(
      (interfaces, sourceFile) => [...interfaces, ...collectInterfacesFromNode(sourceFile)],
      [],
    );
};

/**
 * Recursively collect interface declarations from a node
 * @param node - TypeScript node to traverse
 * @returns Array of interface declarations found in the node
 */
const collectInterfacesFromNode = (node: Node): InterfaceDeclaration[] => {
  return node
    .getChildren()
    .reduce<
      InterfaceDeclaration[]
    >((acc, child) => [...acc, ...collectInterfacesFromNode(child)], isInterfaceDeclaration(node) ? [node] : []);
};

const isInterfaceDeclaration = (node: Node): node is InterfaceDeclaration => {
  // NOTE: In order not to make it dependent on the typescript library, it defines its own unions.
  //       Therefore, the type information structures do not match.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return node.kind === SYNTAX_KINDS.INTERFACE_DECLARATION;
};
