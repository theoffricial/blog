---
pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 03/09/2022
  author: Ofri Peretz
---

# Appendix Ⅲ: Cache Summary 🏴‍☠️ (Coming soon..)

<!-- jest use cache to improve test run time,
by storing results of heavy calculations e.g. like module resolution, and metadata about test result to improve test schedule order.

## Primary Objects Jest Cache

1. Module Resolution - during building the `hasteMap`, which is jest internal module system, it caches it to avoid the need to access the entire file system again. The `jest-haste-map` has a mechanism thanks to `fb-watchman` lib to build code deltas when changes occur.
2. Module Transformation - jest transform (transpile) each module "just-in-time" during the test run, it is an expensive action so jest cache the transform form of that module. According to what @christoph mentioned in his video about Jest Architecture that the transform step often takes more than 50% of the entire test run.
3. TestResults - After all tests completed the `@jest/test-sequencer` that determine the test run order save the `AggregatedTestResult` object into cache to use it for future runs. -->
