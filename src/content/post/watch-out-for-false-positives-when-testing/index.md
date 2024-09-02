---
title: "How to have less (scalp) flake with dependable tests"
description: "Be careful of flawed assertions in Cypress tests which can cause false positives and flakiness."
publishDate: 28 Aug 2024
updatedDate: 02 Sept 2024
tags: ["testing", "jest"]
---

## Achtung! Be careful of false positives when testing

The example I am going to give comes from a Cypress test suite.

A test was failing because it could not find the text it expected because the loading spinner was still in the document.

![Where our test hangs and fails.](./cypress-screenshot.png)

![A flukey assertion that leads to our false positive.](./false-positive-assertion.png)

As can be seen in the above image, we *think* we are writing deliberate assertions that improve the tests robustness when in fact they aren't doing anything and are false positives.

We make assertions on the loading spinner not being present **so that** we can be confident that the operation has completed and we can continue with our test. Unfortunately our method for asserting yields nothing which satisfies the check of _"does not exist"_ and so undermines our confidence in the state of what is being tested. This is flakiness.

It is worth nothing that using **findByLabelText** should and would be the preferred option had we written our components with semantic HTML.
