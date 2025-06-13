import { ESLintUtils } from '@typescript-eslint/utils';

export const noClass = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow class declarations',
    },
    messages: {
      noClass: 'Class declarations are not allowed. Use functions and objects instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node) {
        context.report({
          node,
          messageId: 'noClass',
        });
      },
    };
  },
});
