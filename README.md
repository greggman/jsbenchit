# JSBenchIt

See [jsbenchit.org](https://jsbenchit.org)

A JavaScript Perf Tester based on Github Gists.
It's your data!

Also see [jsgist.org](https://jsgist.org)

## Why? 

JSPerf disappeared, JSBench.me is hard to read. JSBen.ch
is buggy and can't save more than a small amount of text.
It seemed to me this might not be that hard (famous last words 😅).

In any case this is open source so contributions welcome.

## TODO

- [ ] Support async tests?

  The simplest way would just be if the code to returns a promise it's async.
  What's a good example of an async test though? Maybe testing
  passing data to a worker and back?

- [ ] support github login instead of using personal access tokens?

   I didn't do that originally because there is no way to login
   with github without a server in the middle. It might be simple
   to add a server if the only thing it does is do the oauth
   redirect. I'm just worried about maintenance and costs.
   
- [ ] mobile formatting

   I haven't really bothered with mobile formatting other than
   checking that it seems to run and not be too messed up.

- [ ] Let you delete gists?

   As it is you need to go to github to delete

- [ ] Let you disable tests?

   It's really annoying to have save 5 tests and
   you click run and don't find out test 5 is bad
   until tests 1 through 4 have run

- [ ] Let you run individual tests

   Another solution to disabling test

- [ ] Run each test 1 iteration to start

   This should surface bugs immediately. These
   would not be part of the benchmark.

## License: [MIT](LICENSE.md)
