# Unit Tests - Theory - Verify Test Code ✅

When you write test code, you should always doubt yourself if the test you just wrote works as you expected, even if you got a 🟢 state.

Why? because you are human, and humans tend to do unexpected errors.

For instance, if some test code has an error and that error cause the test to always return a 🟢 state, it isn't just has no purpose, but the test-code also lies to you and make you think that the production-code works as you expected.

For these cases, when you suspect test-code has an issue, you can do one of 2 things that will reveal the issue quickly:

1. Comment the production-code case the test-code aims to cover, re-run the test and find you answer.
2. Change the test-code expected value, re-run the test and see if it still a 🟢 state.

As I mentioned before, we all humans, don't think it cannot happen to you, especially when you have tight schedule and the code is complicated.
