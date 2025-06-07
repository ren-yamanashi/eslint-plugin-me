import { describe } from 'vitest';
import { jsdocRule } from '../rules/jsdoc';
import { createRuleTester } from './test-utils';

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
});
