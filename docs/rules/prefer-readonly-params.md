# `me/prefer-readonly-params` rule

## Overview

Encourages the use of `readonly` modifier on function parameters that are objects, arrays, or tuples to promote immutability and prevent accidental mutations.

## Rule Details

This rule reports when function parameters with complex types (objects, arrays, tuples) don't have a `readonly` modifier. It helps enforce immutability patterns by making it clear that parameters should not be mutated within the function.

The rule checks:

- Object literal types (`{ name: string }`)
- Array types (`string[]`)
- Tuple types (`[number, string]`)

The rule ignores:

- Primitive types (string, number, boolean, etc.)
- Parameters without type annotations
- Rest parameters
- Destructuring parameters

## Examples

### ❌ Incorrect

```typescript
// Object parameter without readonly
function processUser(user: { name: string; age: number }) {
  // Even if you don't mutate, readonly makes intent clear
  return user.name.toUpperCase();
}

// Array parameter without readonly
function calculateSum(numbers: number[]) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// Tuple parameter without readonly
function getDistance(point: [number, number]) {
  return Math.sqrt(point[0] ** 2 + point[1] ** 2);
}

// Multiple parameters
function mergeData(
  users: User[],
  settings: { theme: string; locale: string }
) {
  return users.map(user => ({ ...user, ...settings }));
}

// Arrow function
const formatUsers = (users: User[]) => 
  users.map(user => user.name);

// Function expression
const processData = function(data: { items: Item[] }) {
  return data.items.length;
};
```

### ✅ Correct

```typescript
// Object parameter with readonly
function processUser(user: readonly { name: string; age: number }) {
  return user.name.toUpperCase();
}

// Array parameter with readonly
function calculateSum(numbers: readonly number[]) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// Tuple parameter with readonly
function getDistance(point: readonly [number, number]) {
  return Math.sqrt(point[0] ** 2 + point[1] ** 2);
}

// Multiple parameters with readonly
function mergeData(
  users: readonly User[],
  settings: readonly { theme: string; locale: string }
) {
  return users.map(user => ({ ...user, ...settings }));
}

// Primitive types (no readonly needed)
function greet(name: string, age: number) {
  return `Hello ${name}, you are ${age} years old`;
}

// Parameters without type annotations (ignored)
function processAny(data) {
  return data;
}

// Rest parameters (ignored)
function combine(...args: string[]) {
  return args.join(' ');
}

// Destructuring parameters (ignored) 
function extractName({ name }: { name: string }) {
  return name;
}

// Using ReadonlyArray utility type
function processItems(items: ReadonlyArray<Item>) {
  return items.filter(item => item.isActive);
}

// Using Readonly utility type for objects
function updateSettings(settings: Readonly<Settings>) {
  return { ...settings, updated: true };
}
```

## Benefits

- **Immutability**: Prevents accidental mutations of parameters
- **Intent Declaration**: Makes it clear that parameters should not be modified
- **Type Safety**: TypeScript will prevent mutation attempts
- **Functional Style**: Encourages pure function patterns
- **Documentation**: Serves as inline documentation about function behavior

## Advanced Patterns

### Generic Functions with Readonly

```typescript
// Generic function with readonly constraint
function mapArray<T, U>(
  items: readonly T[],
  mapper: (item: T) => U
): U[] {
  return items.map(mapper);
}

// Readonly with generic object types
function updateObject<T extends Record<string, any>>(
  obj: Readonly<T>,
  updates: Partial<T>
): T {
  return { ...obj, ...updates };
}
```

### Deep Readonly Types

```typescript
// Using utility types for deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

function processComplexData(
  data: DeepReadonly<{ users: User[]; settings: Settings }>
) {
  // All nested properties are readonly
  return data.users.length + Object.keys(data.settings).length;
}
```

### Readonly with Interfaces

```typescript
interface User {
  id: string;
  name: string;
  preferences: UserPreferences;
}

// Prefer Readonly utility type with interfaces
function analyzeUser(user: Readonly<User>) {
  return {
    hasPreferences: Object.keys(user.preferences).length > 0,
    nameLength: user.name.length,
  };
}

// Or define readonly interfaces
interface ReadonlyUser {
  readonly id: string;
  readonly name: string;
  readonly preferences: Readonly<UserPreferences>;
}

function processReadonlyUser(user: ReadonlyUser) {
  return user.name.toUpperCase();
}
```

## Type Utility Functions

```typescript
// Helper to make function parameters readonly
type ReadonlyParams<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => infer R
  ? (...args: { readonly [K in keyof P]: Readonly<P[K]> }) => R
  : never;

// Apply readonly to existing function type
type OriginalFunction = (users: User[], settings: Settings) => ProcessedData;
type ReadonlyFunction = ReadonlyParams<OriginalFunction>;
// Results in: (users: readonly User[], settings: Readonly<Settings>) => ProcessedData

// Utility to ensure all parameters are readonly
function withReadonlyParams<T extends (...args: any[]) => any>(
  fn: ReadonlyParams<T>
): ReadonlyParams<T> {
  return fn;
}

// Usage
const safeProcessor = withReadonlyParams(
  (users: readonly User[], settings: Readonly<Settings>) => {
    return users.map(user => processUser(user, settings));
  }
);
```

## Common Patterns

### Array Processing

```typescript
// Safe array processing
function filterAndSort(
  items: readonly Item[],
  predicate: (item: Item) => boolean
): Item[] {
  return items
    .filter(predicate)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Readonly arrays prevent accidental mutation
function processItems(items: readonly Item[]) {
  // This would cause a TypeScript error:
  // items.push(newItem); // Error: Property 'push' does not exist
  
  // Instead, return new array
  return [...items, newItem];
}
```

### Object Processing

```typescript
// Safe object processing
function enhanceUser(
  user: Readonly<User>,
  enhancements: Readonly<UserEnhancements>
): EnhancedUser {
  return {
    ...user,
    ...enhancements,
    enhanced: true,
  };
}

// Prevents accidental mutation
function updateUserName(user: Readonly<User>, newName: string): User {
  // This would cause a TypeScript error:
  // user.name = newName; // Error: Cannot assign to 'name' because it is read-only
  
  // Instead, return new object
  return { ...user, name: newName };
}
```

## Performance Considerations

- **Runtime**: `readonly` is a compile-time feature with no runtime cost
- **Type Checking**: Minimal impact on TypeScript compilation
- **Memory**: No additional memory overhead
- **Optimization**: Helps bundlers and engines optimize immutable operations

## Migration Strategy

### Gradual Adoption

```typescript
// Start with new functions
function newFunction(data: readonly Data[]) {
  // Implementation
}

// Gradually update existing functions
function existingFunction(data: readonly Data[]) { // Add readonly
  // Existing implementation remains the same
}

// Use type aliases for consistency
type ReadonlyUsers = readonly User[];
type ReadonlySettings = Readonly<Settings>;

function processData(
  users: ReadonlyUsers,
  settings: ReadonlySettings
) {
  // Implementation
}
```

This rule helps build more robust, predictable code by making immutability intentions explicit and preventing accidental mutations.
