# `me/prefer-arrow-function` rule

## Overview

Prefers arrow functions over traditional function declarations and expressions. Arrow functions provide more concise syntax, lexical `this` binding, and better compatibility with functional programming patterns.

## Rule Details

This rule reports when a traditional `function` declaration or expression is used instead of an arrow function. It encourages the use of arrow functions for:

- Cleaner, more concise syntax
- Consistent lexical scope
- Better functional programming patterns
- Reduced confusion with `this` binding

### Exceptions

The rule allows traditional functions in specific cases:

- Exported function declarations at module level
- Function expressions used as object methods

## Examples

### ❌ Incorrect

```typescript
// Function declarations (non-exported)
function add(a: number, b: number) {
  return a + b;
}

function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Function expressions
const multiply = function(a: number, b: number) {
  return a * b;
};

// Function expressions in callbacks
setTimeout(function() {
  console.log('Timer finished');
}, 1000);

// Function expressions in array methods
const doubled = numbers.map(function(n) {
  return n * 2;
});

// Nested functions
function outerFunction() {
  function innerFunction() {
    return 'inner';
  }
  return innerFunction();
}
```

### ✅ Correct

```typescript
// Arrow functions
const add = (a: number, b: number) => a + b;

const calculateTotal = (items: Item[]) => 
  items.reduce((sum, item) => sum + item.price, 0);

const multiply = (a: number, b: number) => a * b;

// Arrow functions in callbacks
setTimeout(() => {
  console.log('Timer finished');
}, 1000);

// Arrow functions in array methods
const doubled = numbers.map(n => n * 2);

// Nested arrow functions
const outerFunction = () => {
  const innerFunction = () => 'inner';
  return innerFunction();
};

// Exported functions (allowed exception)
export function publicApi(data: Data) {
  return processData(data);
}

// Object methods (allowed exception)
const calculator = {
  add: function(a: number, b: number) {
    return a + b;
  },
  // Or use method shorthand
  subtract(a: number, b: number) {
    return a - b;
  },
};

// Async arrow functions
const fetchData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

// Arrow functions with destructuring
const getUserName = ({ user: { name } }: { user: { name: string } }) => name;

// Immediately invoked arrow functions
const result = ((x: number) => x * 2)(5);
```

## Benefits

- **Concise Syntax**: Arrow functions are more compact and readable
- **Lexical This**: No confusion with `this` binding
- **Consistent Style**: Uniform function syntax throughout the codebase
- **Functional Style**: Better alignment with functional programming patterns
- **Type Inference**: TypeScript often infers types better with arrow functions

## Detailed Examples

### Function Declarations vs Arrow Functions

```typescript
// Traditional function (avoid)
function processUser(user: User) {
  if (!user.isActive) {
    return null;
  }
  return {
    id: user.id,
    name: user.name.toUpperCase(),
  };
}

// Arrow function (preferred)
const processUser = (user: User) => {
  if (!user.isActive) {
    return null;
  }
  return {
    id: user.id,
    name: user.name.toUpperCase(),
  };
};

// Or more concise
const processUser = (user: User) =>
  user.isActive 
    ? { id: user.id, name: user.name.toUpperCase() }
    : null;
```

### Higher-Order Functions

```typescript
// Traditional approach (avoid)
function createValidator(rules: Rule[]) {
  return function(data: unknown) {
    return rules.every(function(rule) {
      return rule.validate(data);
    });
  };
}

// Arrow function approach (preferred)
const createValidator = (rules: Rule[]) => 
  (data: unknown) => 
    rules.every(rule => rule.validate(data));
```

### Event Handlers

```typescript
// Traditional approach (avoid)
button.addEventListener('click', function(event) {
  console.log('Button clicked', event.target);
});

// Arrow function approach (preferred)
button.addEventListener('click', (event) => {
  console.log('Button clicked', event.target);
});

// Or even more concise
button.addEventListener('click', event => 
  console.log('Button clicked', event.target)
);
```

### Function Composition

```typescript
// Arrow functions make composition cleaner
const pipe = <T>(...fns: Array<(arg: T) => T>) => 
  (value: T) => 
    fns.reduce((acc, fn) => fn(acc), value);

const transform = pipe(
  (str: string) => str.trim(),
  str => str.toLowerCase(),
  str => str.replace(/\s+/g, '-')
);
```

## When Not To Use

Consider keeping traditional functions when:

### 1. Exported Module Functions

```typescript
// Public API functions can remain as function declarations
export function initialize(config: Config) {
  // Implementation
}
```

### 2. Object Methods with `this` Context

```typescript
const obj = {
  value: 42,
  
  // When you need `this` binding
  getValue: function() {
    return this.value;
  },
  
  // Method shorthand is also acceptable
  setValue(newValue: number) {
    this.value = newValue;
  },
};
```

### 3. Constructor Functions (if not using classes)

```typescript
// If you must use constructor functions
function Person(name: string) {
  this.name = name;
}
```

## Type Safety with Arrow Functions

Arrow functions work excellently with TypeScript:

```typescript
// Explicit typing
const calculate: (a: number, b: number) => number = (a, b) => a + b;

// Generic arrow functions
const identity = <T>(value: T): T => value;

// With constraints
const mapArray = <T, U>(
  array: T[], 
  mapper: (item: T) => U
): U[] => array.map(mapper);

// Async arrow functions
const fetchUser = async (id: string): Promise<User | null> => {
  try {
    const response = await fetch(`/users/${id}`);
    return await response.json();
  } catch {
    return null;
  }
};
```

## Performance Considerations

Arrow functions have minimal performance differences from traditional functions:

- **Creation**: Slightly faster to create (no separate `this` binding)
- **Execution**: Nearly identical performance
- **Memory**: Slightly less memory usage (no `arguments` object)

The benefits in code clarity and maintainability far outweigh any theoretical performance differences.
