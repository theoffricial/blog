# Verify Test Code ✅

This short article, is about the importance of doubt and double verification.

Unit tests are tricky, we write them to increase [confidence](./pros.md#confidence) the product quality and stability.
But because we are because humans who tend to do unexpected errors. It sometimes leads to over-confidence, that can lead to mistakes and product bugs.

<!-- arrogance -->

## 🔴 State is "bad", But never Lie

First, let me show you that `1 + 1 = 2`.

```ts
test('1 + 1 = 2', () => expect(1 + 1).toBe(2)); // 🟢 true
test('1 + 1 = 2', () => expect(1 + 2).toBe(3)); // 🟢 lies
test('1 + 1 = 2', () => {expect(1 + 1).toBe(3)); // 🔴 being honest

```

Do you see the problem? 🔴 state always honest, but 🟢 state can lie!

When a product gets bigger, and hundred of tests exists, it is arduous to track all of them, combining the fact that `🟢 state can lie`, and our result is simple, always doubt.

Let review some quick techniques you can use to double verify your tests.

## 2 Techniques to Quickly Remove Your Doubts

### 1. Comment the production-code Being Tested

Comment the production-code piece being tested, in which the test aims to cover, re-run the test and see if it is still a 🟢 state.

This technique verifies if your expectation has no relation to the production code.

🔴 state = what you are expecting
🟢 state = means the test has an issue.

<!-- Production code is what we want to test, so when having a doubt in the reliability of a test,
Comment the production-code case the test-code aims to cover, re-run the test and find you answer. -->

### 2. Changing the Test Expected Value

Change the expected value of your test, re-run the test.

🔴 state = what you are expecting
🟢 state = means the test has an issue.

This technique verifies if you are not do assertion on the wrong indication for success.

---

As I mentioned earlier, as human-beings, we do mistakes.
If you have other expectations from yourself, the history says that the odds are against you.

Always doubt yourself, your team, your colleges, and so on (and look together for what is true).
