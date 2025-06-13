import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const preferArrowFunction = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer arrow functions over function declarations and expressions',
    },
    messages: {
      preferArrowFunction: 'Use arrow functions instead of function declarations or expressions.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const isExportedFunction = (node: TSESTree.FunctionDeclaration): boolean => {
      return node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration;
    };

    const isObjectMethod = (node: TSESTree.FunctionExpression): boolean => {
      return node.parent.type === AST_NODE_TYPES.Property;
    };

    return {
      FunctionDeclaration(node) {
        if (isExportedFunction(node)) return;
        context.report({
          node,
          messageId: 'preferArrowFunction',
        });
      },

      FunctionExpression(node) {
        if (isObjectMethod(node)) return;
        context.report({
          node,
          messageId: 'preferArrowFunction',
        });
      },
    };
  },
});
