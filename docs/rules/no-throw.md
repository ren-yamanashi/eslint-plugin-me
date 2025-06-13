# `me/no-throw` rule

## Overview

Disallows `throw` statements to encourage explicit error handling patterns. This rule promotes returning error objects or using Result types instead of throwing exceptions, leading to more predictable and type-safe error handling.

## Rule Details

This rule reports when a `throw` statement is used. It encourages alternative error handling patterns that:

- Make errors explicit in function signatures
- Avoid unexpected control flow
- Improve type safety
- Make error handling more predictable

## Examples

### ❌ Incorrect

```typescript
// Throwing exceptions
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// Throwing in conditionals
function validateUser(user: User) {
  if (!user.email) {
    throw new Error('Email is required');
  }
  if (!user.name) {
    throw new Error('Name is required');
  }
}

// Throwing in async functions
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// Re-throwing errors
function processData(data: unknown) {
  try {
    return JSON.parse(data as string);
  } catch (error) {
    throw new Error('Invalid JSON data');
  }
}
```

### ✅ Correct

```typescript
// Returning error objects
type DivisionResult = {
  success: true;
  value: number;
} | {
  success: false;
  error: string;
};

function divide(a: number, b: number): DivisionResult {
  if (b === 0) {
    return { success: false, error: 'Division by zero' };
  }
  return { success: true, value: a / b };
}

// Using Result type pattern
type Result<T, E = string> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function validateUser(user: User): Result<User, string[]> {
  const errors: string[] = [];
  
  if (!user.email) {
    errors.push('Email is required');
  }
  if (!user.name) {
    errors.push('Name is required');
  }
  
  if (errors.length > 0) {
    return { ok: false, error: errors };
  }
  
  return { ok: true, value: user };
}

// Explicit error handling with async
async function fetchUser(id: string): Promise<Result<User, string>> {
  try {
    const response = await fetch(`/users/${id}`);
    if (!response.ok) {
      return { ok: false, error: `Failed to fetch user: ${response.status}` };
    }
    const user = await response.json();
    return { ok: true, value: user };
  } catch (error) {
    return { ok: false, error: 'Network error occurred' };
  }
}

// Returning undefined or null for missing values
function findUser(id: string): User | undefined {
  const user = users.find(u => u.id === id);
  return user; // Returns undefined if not found
}

// Using discriminated unions
type ParseResult<T> = 
  | { type: 'success'; data: T }
  | { type: 'error'; message: string };

function parseJSON<T>(json: string): ParseResult<T> {
  try {
    const data = JSON.parse(json);
    return { type: 'success', data };
  } catch {
    return { type: 'error', message: 'Invalid JSON format' };
  }
}
```

## Benefits

- **Type Safety**: Errors are represented in the type system
- **Explicit Handling**: Callers must handle error cases explicitly
- **Predictable Flow**: No unexpected control flow interruptions
- **Better Testing**: Error cases are easier to test
- **Functional Style**: Aligns with functional programming principles

## Alternative Error Handling Patterns

### 1. Result Type Pattern

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function safeOperation(): Result<string, string> {
  if (Math.random() > 0.5) {
    return { success: true, data: 'Operation succeeded' };
  }
  return { success: false, error: 'Operation failed' };
}

// Usage
const result = safeOperation();
if (result.success) {
  console.log(result.data); // Type-safe access
} else {
  console.error(result.error);
}
```

### 2. Option/Maybe Pattern

```typescript
type Option<T> = T | null | undefined;

function findById<T>(items: T[], id: string): Option<T> {
  return items.find(item => item.id === id) ?? null;
}

// Usage with nullish coalescing
const user = findById(users, '123') ?? createDefaultUser();
```

### 3. Either Pattern

```typescript
type Either<L, R> = 
  | { type: 'left'; value: L }
  | { type: 'right'; value: R };

function parseNumber(input: string): Either<string, number> {
  const num = Number(input);
  if (isNaN(num)) {
    return { type: 'left', value: 'Invalid number format' };
  }
  return { type: 'right', value: num };
}
```

### 4. Multiple Return Values

```typescript
function validateAndProcess(data: unknown): [User | null, string | null] {
  if (!isValidUser(data)) {
    return [null, 'Invalid user data'];
  }
  
  const processed = processUser(data as User);
  return [processed, null];
}

// Usage with destructuring
const [user, error] = validateAndProcess(inputData);
if (error) {
  console.error(error);
  return;
}
// user is guaranteed to be non-null here
```

## Utility Functions for Error Handling

```typescript
// Helper function to convert throwing functions
function tryCatch<T, E = Error>(
  fn: () => T, 
  errorHandler?: (error: unknown) => E
): Result<T, E> {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    const handledError = errorHandler ? errorHandler(error) : error as E;
    return { success: false, error: handledError };
  }
}

// Chain results together
function chain<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}

// Map over successful results
function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.success) {
    return { success: true, data: fn(result.data) };
  }
  return result;
}
```

## When Not To Use

This rule might be too restrictive when:

- Working with external libraries that expect exceptions
- Implementing error boundaries in React applications
- Dealing with truly exceptional conditions that shouldn't be handled locally
- Performance-critical code where exceptions are necessary

## Migration Guide

### From Exceptions to Result Types

```typescript
// Before
function processFile(filename: string): ProcessedData {
  if (!fs.existsSync(filename)) {
    throw new Error('File not found');
  }
  
  const content = fs.readFileSync(filename, 'utf8');
  if (!content) {
    throw new Error('File is empty');
  }
  
  return parseContent(content);
}

// After
function processFile(filename: string): Result<ProcessedData, string> {
  if (!fs.existsSync(filename)) {
    return { success: false, error: 'File not found' };
  }
  
  const content = fs.readFileSync(filename, 'utf8');
  if (!content) {
    return { success: false, error: 'File is empty' };
  }
  
  return { success: true, data: parseContent(content) };
}
```

This approach makes error handling explicit and type-safe, improving code reliability and maintainability.
