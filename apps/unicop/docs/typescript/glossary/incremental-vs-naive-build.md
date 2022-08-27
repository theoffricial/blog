# Incremental Vs. Naive Build 🧠

Incremental build - When a compiler/transpiler program save information on previous compilation, to have a sort of understanding and detecting the least costly way to do the compilation next time.
The information usually maps the project dependencies graph and use it to re-build only parts that depend on the latest changes, which each tool implements it in its own method.
