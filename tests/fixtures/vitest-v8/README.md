# Real coverage regression fixture

Generated with Vitest 5.0.3, @vitest/coverage-v8 5.0.3, and Node 22.23.3 on 2026-10-08. Paths were normalized to local filenames; maps and counters were retained.

The executed test called label(true), classify(1), makeSelector(2)(1), new Client(2).selected, new Client(2).compute(3), empty(), and overload("value"). The never-imported module was included in coverage but was never loaded by tests.

This fixture verifies source matching for arrow expressions, default parameters, a nested callback, parameter properties, getters, methods, empty functions, overloads, and never-imported functions. In particular, the actual reporter emits null end columns; synthetic finite-column fixtures alone missed that format.
