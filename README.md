# eslint-plugin-type-implements-interface

An ESLint plugin that checks if TypeScript type aliases properly implement interfaces specified in JSDoc `@implements` tags.

## Overview

This plugin performs static analysis to verify that TypeScript type aliases fulfill interface contracts.

```typescript
interface User {
  id: number;
  name: string;
}

/**
 * @implements {User}
 */
type Student = {
  id: number;
  name: string;
  // Additional properties are allowed
  email: string;
};
```

## Installation

```bash
npm i -D eslint-plugin-type-implements-interface
```

### Flat Config

In `eslint.config.js`:

```javascript
import tseslintParser from '@typescript-eslint/parser';
import typeImplementsInterface from 'eslint-plugin-type-implements-interface';

export default [
  // other settings...
  {
    // set up typescript-eslint
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: true,
        sourceType: 'module',
      },
    },
  },
  {
    plugins: {
      'type-implements-interface': typeImplementsInterface,
    },
  },
  {
    rules: {
      'type-implements-interface/jsdoc': 'error',
    },
  },
];
```

## Example

```typescript
// Define an interface
interface ApiResponse {
  status: number;
  message: string;
}

/**
 * @implements {ApiResponse}
 */
// ✅ This type correctly implements the ApiResponse interface
type SuccessResponse = {
  status: 200;
  message: string;
};

/**
 * @implements {ApiResponse}
 */
// ❌ This type does not implement the ApiResponse interface correctly
//    (missing 'message' property)
type ErrorResponse = {
  status: 404 | 500;
};
```

## Rule Reference

- [type-implements-interface/jsdoc](./docs/rules/jsdoc.md)

## Contributing

Welcome

## License

MIT License
