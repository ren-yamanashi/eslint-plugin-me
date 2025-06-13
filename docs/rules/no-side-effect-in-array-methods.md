# `me/no-side-effect-in-array-methods` rule

## Overview

Disallows side effects in array methods like `map`, `filter`, `reduce`, etc. These methods are designed for functional programming patterns and should not cause side effects for better code predictability and maintainability.

## Rule Details

This rule reports when side effects are detected within callback functions of array methods. Side effects include:

- Variable assignments (`=`, `+=`, etc.)
- Increment/decrement operations (`++`, `--`)
- Mutating method calls (e.g., `push`, `pop`, `console.log`)
- Throw statements

### Array methods checked

- `map`
- `filter`
- `reduce`
- `reduceRight`
- `find`
- `findIndex`
- `some`
- `every`

## Examples

### ❌ Incorrect

```typescript
// Variable assignment
const result = arr.map(item => {
  sideVar = item;
  return item * 2;
});

// Console output
const doubled = arr.map(item => {
  console.log(item); // Side effect
  return item * 2;
});

// Mutating operations
const filtered = arr.filter(item => {
  item++; // Side effect
  return item > 0;
});

// Array mutation
const accumulated = arr.reduce((acc, item) => {
  acc.push(item); // Side effect
  return acc;
}, []);

// Throwing errors
const found = arr.find(item => {
  if (item.invalid) {
    throw new Error('Invalid item'); // Side effect
  }
  return item.valid;
});
```

### ✅ Correct

```typescript
// Pure function - no side effects
const doubled = arr.map(item => item * 2);

// Using immutable operations
const accumulated = arr.reduce((acc, item) => [...acc, item], []);

// Returning boolean without side effects
const filtered = arr.filter(item => item > 0);

// Use forEach for side effects instead
arr.forEach(item => console.log(item));

// Use for loop for complex logic with side effects
for (const item of arr) {
  if (item.invalid) {
    throw new Error('Invalid item');
  }
}
```

## When Not To Use

If you need to perform side effects during array processing, use:

- `forEach()` for iteration with side effects
- Traditional `for` loops for complex logic
- `for...of` loops for better readability

## Benefits

- **Predictability**: Pure functions are easier to reason about
- **Testability**: Pure functions are easier to test
- **Debugging**: No hidden side effects make debugging simpler
- **Functional Programming**: Encourages functional programming patterns
- **Performance**: Pure functions can be optimized better by JavaScript engines
