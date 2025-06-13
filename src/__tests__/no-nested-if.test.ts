import { createRuleTester } from './create-rule-tester';
import { noNestedIf } from '../rules/no-nested-if';

const ruleTester = createRuleTester();

ruleTester.run('no-nested-if', noNestedIf, {
  valid: [
    {
      code: 'if (condition) { return; }',
    },
    {
      code: 'if (condition) { doSomething(); }',
    },
    {
      code: 'if (condition) { doSomething(); } else { doOtherThing(); }',
    },
    {
      code: `
        if (condition1) {
          return;
        }
        if (condition2) {
          doSomething();
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        if (condition1) {
          if (condition2) {
            doSomething();
          }
        }
      `,
      errors: [{ messageId: 'noNestedIf' }],
    },
    {
      code: `
        if (condition1) {
          doSomething();
        } else {
          if (condition2) {
            doOtherThing();
          }
        }
      `,
      errors: [{ messageId: 'noNestedIf' }],
    },
    {
      code: `
        if (condition1) {
          if (condition2) {
            if (condition3) {
              doSomething();
            }
          }
        }
      `,
      errors: [{ messageId: 'noNestedIf' }, { messageId: 'noNestedIf' }],
    },
  ],
});
