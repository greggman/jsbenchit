# JsBenchIt

## The Flow

short version

```
Initialization()
for each test
  while 5 seconds have not passed
    BeforeEachTest()
    test();
```

longer version

```
Initialization()
for each test
  elapsedTime = 0;
  operations = 0;
  while elapsedTime < 5 seconds
    ++operations;
    BeforeEachTest()
    start = getTime()
    test();
    elapsedTime += getTime() - start;
  result = operations / elapsedTime;
```

JsBenchIt uses [Benchmark.js](https://github.com/bestiejs/benchmark.js/). It tries to run each test as many times as possible for 5 seconds each so a short testcase might be run millions of times whereas a long testcase will be run less times. The result is how many times it was able to run the test in the given amount of time.

## How to write a valid benchmark

### Don't put non-essential code in a test case.

Be aware that non-essential code into a test case may affect results.
See [this test](https://jsbenchit.org/?src=39ff87c100f9abd8a7c9e5b7a7f3f12d). 

What to notice is the code in the test `byForLocalReduce`
is creating a new closure via the arrow function every time it's called
where as `byForGlobalReduce` the closure is made only once at init time.

Be careful you're not making an invalid comparison by doing work in your
test case that should happen at init time. Examples include creating
arrow functions in your test case, creating test data in your test case,
creating regular expressions in your test case. Move all that to init
time.

### Check that each test returns the same results

I know, at least for me, without at least some sanity check I often
think one way was faster but it turns out it wasn't actually solving
the problem correctly.

## Don't compare across machines

In general it makes no sense to compare across machines. They'll likely
have different processors running at different speeds with different
speed memory etc... Knowing that machine A is faster than machine B
might be fun but the site is for comparing algorithms, not machines.

## Check multiple browsers

Browsers are vastly different which things they optimize well and which
they don't so before you're sure your technique is a winner, check
it's results in other browsers.

## Check work sizes

Sometimes an algorithm that's faster for 10 elements is slower
for 10000 elements. You can't test these in the same test but
at least be aware that certain algorithms might have overhead
that's slower for small sets but pays off for large sets.
