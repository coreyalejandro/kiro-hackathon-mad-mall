# MADMall Social Wellness Hub - Troubleshooting Log

## Overview
This document contains a comprehensive log of all issues encountered during development and their solutions. Use this as a reference for similar problems in the future.

---

## 🚨 Critical Issues & Solutions

### Issue #1: White Screen on App Load
**Date:** 2025-08-30  
**Symptoms:** 
- Application shows only white screen
- No content renders
- Console shows JavaScript errors

**Root Causes:**
1. TypeScript compilation errors preventing app from running
2. Missing exports in components
3. Incorrect type definitions

**Solution Steps:**
1. Check browser console for specific errors
2. Run `npm run build` to see TypeScript errors
3. Fix critical compilation errors first
4. Test with `npm run dev`

---

### Issue #2: TypeScript Navigation Type Errors
**Date:** 2025-08-30  
**Error Code:** `TS2322`  
**Full Error:**
```
Type '({ type: string; text: string; href: string; } | { type: string; text?: undefined; href?: undefined; })[]' 
is not assignable to type 'readonly Item[]'
```

**Location:** `src/App.tsx` line 60  
**Component:** `SideNavigation` items prop

**Root Cause:** 
Cloudscape Design System's SideNavigation expects specific literal types, not generic strings.

**Solution:**
```typescript
// ❌ WRONG - Generic string types
const navigationItems = [
  { type: 'link', text: 'Concourse', href: '/' },
  { type: 'divider' },
];

// ✅ CORRECT - Literal types with 'as const'
const navigationItems = [
  { type: 'link' as const, text: 'Concourse', href: '/' },
  { type: 'divider' as const },
];
```

**Prevention:** Always use `as const` assertions for Cloudscape component props that expect literal types.

---

### Issue #3: AuthFormData Export Missing
**Date:** 2025-08-30  
**Error:** 
```
The requested module '/src/components/AuthForm.tsx' does not provide an export named 'AuthFormData'
```

**Root Cause:** 
Interface was defined but not properly exported from AuthForm component.

**Solution:**
```typescript
// ✅ CORRECT - Export the interface
export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms?: boolean;
}
```

**Import Fix:**
```typescript
// ✅ Use type-only import for interfaces
import AuthForm, { type AuthFormData } from '../components/AuthForm';
```

---

### Issue #4: Cloudscape Form Component Issues
**Date:** 2025-08-30  
**Symptoms:**
- Form onSubmit prop not accepted
- Button formAction prop errors
- TypeScript compilation failures

**Root Cause:** 
Cloudscape Form component doesn't support native form props like onSubmit.

**Solution:**
```typescript
// ❌ WRONG - Cloudscape Form doesn't support onSubmit
<Form onSubmit={handleSubmit}>

// ✅ CORRECT - Use native HTML form
<form onSubmit={handleSubmit}>
```

**Button Fix:**
```typescript
// ❌ WRONG - formAction not supported
<Button formAction="submit">

// ✅ CORRECT - But Cloudscape Button doesn't support type="submit" either
<Button variant="primary" loading={loading}>
```

---

### Issue #5: Unused React Import Warning
**Date:** 2025-08-30  
**Error Code:** `TS6133`  
**Warning:** `'React' is declared but its value is never read`

**Root Cause:** 
Modern React (17+) with new JSX transform doesn't require React import.

**Solution:**
```typescript
// ❌ OLD - Not needed in modern React
import React from 'react';

// ✅ NEW - Only import what you use
import { useState, useEffect } from 'react';
```

---

### Issue #6: Hook Parameter Type Errors
**Date:** 2025-08-30  
**Error Code:** `TS2345`  
**Full Error:**
```
Argument of type 'string | null' is not assignable to parameter of type 'null | undefined'.
Type 'string' is not assignable to type 'null | undefined'.
```

**Location:** Various hook calls in components  
**Root Cause:** 
Hook functions lacked explicit TypeScript parameter types, causing type inference issues.

**Solution:**
```typescript
// ❌ WRONG - No explicit types
export function useComedyContent(category = null, limit = 10) {

// ✅ CORRECT - Explicit parameter types
export function useComedyContent(category: string | null = null, limit: number = 10) {
```

