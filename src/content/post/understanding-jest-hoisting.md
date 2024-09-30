---
title: "Annoying AF! Friggin' Jest Hoisting, Man"
description: "Jest hoists `jest.mock`, causing initialisation errors; fix by declaring mocks early or using anonymous functions in mock factories."
publishDate: 25 Sep 2024
updatedDate: 01 Oct 2024
tags: ["testing", "jest"]
---

## How Does `jest.mock` Work?

> `jest.mock` is hoisted above `import` when used at top level and hoisted to the the beginning of the block when used in a block (test function scope, etc), same for `jest.unmock`. `jest.doMock` and `jest.dontMock` serve the same purpose but aren't hoisted.
>
> [Difference Between jest.doMock and jest.mock](https://stackoverflow.com/questions/64245013/difference-between-jest-mock-and-jest-domock)

I had an a-ha moment reading [solving the jest.mock()+esmodules hoisting problem](https://sunilpai.dev/posts/jest-hoist-await/) by Sunil Pai. Using his example, we have a module **a**.

```
// a.js
export const x = 123;
```

And we have a test for this module:

```
// a.test.js
import { x } from "./a";

jest.mock("./a", () => {
  return { x: 456 };
});

it("should be mocked", () => {
  expect(x).toBe(456); // this test should pass.
});
```

Although `x` is imported before its module is mocked, its value is what is set by the mock. Quoting Sunil:

> If this code behaved as it was written, you’d expect `x` to have the value `123`, since it was imported and destructured *before* its module was mocked. How is that possible?

It is possible because during test setup jest uses a babel plugin, [`babel-plugin-jest-hoist`](https://github.com/facebook/jest/blob/master/packages/babel-plugin-jest-hoist/README.md), which [will automatically hoist `jest.mock` calls to the top of the module (before any imports)](https://jestjs.io/docs/manual-mocks#using-with-es-module-imports).

Again quoting Sunil:

> This is cool because it solves a clear problem; you can’t technically write code before `import` statements, but when writing tests you *do* want to kinda do it.

### The Dreaded "Cannot Access Before Initialisation Error"

```javascript
const mockIsLoggedIn = jest.fn();

jest.mock('./utils', () => ({
 isLoggedIn: mockIsLoggedIn,
}));

it('does ... when user is logged in', () => {
   mockIsLoggedIn.mockReturnValue(true);
   
   ...
);
```

The test throws an error.

```cli
ReferenceError: Cannot access 'mockIsLoggedIn' before initialisation.
```

It happens because `jest.mock` gets hoisted to the top of the file, above the imports and the `mockIsLoggedIn` declaration. When `jest.mock('./utils')` runs, it can't find `mockIsLoggedIn`. An error is thrown because [a babel plugin--responsible for hoisting--checks variables that are being used in the mock factory to ensure that everything being used will be within scope after hoisting](https://github.com/kulshekhar/ts-jest/issues/1088#issuecomment-623033610).

There are two possible fixes. But before I explain these fixes I want to clear something up: prefixing variables used by a mock factory like `...isLoggedIn` does not solve this issue. Per below.

> Essentially, jest doesn't hoist variables starting with `mock`, but when hoisting mocked functions during initialisation, does not check if variables starting with `mock` are accessible when setting up the mocks. And therefore does not throw an error if they aren't in scope.
>
> [Variable beginning with 'mock' ist NOT hoisted.](https://github.com/kulshekhar/ts-jest/issues/3292#issuecomment-1088721363)

Prefixing variables with _mock_ is an [escape hatch](https://github.com/kulshekhar/ts-jest/issues/1088#issuecomment-623033610), a promise. You’re telling Jest and the transformers it uses: "Trust me, the variable (used by the mock factory) will be there (in scope) when it’s needed (at execution time)." [By using _mock_, you keep the transpiler from raising an exception](https://github.com/kulshekhar/ts-jest/issues/1088#issuecomment-562975615). It won’t complain because you've marked the variable as safe—"It’ll be there when the time comes." Prefixing with _mock_ avoids an out-of-scope error being thrown.

> ... Jest doesn't hoist variables starting with "mock", it only ignores them when checking in hoisted `jest.mock` factories for now-out-of-scope variable usage.
>
> [ts-jest does not hoist variables beginning with mock](https://github.com/kulshekhar/ts-jest/issues/1088#issuecomment-623033610)

Whew.

So, I was going to tell you how we fixed our error.

```cli
ReferenceError: Cannot access 'mockIsLoggedIn' before initialisation.
```

1. Declare the variable you're using in the mock factory at the top of the file.
2. Pass an anonymous function that returns your mock variable to the mock factory. This gives it a reference during setup, allowing it to ignore whether the mock variable exists at that moment. The mock variable isn’t needed until the mocked dependency is called or used.

#### Declaring Mock Variables at the Top-o-teh-File

If you declare the variable you’re using in the mock factory—`mockIsLoggedIn`—at the top of the test module, above the imports it places it above the mock factory, which is hoisted above the imports but not necessarily at the very tippy-top of the file. The downside is that the reason for doing this remains hidden and can only be understood if you're familiar with Jest's hoisting strategy.

```javascript
const mockIsLoggedIn = jest.fn(); <--- ABOVE ALL THE IMPORT STATEMENTS

jest.mock('./utils', () => ({
 isLoggedIn: mockIsLoggedIn,
}));

it('does ... when user is logged in', () => {
   mockIsLoggedIn.mockReturnValue(true);
   
   ...
);
```

#### Inline an Anonymous Function to the Mock Factory

At the point of mocking pass an anonymous function to the mock factory, doing this means it doesn’t look for variables that are out of scope since you’ve inlined an anonymous function to the mock factory. `mockIsLoggedIn` is only necessary during test execution, not during mock initialisation.

We make sure the mock factory isn’t searching for anything that’s uninitialised at the time of mocking. This allows you to mock the behaviour of the module indirectly. Jest needs to recognise what `mockIsLoggedIn` is and whether it's in scope at the moment of mock setup or initialisation. Remember, `mockIsLoggedIn` is only necessary during test execution, not during mock initialisation. This [resource](https://www.bam.tech/article/fix-jest-mock-cannot-access-before-initialization-error) does well to explain this.

```javascript
import ... from 'blah';

const mockIsLoggedIn = jest.fn();

jest.mock('./utils', () => ({
 isLoggedIn: (args) => mockIsLoggedIn(args), <--- PASS ANON FN TO MOCK FACTORY
}));

it('does ... when user is logged in', () => {
   mockIsLoggedIn.mockReturnValue(true);
   
   ...
   expect(mockIsLoggedIn).toHaveBeenCalledWith(mockArgs);
);
```

This works because each time `isLoggedIn` is called, `mockIsLoggedIn` is immediately invoked. This lets us shape the behavior and make assertions about `isLoggedIn` indirectly through `mockIsLoggedIn`.
