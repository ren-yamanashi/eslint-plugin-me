import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const noSideEffectInArrayMethods = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow side effects in array methods like map, filter, reduce',
    },
    messages: {
      noSideEffect:
        'Side effects are not allowed in array methods like map, filter, reduce. Consider using forEach or a for loop instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const arrayMethods = new Set([
      'map',
      'filter',
      'reduce',
      'reduceRight',
      'find',
      'findIndex',
      'some',
      'every',
    ]);

    const hasSideEffect = (node: TSESTree.Node): boolean => {
      switch (node.type) {
        case AST_NODE_TYPES.AssignmentExpression:
        case AST_NODE_TYPES.UpdateExpression:
        case AST_NODE_TYPES.ThrowStatement:
          return true;
        case AST_NODE_TYPES.CallExpression: {
          if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
            return false;
          }

          const object = node.callee.object;
          const property = node.callee.property;

          if (object.type === AST_NODE_TYPES.Identifier && object.name === 'console') {
            return true;
          }

          if (
            property.type === AST_NODE_TYPES.Identifier &&
            ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(property.name)
          ) {
            return true;
          }

          return false;
        }
        default:
          return false;
      }
    };

    const checkForSideEffects = (node: TSESTree.Node): boolean => {
      if (hasSideEffect(node)) {
        return true;
      }

      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        node.type === AST_NODE_TYPES.FunctionExpression
      ) {
        if (node.body.type === AST_NODE_TYPES.BlockStatement) {
          return node.body.body.some(stmt => checkForSideEffects(stmt));
        } else {
          return checkForSideEffects(node.body);
        }
      }

      if (node.type === AST_NODE_TYPES.IfStatement) {
        return (
          checkForSideEffects(node.consequent) ||
          (node.alternate ? checkForSideEffects(node.alternate) : false)
        );
      }

      if (node.type === AST_NODE_TYPES.ExpressionStatement) {
        return checkForSideEffects(node.expression);
      }

      return false;
    };

    return {
      CallExpression(node) {
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier ||
          !arrayMethods.has(node.callee.property.name)
        ) {
          return;
        }

        const callback = node.arguments[0];
        if (
          (callback.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
            callback.type !== AST_NODE_TYPES.FunctionExpression) ||
          !checkForSideEffects(callback)
        ) {
          return;
        }

        context.report({
          node: callback,
          messageId: 'noSideEffect',
        });
      },
    };
  },
});
