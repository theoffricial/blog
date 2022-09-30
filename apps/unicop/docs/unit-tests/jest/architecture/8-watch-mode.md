# Unit Tests - Jest - Architecture - 7. Watch Mode

The Jest Architecture Series

1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. [Jest - How Tests Run](./4-running-tests.md)
5. **_[Isolate Test Runtime Environment](./4-running-tests.md) 👈 You are here_**

---

The watch mode which is a continuos test run is using all the architecture the same way, but it has some optimizations on the way, during the `jest-haste-map` step, the `fb-watchman` has the ability to provide next to being able to ask, "hey what has changed on the file system since the last time I asked you what has changed?" it also allows to listen for those changes so when you call jest with `--watch` it will ask `jest-haste-map` to watch file changes because it has a watcher to talk to `fb-watchman` or nodejs and ask "hey listen to all the file changes and tell me what has changed" so based on file changes the `jest-cli` says "OK, whenever something is changing, give me the updated `haste-map` according to that change.

The `jest-haste-map` has an optimization system so when a file changes it only changes whatever is necessary to change it, it means that `jest-haste-map` doesn't have to crawl the entire file system, again.

it also does this thing work it batches file system changes so it doesn't give you many file system change events, it will batch the events up every 30ms or so and list all the files that have changed so it doesn't like just call `jest-cli` all the time to rerun all the tests.

So once again it works as the following, the `jest-cli` listens to `jest-haste-map` for what files are changing and then `jest-haste-map` tells the `jest-cli` what has changed and then `jest-cli` goes through all the process after receiving the `haste-map`
