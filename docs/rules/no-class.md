# `me/no-class` rule

## Overview

Disallows class declarations to encourage functional programming patterns and composition over inheritance. This rule promotes the use of functions, objects, and modules instead of classes.

## Rule Details

This rule reports when a `class` declaration is used. It encourages alternative patterns that are more aligned with functional programming principles:

- Factory functions
- Object literals
- Modules
- Functional composition

## Examples

### ❌ Incorrect

```typescript
// Class declaration
class UserService {
  private users: User[] = [];

  addUser(user: User) {
    this.users.push(user);
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
}

// Class with constructor
class Calculator {
  constructor(private precision: number) {}

  add(a: number, b: number): number {
    return Number((a + b).toFixed(this.precision));
  }
}

// Extended class
class AdminUser extends User {
  constructor(name: string, private permissions: string[]) {
    super(name);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
```

### ✅ Correct

```typescript
// Factory function pattern
const createUserService = () => {
  const users: User[] = [];

  return {
    addUser: (user: User) => {
      users.push(user);
    },
    getUser: (id: string) => {
      return users.find(u => u.id === id);
    },
  };
};

// Factory function with configuration
const createCalculator = (precision: number) => ({
  add: (a: number, b: number) => {
    return Number((a + b).toFixed(precision));
  },
  subtract: (a: number, b: number) => {
    return Number((a - b).toFixed(precision));
  },
});

// Object literal with functions
const mathUtils = {
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b,
  multiply: (a: number, b: number) => a * b,
};

// Composition over inheritance
type User = {
  id: string;
  name: string;
};

type AdminUser = User & {
  permissions: string[];
};

const createAdminUser = (name: string, permissions: string[]): AdminUser => ({
  id: generateId(),
  name,
  permissions,
});

const hasPermission = (user: AdminUser, permission: string): boolean => {
  return user.permissions.includes(permission);
};

// Module pattern
const userModule = (() => {
  const users: User[] = [];

  const addUser = (user: User) => {
    users.push(user);
  };

  const getUser = (id: string) => {
    return users.find(u => u.id === id);
  };

  return { addUser, getUser };
})();
```

## Benefits

- **Immutability**: Factory functions encourage immutable data patterns
- **Composition**: Easier to compose functionality without complex inheritance
- **Testing**: Functions are easier to test in isolation
- **Type Safety**: TypeScript types work better with functional patterns
- **Simplicity**: No need to understand `this` context or prototype chains
- **Tree Shaking**: Better dead code elimination in bundlers

## Alternative Patterns

### 1. Factory Functions

```typescript
const createTimer = () => {
  let startTime = 0;

  return {
    start: () => {
      startTime = Date.now();
    },
    elapsed: () => {
      return Date.now() - startTime;
    },
  };
};
```

### 2. Functional Composition

```typescript
const withLogging = <T extends Record<string, any>>(obj: T) => ({
  ...obj,
  log: (message: string) => console.log(message),
});

const withValidation = <T extends Record<string, any>>(obj: T) => ({
  ...obj,
  validate: (data: unknown) => typeof data === 'object',
});

const createProcessor = () => {
  const base = {
    process: (data: unknown) => data,
  };

  return withLogging(withValidation(base));
};
```

### 3. Higher-Order Functions

```typescript
const withRetry = <T extends any[], R>(
  fn: (...args: T) => R,
  maxRetries: number = 3
) => {
  return (...args: T): R => {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return fn(...args);
      } catch (error) {
        lastError = error as Error;
      }
    }
    
    throw lastError!;
  };
};
```

### 4. Type-Based Design

```typescript
type UserService = {
  readonly addUser: (user: User) => void;
  readonly getUser: (id: string) => User | undefined;
  readonly getAllUsers: () => readonly User[];
};

const createUserService = (): UserService => {
  const users: User[] = [];

  return {
    addUser: (user: User) => {
      users.push(user);
    },
    getUser: (id: string) => {
      return users.find(u => u.id === id);
    },
    getAllUsers: () => users.slice(),
  };
};
```

## When Not To Use

This rule might be too restrictive when:

- Working with external libraries that expect classes
- Integrating with frameworks that use class-based patterns
- Implementing complex state machines where classes provide clear benefits
- Performance-critical code where class methods are optimized

## Migration Guide

### From Classes to Factory Functions

```typescript
// Before
class Counter {
  private count = 0;
  
  increment() {
    this.count++;
  }
  
  getCount() {
    return this.count;
  }
}

// After
const createCounter = () => {
  let count = 0;
  
  return {
    increment: () => {
      count++;
    },
    getCount: () => count,
  };
};
```

### From Inheritance to Composition

```typescript
// Before
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Dog extends Animal {
  bark() {
    return `${this.name} barks!`;
  }
}

// After
type Animal = {
  name: string;
};

type Dog = Animal & {
  bark: () => string;
};

const createDog = (name: string): Dog => ({
  name,
  bark: () => `${name} barks!`,
});
```
