/**
 * Implementing `SyntaxKind` defined in typescript on your own, in order not to include TypeScript in dependencies
 */
export const SYNTAX_KINDS = {
  READONLY_KEYWORD: 148,
  INTERFACE_DECLARATION: 264,
} as const;

/**
 * Implementing `TypeFlags` defined in typescript on your own, in order not to include TypeScript in dependencies
 */
export const TYPE_FLAGS = {
  UNION: 1048576,
};
