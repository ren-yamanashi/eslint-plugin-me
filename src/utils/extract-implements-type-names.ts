import { AST_NODE_TYPES, AST_TOKEN_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Extracts the name of the type that is implemented by the type alias
 * @param node - The TSTypeAliasDeclaration node to extract the @implements type name from
 * @param sourceCode - The source code to extract comments from
 */
export const extractImplementsTypeNamesFromJsdoc = (
  node: TSESTree.TSTypeAliasDeclaration,
  sourceCode: TSESLint.SourceCode,
): string | null => {
  const comments = getComment(node, sourceCode);

  // TODO: Handling of multiple `@implements`
  const implementsComment = comments.find(
    comment => comment.type === AST_TOKEN_TYPES.Block && comment.value.includes('@implements'),
  );

  if (!implementsComment) return null;

  // NOTE: Extract TypeName from `@implements {TypeName}`
  const implementsRegex = /@implements\s*\{\s*([^}]+)\s*\}/;
  const implementsMatch = implementsRegex.exec(implementsComment.value);
  const typeName = implementsMatch?.[1]?.trim();

  return typeName ?? null;
};

const getComment = (
  node: TSESTree.TSTypeAliasDeclaration,
  sourceCode: TSESLint.SourceCode,
): TSESTree.Comment[] => {
  if (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    const comment = sourceCode.getCommentsBefore(node.parent);
    return comment;
  }
  const comment = sourceCode.getCommentsBefore(node);
  return comment;
};
