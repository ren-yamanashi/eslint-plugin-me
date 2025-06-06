import { RuleTester } from '@typescript-eslint/rule-tester';
import { jsdocRule } from '../rules/jsdoc';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
    },
  },
});

ruleTester.run('jsdoc', jsdocRule, {
  valid: [
    {
      code: `
        interface MyInterface {}
        /** @implements {MyInterface} */
        type MyType = {}
      `,
    },
    {
      code: `
        interface MyInterface {
          prop: string;
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
      code: `
        interface MyInterface {
          prop: string;
        }

        /** @implements {MyInterface} */
        type MyType = {
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
    {
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
