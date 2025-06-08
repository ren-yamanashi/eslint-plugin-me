import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

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
    {
      name: 'matching function signatures. but not matching parameter names',
      code: `
          interface MyInterface {
            method: (x: number) => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (y: number) => string;
          }
        `,
    },
    {
      name: 'function with optional parameter',
      code: `
          interface MyInterface {
            method: (x?: number) => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (x?: number) => string;
          }
        `,
    },
    {
      name: 'function with rest parameters',
      code: `
          interface MyInterface {
            method: (...args: number[]) => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (...args: number[]) => string;
          }
        `,
    },
    {
      name: 'function with generic type',
      code: `
          interface MyInterface {
            method: <T>(x: T) => T;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: <T>(x: T) => T;
          }
        `,
    },
    {
      name: 'function with void return type',
      code: `
          interface MyInterface {
            method: (x: number) => void;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (x: number) => void;
          }
        `,
    },
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
    {
      name: 'incompatible function with optional parameter',
      code: `
          interface MyInterface {
            method: (x?: number) => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (x: number) => string;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'method',
            actualType: '(x: number) => string',
            expectedType: '(x?: number | undefined) => string',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
    {
      name: 'incompatible function with rest parameters',
      code: `
          interface MyInterface {
            method: (...args: number[]) => string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: (x: number[]) => string;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'method',
            actualType: '(x: number[]) => string',
            expectedType: '(...args: number[]) => string',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
    {
      name: 'incompatible function with generic type',
      code: `
          interface MyInterface {
            method: <T>(x: T) => T;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method: <T>(x: number) => T;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'method',
            actualType: '<T>(x: number) => T',
            expectedType: '<T>(x: T) => T',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
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
