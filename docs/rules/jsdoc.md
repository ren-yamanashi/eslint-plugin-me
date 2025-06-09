# `type-implements-interface/jsdoc` rule

_Note: This rule requires [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) settings with [the `project` parser option set](https://typescript-eslint.io/packages/parser/#project)._

When this rule is enabled, TypeScript type aliases can have a JSDoc `@implements` annotation to specify which interface they should implement. The rule verifies that the type alias properly fulfills the interface contract by checking for missing properties and type compatibility.

**Example settings in eslint.config.js**:

```js
import tseslintParser from '@typescript-eslint/parser';
import typeImplementsInterface from 'eslint-plugin-type-implements-interface';

export default [
  {
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
    rules: {
      'type-implements-interface/jsdoc': 'error',
    },
  },
];
```

## Example

```ts
// ----- Define an interface -----
interface User {
  id: number;
  name: string;
  email: string;
}

// ----- Valid implementations -----

/**
 * @implements {User}
 */
// ✅ This is CORRECT - all required properties are present with correct types
type AdminUser = {
  id: number;
  name: string;
  email: string;
  // Additional properties are allowed
  permissions: string[];
};

/**
 * @implements {User}
 */
// ✅ This is CORRECT - literal types are assignable to their base types
type SpecificUser = {
  id: 123;
  name: 'John Doe';
  email: 'john@example.com';
};

// ----- Invalid implementations -----

/**
 * @implements {User}
 */
// ❌ This is INCORRECT - missing 'email' property
type IncompleteUser = {
  id: number;
  name: string;
};

/**
 * @implements {User}
 */
// ❌ This is INCORRECT - 'id' has wrong type
type WrongTypeUser = {
  id: string; // should be number
  name: string;
  email: string;
};

/**
 * @implements {NonExistentInterface}
 */
// ❌ This is INCORRECT - interface not found
type InvalidUser = {
  id: number;
};
```

## Features

### Property Validation

The rule checks that all properties required by the interface are present in the type alias:

```ts
interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}

/**
 * @implements {ApiResponse}
 */
// ❌ Missing 'message' property
type ErrorResponse = {
  status: 404;
};
```

### Type Compatibility

The rule verifies that property types are compatible with the interface specification:

```ts
interface Config {
  timeout: number;
  retries: number;
}

/**
 * @implements {Config}
 */
// ❌ 'timeout' should be number, not string
type InvalidConfig = {
  timeout: '5000';
  retries: 3;
};
```

### Special Property Names

The rule supports various property name formats:

```ts
interface SpecialProps {
  0: string; // numeric property
  123: number; // numeric property
  'special-prop': boolean; // quoted property
  'with spaces': string; // quoted property with spaces
}

/**
 * @implements {SpecialProps}
 */
type ValidSpecial = {
  0: 'zero';
  123: 456;
  'special-prop': true;
  'with spaces': 'hello world';
};
```

### JSDoc Comment Variations

The rule supports various JSDoc comment formats:

```ts
interface MyInterface {
  prop: string;
}

/**
 * This is a comprehensive type definition
 * @implements {MyInterface}
 * @example
 * const example: MyType = { prop: "hello" };
 */
type MyType = {
  prop: string;
};
```

## Error Messages

The rule provides clear error messages for different violation types:

### Missing Property

```plain
Property 'propertyName' is missing in type 'TypeName' but required by interface 'InterfaceName'
```

### Interface Not Found

```plain
Interface 'InterfaceName' specified in @implements tag was not found in the project
```

### Wrong Type

```plain
Property 'propertyName' has type 'actualType' but interface 'InterfaceName' expects 'expectedType'
```

### Unsupported Generic

```plain
Generic interfaces are not supported. Interface 'InterfaceName' contains generic type parameters.
```

## Limitations

### Generic Interfaces Not Supported

The rule currently does not support generic interfaces:

```ts
// ❌ This will trigger an "unsupportedGeneric" error
interface GenericInterface<T> {
  data: T;
}

/**
 * @implements {GenericInterface<string>}
 */
type MyType = {
  data: string;
};
```

### Interface Availability

The rule only checks interfaces that are available in the current TypeScript program. Make sure all referenced interfaces are properly imported or declared in the same project scope.

## Best Practices

1. **Clear Interface Definitions**: Define interfaces with clear, descriptive property names and types.

2. **Consistent Naming**: Use consistent naming conventions for both interfaces and implementing types.

3. **Documentation**: Add meaningful descriptions to your JSDoc comments along with the `@implements` tag.

4. **Type Safety**: Leverage the rule to ensure type safety and catch implementation errors early in development.

## Integration with TypeScript

This rule works alongside TypeScript's type system to provide additional compile-time checks. While TypeScript ensures type safety, this rule specifically validates the relationship between type aliases and interfaces declared through JSDoc annotations.
