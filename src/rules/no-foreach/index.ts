import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

export const noForeach = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of Array.prototype.forEach',
    },
    messages: {
      noForeach: 'Use `map`,`reduce`,`for...of` or other iteration methods instead of forEach',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression(node) {
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier ||
          node.callee.property.name !== 'forEach'
        ) {
          return;
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.callee.object);
        const type = checker.getTypeAtLocation(tsNode);

        if (!checker.isArrayType(type) && !checker.isTupleType(type)) {
          return;
        }

        context.report({
          node,
          messageId: 'noForeach',
        });
      },
    };
  },
});
