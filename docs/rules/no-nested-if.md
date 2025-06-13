# `me/no-nested-if` rule

## Overview

Disallows nested `if` statements to encourage flatter, more readable code structure. Nested conditionals increase cognitive complexity and make code harder to follow and maintain.

## Rule Details

This rule reports when an `if` statement is nested inside another `if` statement. It encourages the use of:

- Early returns (guard clauses)
- Combined conditions with logical operators
- Separate functions for complex logic

## Examples

### ❌ Incorrect

```typescript
// Nested if statements
function processUser(user: User) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return user.data;
      }
    }
  }
  return null;
}

// Nested if in else
function checkStatus(status: string) {
  if (status === 'pending') {
    return 'Processing...';
  } else {
    if (status === 'completed') {
      return 'Done!';
    }
  }
  return 'Unknown';
}

// Nested if in arrow function
const validate = (data: Data) => {
  if (data) {
    if (data.isValid) {
      return true;
    }
  }
  return false;
};
```

### ✅ Correct

```typescript
// Use early returns (guard clauses)
function processUser(user: User) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;
  
  return user.data;
}

// Use combined conditions
function processUserAlt(user: User) {
  if (user && user.isActive && user.hasPermission) {
    return user.data;
  }
  return null;
}

// Use separate if statements
function checkStatus(status: string) {
  if (status === 'pending') {
    return 'Processing...';
  }
  
  if (status === 'completed') {
    return 'Done!';
  }
  
  return 'Unknown';
}

// Use logical operators
const validate = (data: Data) => {
  return data && data.isValid;
};

// Extract complex logic to separate functions
function hasValidPermissions(user: User): boolean {
  return user.isActive && user.hasPermission;
}

function processUserWithHelper(user: User) {
  if (!user) return null;
  if (!hasValidPermissions(user)) return null;
  
  return user.data;
}
```

## Benefits

- **Readability**: Flatter code structure is easier to scan and understand
- **Maintainability**: Fewer nested levels reduce complexity
- **Debugging**: Guard clauses make error conditions explicit
- **Testing**: Separate conditions are easier to test individually
- **Code Review**: Reviewers can understand the logic flow more quickly

## Alternative Patterns

### 1. Early Returns (Guard Clauses)

```typescript
function processData(data: any) {
  if (!data) return null;
  if (!data.isValid) return null;
  if (!data.hasRequiredFields) return null;
  
  // Main logic here
  return processValidData(data);
}
```

### 2. Logical Operators

```typescript
function isValidUser(user: User) {
  return user && user.isActive && user.hasPermission && user.email;
}
```

### 3. Switch Statements

```typescript
function getStatusMessage(status: string) {
  switch (status) {
    case 'pending': return 'Processing...';
    case 'completed': return 'Done!';
    case 'failed': return 'Error occurred';
    default: return 'Unknown status';
  }
}
```

### 4. Function Extraction

```typescript
function canAccessResource(user: User, resource: Resource): boolean {
  return isValidUser(user) && hasResourcePermission(user, resource);
}

function processResource(user: User, resource: Resource) {
  if (!canAccessResource(user, resource)) {
    return null;
  }
  
  return resource.data;
}
```

## When Not To Use

This rule might be too restrictive in some cases:

- Complex business logic that naturally requires nested conditions
- Performance-critical code where combined conditions might be less efficient
- Code that would become less readable with forced flattening

In such cases, consider extracting the nested logic into separate functions instead.
