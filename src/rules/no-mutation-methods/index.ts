import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const noMutationMethods = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow array and object mutation methods',
    },
    messages: {
      noMutationMethod:
        'Mutation method "{{method}}" is not allowed. Use immutable alternatives like {{alternative}}.',
      noMutationProperty:
        'Direct mutation of "{{property}}" is not allowed. Use immutable alternatives.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedMethods: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of method names to allow despite being mutating',
          },
          ignoredObjects: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of object names to ignore (e.g., console, process)',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowedMethods: [] as string[],
      ignoredObjects: ['console', 'process'] as string[],
    },
  ],
  create(context, [options]) {
    const mutationMethods = new Map([
      // Array mutation methods
      ['push', 'concat(), [...array, newItem], or array.with()'],
      ['pop', 'array.slice(0, -1) or array.toSpliced(-1, 1)'],
      ['shift', 'array.slice(1) or array.toSpliced(0, 1)'],
      ['unshift', '[newItem, ...array] or array.toSpliced(0, 0, newItem)'],
      ['splice', 'array.toSpliced() or array.slice()'],
      ['sort', 'array.toSorted()'],
      ['reverse', 'array.toReversed()'],
      ['fill', 'array.map() or array.with()'],
      ['copyWithin', 'array.map() with custom logic'],

      // Object mutation methods
      ['assign', 'Object spread syntax {...obj, ...other}'],
      ['defineProperty', 'Object spread with new property'],
      ['defineProperties', 'Object spread with new properties'],
      ['setPrototypeOf', 'Object.create() with desired prototype'],

      // Map/Set mutation methods
      ['set', 'new Map([...map, [key, value]])'],
      ['delete', 'new Map([...map].filter(([k]) => k !== key))'],
      ['clear', 'new Map()'],
      ['add', 'new Set([...set, value])'],
    ]);

    const mutationProperties = new Set([
      'length', // array.length = x
    ]);

    const isIgnoredObject = (objectName: string): boolean => {
      return options.ignoredObjects.includes(objectName);
    };

    const isAllowedMethod = (methodName: string): boolean => {
      return options.allowedMethods.includes(methodName);
    };

    const getObjectName = (node: TSESTree.MemberExpression): string | null => {
      if (node.object.type === AST_NODE_TYPES.Identifier) {
        return node.object.name;
      }
      return null;
    };

    return {
      CallExpression(node) {
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const property = node.callee.property;

        const methodName = property.name;
        const objectName = getObjectName(node.callee);

        // Skip ignored objects or allowed methods
        if ((objectName && isIgnoredObject(objectName)) || isAllowedMethod(methodName)) {
          return;
        }

        // Special case for Object static methods
        if (
          objectName === 'Object' &&
          ['assign', 'defineProperty', 'defineProperties', 'setPrototypeOf'].includes(methodName)
        ) {
          const alternative = mutationMethods.get(methodName);
          context.report({
            node: node.callee.property,
            messageId: 'noMutationMethod',
            data: {
              method: `Object.${methodName}`,
              alternative,
            },
          });
          return; // Skip general mutation method check to avoid duplicate
        }

        // Check for mutation methods
        if (!mutationMethods.has(methodName)) {
          return;
        }

        const alternative = mutationMethods.get(methodName);
        context.report({
          node: node.callee.property,
          messageId: 'noMutationMethod',
          data: {
            method: methodName,
            alternative,
          },
        });
      },

      AssignmentExpression(node) {
        // Check for direct property mutation like array.length = x
        if (node.left.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const property = node.left.property;

        if (property.type === AST_NODE_TYPES.Identifier) {
          const propertyName = property.name;
          const objectName = getObjectName(node.left);

          // Skip ignored objects
          if (objectName && isIgnoredObject(objectName)) {
            return;
          }

          if (mutationProperties.has(propertyName)) {
            context.report({
              node: property,
              messageId: 'noMutationProperty',
              data: {
                property: propertyName,
              },
            });
          }
        }

        // Check for array element assignment like arr[0] = value
        if (
          node.left.property.type === AST_NODE_TYPES.Literal ||
          node.left.property.type === AST_NODE_TYPES.TemplateLiteral
        ) {
          const objectName = getObjectName(node.left);

          // Skip ignored objects
          if (objectName && isIgnoredObject(objectName)) {
            return;
          }

          context.report({
            node: node.left,
            messageId: 'noMutationProperty',
            data: {
              property: 'array/object element',
            },
          });
        }
      },

      UpdateExpression(node) {
        // Check for increment/decrement on array length or object properties
        if (
          node.argument.type !== AST_NODE_TYPES.MemberExpression ||
          node.argument.property.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const property = node.argument.property;

        const propertyName = property.name;
        const objectName = getObjectName(node.argument);

        // Skip ignored objects or non-mutation properties
        if ((objectName && isIgnoredObject(objectName)) || !mutationProperties.has(propertyName)) {
          return;
        }

        context.report({
          node: property,
          messageId: 'noMutationProperty',
          data: {
            property: propertyName,
          },
        });
      },
    };
  },
});
