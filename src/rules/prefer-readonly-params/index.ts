import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const preferReadonlyParams = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer readonly modifier on function parameters for immutability',
    },
    messages: {
      preferReadonlyParam: 'Function parameter should be marked as readonly for immutability.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const checkFunctionParameters = (node: TSESTree.FunctionLike): void => {
      for (const param of node.params) {
        // Only check simple identifier parameters with array or object type annotations
        if (param.type !== AST_NODE_TYPES.Identifier || !param.typeAnnotation) {
          continue;
        }

        const typeAnnotation = param.typeAnnotation.typeAnnotation;

        // Check if it's an array or object type that could benefit from readonly
        if (
          typeAnnotation.type !== AST_NODE_TYPES.TSArrayType &&
          typeAnnotation.type !== AST_NODE_TYPES.TSTupleType &&
          typeAnnotation.type !== AST_NODE_TYPES.TSTypeLiteral
        ) {
          continue;
        }

        context.report({
          node: param,
          messageId: 'preferReadonlyParam',
        });
      }
    };

    return {
      FunctionDeclaration(node) {
        checkFunctionParameters(node);
      },
      FunctionExpression(node) {
        checkFunctionParameters(node);
      },
      ArrowFunctionExpression(node) {
        checkFunctionParameters(node);
      },
    };
  },
});
