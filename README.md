# @reyn/eslint-plugin-me

A collection of ESLint rules that enforce functional programming patterns and immutable coding practices.

This plugin is designed for use myself.

## Rules

### Core Rules

- [`type-implements-interface`](./docs/rules/type-implements-interface.md) - Validates that type aliases implement interfaces specified in JSDoc @implements tags
- [`no-foreach`](./docs/rules/no-foreach.md) - Disallows Array.prototype.forEach in favor of functional alternatives

### Functional Programming Rules

- [`no-side-effect-in-array-methods`](./docs/rules/no-side-effect-in-array-methods.md) - Disallows side effects in array methods like map, filter, reduce
- [`no-nested-if`](./docs/rules/no-nested-if.md) - Disallows nested if statements to encourage flatter code structure
- [`no-class`](./docs/rules/no-class.md) - Disallows class declarations to encourage functional patterns
- [`no-throw`](./docs/rules/no-throw.md) - Disallows throw statements to encourage explicit error handling
- [`prefer-arrow-function`](./docs/rules/prefer-arrow-function.md) - Prefers arrow functions over traditional function declarations
- [`prefer-readonly-params`](./docs/rules/prefer-readonly-params.md) - Encourages readonly modifier on function parameters for immutability
- [`no-mutation-methods`](./docs/rules/no-mutation-methods.md) - Disallows array and object mutation methods to promote immutable patterns

## Installation

```bash
npm install @reyn/eslint-plugin-me
```

## Configuration

### Basic Configuration

```javascript
import me from '@reyn/eslint-plugin-me';

export default [
  {
    plugins: {
      me,
    },
    rules: {
      'me/type-implements-interface': 'error',
      'me/no-foreach': 'error',
      'me/no-side-effect-in-array-methods': 'error',
      'me/no-nested-if': 'error',
      'me/no-class': 'error',
      'me/no-throw': 'error',
      'me/prefer-arrow-function': 'error',
      'me/prefer-readonly-params': 'error',
      'me/no-mutation-methods': 'error',
    },
  },
];
```

### Use All Rules

```javascript
import me from '@reyn/eslint-plugin-me';

export default [me.configs.all];
```

## Contributing

Welcome

## License

MIT License
