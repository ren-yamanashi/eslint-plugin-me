import { describe } from 'vitest';
import { jsdocRule } from '../rules/jsdoc';
import { createRuleTester } from './utils/create-rule-tester';

const ruleTester = createRuleTester();

describe('TypeScript Language Features', () => {
  // Optional properties
  ruleTester.run('optional properties', jsdocRule, {
    valid: [
      {
        name: 'interface optional, implementation required (allowed)',
        code: `
          interface MyInterface {
            prop?: string;
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
        name: 'interface required, implementation optional (not allowed)',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop?: string;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'string | undefined',
              expectedType: 'string',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Interface inheritance
  ruleTester.run('interface inheritance', jsdocRule, {
    valid: [
      {
        name: 'implementing extended interface',
        code: `
          interface BaseInterface {
            baseProp: string;
          }
          interface MyInterface extends BaseInterface {
            prop: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            baseProp: string;
            prop: number;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'missing inherited property',
        code: `
          interface BaseInterface {
            baseProp: string;
          }
          interface MyInterface extends BaseInterface {
            prop: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: number;
          }
        `,
        errors: [
          {
            messageId: 'missingProperty',
            data: {
              propertyName: 'baseProp',
              typeName: 'MyType',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Declaration merging
  ruleTester.run('declaration merging', jsdocRule, {
    valid: [
      {
        name: 'implementing merged interface',
        code: `
          interface MyInterface {
            prop: string;
          }
          interface MyInterface {
            anotherProp: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
            anotherProp: number;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'missing property from merged interface',
        code: `
          interface MyInterface {
            prop: string;
          }
          interface MyInterface {
            anotherProp: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
        errors: [
          {
            messageId: 'missingProperty',
            data: {
              propertyName: 'anotherProp',
              typeName: 'MyType',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Export/Import scenarios
  ruleTester.run('module system', jsdocRule, {
    valid: [
      {
        name: 'exported interface and type',
        code: `
          export interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          export type MyType = {
            prop: string;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'exported interface with missing property in exported type',
        code: `
          export interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          export type MyType = {
            _prop: string;
          }
        `,
        errors: [
          {
            messageId: 'missingProperty',
            data: {
              propertyName: 'prop',
              typeName: 'MyType',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Error handling and edge cases
  ruleTester.run('error handling and edge cases', jsdocRule, {
    valid: [
      {
        name: 'interface with complex inheritance chain',
        code: `
          interface A {
            a: string;
          }
          interface B extends A {
            b: number;
          }
          interface C extends B {
            c: boolean;
          }
          /** @implements {C} */
          type MyType = {
            a: string;
            b: number;
            c: boolean;
          }
        `,
      },
      {
        name: 'interface with overloaded methods',
        code: `
          interface MyInterface {
            method(x: string): string;
            method(x: number): number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            method(x: string): string;
            method(x: number): number;
          }
        `,
      },
      {
        name: 'constructor signatures',
        code: `
          interface MyInterface {
            new (value: string): { prop: string };
          }
          /** @implements {MyInterface} */
          type MyType = {
            new (value: string): { prop: string };
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'missing property from deep inheritance',
        code: `
          interface A {
            a: string;
          }
          interface B extends A {
            b: number;
          }
          interface C extends B {
            c: boolean;
          }
          /** @implements {C} */
          type MyType = {
            a: string;
            c: boolean;
          }
        `,
        errors: [
          {
            messageId: 'missingProperty',
            data: {
              propertyName: 'b',
              typeName: 'MyType',
              interfaceName: 'C',
            },
          },
        ],
      },
    ],
  });

  // Property order shouldn't matter
  ruleTester.run('property order independence', jsdocRule, {
    valid: [
      {
        name: 'different property order',
        code: `
          interface MyInterface {
            first: string;
            second: number;
            third: boolean;
          }
          /** @implements {MyInterface} */
          type MyType = {
            third: boolean;
            first: string;
            second: number;
          }
        `,
      },
    ],
    invalid: [],
  });

  // JSDoc comment edge cases
  ruleTester.run('JSDoc comment edge cases', jsdocRule, {
    valid: [
      {
        name: 'no @implements tag (should be ignored)',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** This is just a regular comment */
          type MyType = {
            differentProp: number;
          }
        `,
      },
      {
        name: 'empty JSDoc comment',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** */
          type MyType = {
            differentProp: number;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'malformed interface name in @implements',
        code: `
          /** @implements {NonExistentInterface} */
          type MyType = {
            prop: string;
          }
        `,
        errors: [
          {
            messageId: 'interfaceNotFound',
            data: {
              interfaceName: 'NonExistentInterface',
            },
          },
        ],
      },
    ],
  });

  // Namespace and complex naming
  ruleTester.run('namespace and complex naming', jsdocRule, {
    valid: [
      {
        name: 'interface and type with underscores',
        code: `
          interface My_Interface_Name {
            prop_name: string;
          }
          /** @implements {My_Interface_Name} */
          type My_Type_Name = {
            prop_name: string;
          }
        `,
      },
      {
        name: 'interface and type with numbers',
        code: `
          interface Interface2 {
            prop1: string;
            prop2: number;
          }
          /** @implements {Interface2} */
          type Type2 = {
            prop1: string;
            prop2: number;
          }
        `,
      },
    ],
    invalid: [],
  });

  // Complex type combinations
  ruleTester.run('complex type combinations', jsdocRule, {
    valid: [
      {
        name: 'union of intersections',
        code: `
          interface A { a: string; }
          interface B { b: number; }
          interface C { c: boolean; }
          interface MyInterface {
            prop: (A & B) | (A & C);
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: (A & B) | (A & C);
          }
        `,
      },
      {
        name: 'nested function types',
        code: `
          interface MyInterface {
            prop: (fn: (x: string) => number) => boolean;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: (fn: (x: string) => number) => boolean;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'complex type mismatch',
        code: `
          interface A { a: string; }
          interface B { b: number; }
          interface C { c: boolean; }
          interface MyInterface {
            prop: A & B;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: A & C;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'A & C',
              expectedType: 'A & B',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });
});
