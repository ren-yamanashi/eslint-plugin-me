import { createRuleTester } from './create-rule-tester';
import { noMutationMethods } from '../rules/no-mutation-methods';

const ruleTester = createRuleTester();

ruleTester.run('no-mutation-methods', noMutationMethods, {
  valid: [
    // Immutable array methods
    {
      code: 'const newArray = arr.concat([1, 2, 3]);',
    },
    {
      code: 'const newArray = [...arr, newItem];',
    },
    {
      code: 'const sliced = arr.slice(0, -1);',
    },
    {
      code: 'const sorted = arr.toSorted();',
    },
    {
      code: 'const reversed = arr.toReversed();',
    },
    // Immutable object operations
    {
      code: 'const newObj = { ...obj, newProp: value };',
    },
    {
      code: 'const newObj = Object.create(prototype, descriptors);',
    },
    // Ignored objects (console, process)
    {
      code: 'console.log("hello");',
    },
    {
      code: 'process.exit(0);',
    },
    // Non-mutation methods
    {
      code: 'const result = arr.map(x => x * 2);',
    },
    {
      code: 'const filtered = arr.filter(x => x > 0);',
    },
    // Allowed methods (when configured)
    {
      code: 'arr.push(item);',
      options: [{ allowedMethods: ['push'], ignoredObjects: ['console'] }],
    },
  ],
  invalid: [
    // Array mutation methods
    {
      code: 'arr.push(item);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'arr.pop();',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'arr.shift();',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'arr.unshift(item);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'arr.splice(1, 2, newItem);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'arr.sort();',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'arr.reverse();',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'arr.fill(0);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    // Object mutation methods
    {
      code: 'Object.assign(target, source);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'Object.defineProperty(obj, "prop", descriptor);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'Object.setPrototypeOf(obj, prototype);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    // Map/Set mutation methods
    {
      code: 'map.set(key, value);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'map.delete(key);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'map.clear();',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    {
      code: 'set.add(value);',
      errors: [{ messageId: 'noMutationMethod' }],
    },
    // Direct property mutation
    {
      code: 'arr.length = 0;',
      errors: [{ messageId: 'noMutationProperty' }],
    },
    {
      code: 'arr.length++;',
      errors: [{ messageId: 'noMutationProperty' }],
    },
    {
      code: 'arr[0] = newValue;',
      errors: [{ messageId: 'noMutationProperty' }],
    },
    {
      code: 'obj["key"] = value;',
      errors: [{ messageId: 'noMutationProperty' }],
    },
    // Multiple violations
    {
      code: `
        arr.push(1);
        arr.pop();
        arr.length = 5;
      `,
      errors: [
        { messageId: 'noMutationMethod' },
        { messageId: 'noMutationMethod' },
        { messageId: 'noMutationProperty' },
      ],
    },
  ],
});
