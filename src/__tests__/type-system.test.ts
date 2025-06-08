import { describe } from 'vitest';
import { jsdocRule } from '../rules/jsdoc';
import { createRuleTester } from './utils/create-rule-tester';

const ruleTester = createRuleTester();

describe('Type System Features', () => {
  // Union types
  ruleTester.run('union types', jsdocRule, {
    valid: [
      {
        name: 'implementation is subset of union',
        code: `
          interface MyInterface {
            prop: string | number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
      },
      {
        name: 'implementation is subset of larger union',
        code: `
          interface MyInterface {
            prop: string | number | boolean;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string | number;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'implementation extends beyond interface union',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string | number;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'string | number',
              expectedType: 'string',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Function types
  ruleTester.run('function types', jsdocRule, {
    valid: [
      {
        name: 'matching function signatures',
        code: `
          interface MyInterface {
            method: (x: number) => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (x: number) => string;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible function signatures',
        code: `
          interface MyInterface {
            method: (x: number) => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (x: string) => string;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'method',
              actualType: '(x: string) => string',
              expectedType: '(x: number) => string',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Array and tuple types
  ruleTester.run('array and tuple types', jsdocRule, {
    valid: [
      {
        name: 'matching array types',
        code: `
          interface MyInterface {
            items: string[];
          }
          /** @implements {MyInterface} */
          type MyType = {
            items: string[];
          }
        `,
      },
      {
        name: 'matching tuple types',
        code: `
          interface MyInterface {
            tuple: [string, number];
          }
          /** @implements {MyInterface} */
          type MyType = {
            tuple: [string, number];
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible array element types',
        code: `
          interface MyInterface {
            items: string[];
          }
          /** @implements {MyInterface} */
          type MyType = {
            items: number[];
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'items',
              actualType: 'number[]',
              expectedType: 'string[]',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
      {
        name: 'wrong tuple order',
        code: `
          interface MyInterface {
            tuple: [string, number];
          }
          /** @implements {MyInterface} */
          type MyType = {
            tuple: [number, string];
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'tuple',
              actualType: '[number, string]',
              expectedType: '[string, number]',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Nested object types
  ruleTester.run('nested object types', jsdocRule, {
    valid: [
      {
        name: 'matching nested objects',
        code: `
          interface MyInterface {
            nested: {
              prop: string;
            };
          }
          /** @implements {MyInterface} */
          type MyType = {
            nested: {
              prop: string;
            };
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible nested property',
        code: `
          interface MyInterface {
            nested: {
              prop: string;
            };
          }
          /** @implements {MyInterface} */
          type MyType = {
            nested: {
              prop: number;
            };
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'nested',
              actualType: '{ prop: number; }',
              expectedType: '{ prop: string; }',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Intersection types
  ruleTester.run('intersection types', jsdocRule, {
    valid: [
      {
        name: 'matching intersection types',
        code: `
          interface A {
            propA: string;
          }
          interface B {
            propB: number;
          }
          interface MyInterface {
            prop: A & B;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: A & B;
          }
        `,
      },
    ],
    invalid: [],
  });

  // Type aliases
  ruleTester.run('type aliases', jsdocRule, {
    valid: [
      {
        name: 'exact type alias match',
        code: `
          type SampleTypeAlias = {
            prop: string;
          }
          interface MyInterface {
            prop: SampleTypeAlias;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: SampleTypeAlias;
          }
        `,
      },
      {
        name: 'structurally equivalent type aliases',
        code: `
          type SampleTypeAlias = {
            prop: string;
          }
          type SampleTypeAlias2 = {
            prop: string;
          }
          interface MyInterface {
            prop: SampleTypeAlias;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: SampleTypeAlias2;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible type aliases',
        code: `
          type SampleTypeAlias = {
            prop: string;
          }
          type SampleTypeAlias2 = {
            prop: number;
          }
          interface MyInterface {
            prop: SampleTypeAlias;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: SampleTypeAlias2;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'SampleTypeAlias2',
              expectedType: 'SampleTypeAlias',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Primitive literal types
  ruleTester.run('primitive literal types', jsdocRule, {
    valid: [
      {
        name: 'string literal types',
        code: `
          interface MyInterface {
            status: "pending" | "completed";
          }
          /** @implements {MyInterface} */
          type MyType = {
            status: "pending" | "completed";
          }
        `,
      },
      {
        name: 'number literal types',
        code: `
          interface MyInterface {
            code: 200 | 404 | 500;
          }
          /** @implements {MyInterface} */
          type MyType = {
            code: 200 | 404 | 500;
          }
        `,
      },
      {
        name: 'boolean literal types',
        code: `
          interface MyInterface {
            flag: true;
          }
          /** @implements {MyInterface} */
          type MyType = {
            flag: true;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible string literal',
        code: `
          interface MyInterface {
            status: "pending";
          }
          /** @implements {MyInterface} */
          type MyType = {
            status: "completed";
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'status',
              actualType: '"completed"',
              expectedType: '"pending"',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Special TypeScript types
  ruleTester.run('special TypeScript types', jsdocRule, {
    valid: [
      {
        name: 'any type',
        code: `
          interface MyInterface {
            prop: any;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: any;
          }
        `,
      },
      {
        name: 'unknown type',
        code: `
          interface MyInterface {
            prop: unknown;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: unknown;
          }
        `,
      },
      {
        name: 'never type',
        code: `
          interface MyInterface {
            prop: never;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: never;
          }
        `,
      },
      {
        name: 'void type',
        code: `
          interface MyInterface {
            prop: void;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: void;
          }
        `,
      },
      {
        name: 'any is assignable to specific types (TypeScript behavior)',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: any;
          }
        `,
      },
      {
        name: 'specific types are assignable to any (TypeScript behavior)',
        code: `
          interface MyInterface {
            prop: any;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
      },
      {
        name: 'specific types are assignable to unknown (TypeScript behavior)',
        code: `
          interface MyInterface {
            prop: unknown;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'never vs string incompatibility',
        code: `
          interface MyInterface {
            prop: never;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'string',
              expectedType: 'never',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Null and undefined handling
  ruleTester.run('null and undefined handling', jsdocRule, {
    valid: [
      {
        name: 'explicit null type',
        code: `
          interface MyInterface {
            prop: null;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: null;
          }
        `,
      },
      {
        name: 'explicit undefined type',
        code: `
          interface MyInterface {
            prop: undefined;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: undefined;
          }
        `,
      },
      {
        name: 'nullable type',
        code: `
          interface MyInterface {
            prop: string | null;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string | null;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'null vs undefined incompatibility',
        code: `
          interface MyInterface {
            prop: null;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: undefined;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'undefined',
              expectedType: 'null',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Index signatures
  ruleTester.run('index signatures', jsdocRule, {
    valid: [
      {
        name: 'string index signature',
        code: `
          interface MyInterface {
            [key: string]: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            [key: string]: string;
          }
        `,
      },
      {
        name: 'number index signature',
        code: `
          interface MyInterface {
            [index: number]: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            [index: number]: string;
          }
        `,
      },
      {
        name: 'mixed properties with index signature',
        code: `
          interface MyInterface {
            specificProp: number;
            [key: string]: string | number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            specificProp: number;
            [key: string]: string | number;
          }
        `,
      },
      {
        name: 'compatible index signature types (assignable)',
        code: `
          interface MyInterface {
            [key: string]: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            [key: string]: "literal";
          }
        `,
      },
      {
        name: 'implementation without index signature (allowed for flexibility)',
        code: `
          interface MyInterface {
            [key: string]: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            specificProp: string;
          }
        `,
      },
    ],
    invalid: [],
  });

  // Method signatures vs function properties
  ruleTester.run('method signatures vs function properties', jsdocRule, {
    valid: [
      {
        name: 'method signature',
        code: `
          interface MyInterface {
            method(): string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method(): string;
          }
        `,
      },
      {
        name: 'function property',
        code: `
          interface MyInterface {
            method: () => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: () => string;
          }
        `,
      },
      {
        name: 'method with parameters',
        code: `
          interface MyInterface {
            method(a: string, b: number): boolean;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method(a: string, b: number): boolean;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible method signature',
        code: `
          interface MyInterface {
            method(): string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method(): number;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'method',
              actualType: '() => number',
              expectedType: '() => string',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Template literal types (non-generic)
  ruleTester.run('template literal types', jsdocRule, {
    valid: [
      {
        name: 'simple template literal',
        code: `
          interface MyInterface {
            prop: \`hello-\${string}\`;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: \`hello-\${string}\`;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible template literal',
        code: `
          interface MyInterface {
            prop: \`hello-\${string}\`;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: \`goodbye-\${string}\`;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: '`goodbye-${string}`',
              expectedType: '`hello-${string}`',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });
});
