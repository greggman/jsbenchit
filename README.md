# JSBenchIt

See [jsbenchit.org](https://jsbenchit.org)

A JavaScript Perf Tester based on Github Gists.
It's your data! 😍

# Docs

[See Here](docs/index.md)

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

- [X] support github login instead of using personal access tokens?

   I didn't do that originally because there is no way to login
   with github without a server in the middle. It might be simple
   to add a server if the only thing it does is do the oauth
   redirect. I'm just worried about maintenance and costs.
   
- [ ] mobile formatting

   I haven't really bothered with mobile formatting other than
   checking that it seems to run and not be too messed up.

- [ ] Let you delete gists?

   As it is you need to go to github to delete
   
- [X] Better error handling

   Something is eating error messages making it hard to debug.

- [ ] replace or refactor Benchmark.js

   Benchmark.js is old, abandoned, and arguably has some issues.
   
   - [ ] make it use `performance.now`
   
   - [ ] add a means to distinguish between an error in the
     setup/teardown code and an error in a test case so we can tell the user which of those 3 places the error appears.
   
   - [ ] translate error
     line numbers so that an error could say `error at test4 line 5`
     where as now it says 
     `Benchmark.uid1612323878896createFunction [as compiled] (<anonymous>:4:1)`
     where the `4` includes the setup code

- [ ] on error highlight or at least move the cursor to the correct line

- [X] display errors

   Just display the errors above the latest results, clear it on run

## License: [MIT](LICENSE.md)

## Misc

Also see [jsgist.org](https://jsgist.org)
