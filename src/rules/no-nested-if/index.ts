import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const noNestedIf = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow nested if statements',
    },
    messages: {
      noNestedIf:
        'Nested if statements are not allowed. Consider using early returns or combining conditions.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const checkForNestedIf = (node: TSESTree.Node, depth = 0): void => {
      if (node.type === AST_NODE_TYPES.IfStatement && depth > 0) {
        context.report({
          node,
          messageId: 'noNestedIf',
        });
        return;
      }

      if (node.type !== AST_NODE_TYPES.IfStatement && node.type !== AST_NODE_TYPES.BlockStatement) {
        return;
      }

      if (node.type === AST_NODE_TYPES.BlockStatement) {
        for (const statement of node.body) {
          checkForNestedIf(statement, depth);
        }
        return;
      }

      checkForNestedIf(node.consequent, depth + 1);

      if (!node.alternate) return;

      checkForNestedIf(node.alternate, depth + 1);
    };

    return {
      IfStatement(node) {
        checkForNestedIf(node);
      },
    };
  },
});