**Pattern for All Hooks:**
```typescript
// For hooks with optional category/filter parameters
export function useHookName(category: string | null = null, limit: number = 10) {

// For hooks with only limit parameters  
export function useHookName(limit: number = 10) {

// For hooks with multiple string parameters
export function useHookName(param1: string = 'default', param2: string = 'all', limit: number = 5) {
```

**Prevention:** Always add explicit TypeScript types to function parameters, especially with default values.

---

## 🔧 Common TypeScript Fixes

### Type-Only Imports
```typescript
// ✅ For interfaces and types
import { type AuthFormData } from '../components/AuthForm';
import AuthForm, { type AuthFormData } from '../components/AuthForm';
```

### Toast State Typing
```typescript
// ❌ Generic type
const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });

// ✅ Explicit type definition
const [toast, setToast] = useState<{ 
  show: boolean; 
  message: string; 
  type: 'success' | 'error' | 'info' | 'warning' 
}>({ show: false, message: '', type: 'info' });
```

### Unused Variable Fixes
```typescript
// ❌ Unused variable warning
const handleOnboardingComplete = async (data: any) => {

// ✅ Prefix with underscore to indicate intentionally unused
const handleOnboardingComplete = async (_data: any) => {
```

---

## 🎯 Cloudscape Design System Gotchas

### 1. Navigation Items Structure
- Always use `as const` for type literals
- Dividers don't need text or href properties
- Links require both text and href

### 2. Form Handling
- Use native HTML `<form>` elements for form submission
- Cloudscape Form is for layout only
- Button components don't support HTML form attributes

### 3. Icon Names
- Use exact icon names from Cloudscape documentation
- Some icons may not be available in all versions

### 4. Header Variants
- Only specific variants are supported: `h1`, `h2`, `h3`
- `h4`, `h5` variants may not exist in all versions

---

## 🚀 Development Workflow

### Before Pushing to GitHub
1. **Run TypeScript Check:**
   ```bash
   npm run build
   ```

2. **Fix Critical Errors First:**
   - Focus on compilation errors (red)
   - Address warnings (yellow) if time permits

3. **Test Locally:**
   ```bash
   npm run dev
   ```

4. **Commit with Descriptive Messages:**
   ```bash
   git commit -m "Fix TypeScript errors in authentication components

   🔧 TypeScript Fixes:
   - Fixed Form component onSubmit prop issue
   - Added type-only import for AuthFormData interface
   - Fixed toast state type definition
   
   ✅ All TypeScript errors resolved"
   ```

### Debugging White Screen Issues
1. **Check Browser Console** - Look for JavaScript errors
2. **Check Network Tab** - Ensure all resources load
3. **Check TypeScript Compilation** - Run `npm run build`
4. **Check Component Exports** - Verify all imports resolve
5. **Check Routing** - Ensure React Router setup is correct

---

## 📚 Reference Links

### Cloudscape Design System
- [Components Documentation](https://cloudscape.design/components/)
- [SideNavigation API](https://cloudscape.design/components/side-navigation/)
- [Form Components](https://cloudscape.design/components/form/)

### TypeScript
- [Type-only Imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)
- [Const Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)

### React
- [New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

---

## 🏷️ Issue Categories

### 🔴 Critical (Blocks App)
- TypeScript compilation errors
- Missing exports/imports
- Runtime JavaScript errors

### 🟡 Warning (Should Fix)
- Unused imports
- Unused variables
- Type assertion warnings

### 🟢 Enhancement (Nice to Have)
- Code organization
- Performance optimizations
- Accessibility improvements

---

## 📝 Notes for Future Development

1. **Always test TypeScript compilation** before committing
2. **Use type-only imports** for interfaces and types
3. **Follow Cloudscape patterns** for component usage
4. **Keep this log updated** with new issues and solutions
5. **Reference this document** before starting similar projects

---

*Last Updated: 2025-08-30*  
*Project: MADMall Social Wellness Hub*  
*Maintainer: Development Team*