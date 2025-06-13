import { ESLintUtils } from '@typescript-eslint/utils';

export const noThrow = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow throw statements',
    },
    messages: {
      noThrow:
        'Throw statements are not allowed. Consider returning error objects or using Result types instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ThrowStatement(node) {
        context.report({
          node,
          messageId: 'noThrow',
        });
      },
    };
  },
});
