import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('JSDoc comment variations', jsdocRule, {
  valid: [
    {
      name: 'multiline JSDoc comment',
      code: `
          interface MyInterface {
            prop: string;
          }
          /**
           * @implements {MyInterface}
           */
          type MyType = {
            prop: string;
          }
        `,
    },
    {
      name: 'JSDoc with additional tags',
      code: `
          interface MyInterface {
            prop: string;
          }
          /**
           * This is a type alias
           * @implements {MyInterface}
           * @example MyType = { prop: "hello" }
           */
          type MyType = {
            prop: string;
          }
        `,
    },
  ],
  invalid: [],
});
