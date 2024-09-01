---
title: "Watch out for false positives when testing"
description: "Dunno just yet. Fill this in."
publishDate: "28 Sept 2024"
updatedDate: 30 Sept 2024
tags: ["testing", "jest"]
---

## Be careful with false positive test assertions

The example I am going to give comes from a Cypress test suite.

A test was failing because it could not find the text it expected because the loading spinner was still in the document.

![[Screenshot 2024-08-28 at 4.15.38 PM.png]]

![[Pasted image 20240828160002.png]]

As can be seen in the above image, we _think_ we are writing deliberate assertions that improve the tests robustness when in fact they aren't doing anything and are false positives.

We make assertions on the loading spinner not being present **so that** we can be confident that the operation has completed and we can continue with our test. Unfortunately our method for asserting yields nothing which satisfies the check of *"does not exist"* and so undermines our confidence in the state of what is being tested. This is flakiness.

It is worth nothing that using `findByLabelText` should and would be the preferred option had we written our components with semantic HTML. 
