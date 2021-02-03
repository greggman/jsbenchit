/* global Benchmark */

(async function(model) {
  // there might be a cleaner way to do this but for now ...
  delete window.model;
  const log = _ => _;
  //const log = console.log.bind(console);
  const benchmarkToData = b => {
    const stats = {
      ...(b.stats && b.stats),
      numSamples: b.stats ? b.stats.sample.length : 0,
    };
    delete stats.sample;
    return {
      aborted: b.aborted,
      //compiled: b.compiled,
      id: b.id,
      name: b.name,
      count: b.count,
      cycles: b.cycles,
      message: b.message,
      hz: b.hz,
      stats,
      ...(b.times && {times: {...b.times}}),
      // error is a built in type like ReferenceError where
      // the spread operator does not work
      ...(b.error && {error: {message: b.error.message, stack: b.error.stack}}),
    };
  };

  if (model.settings?.test) {
    const testSettings = {
      delay: 0,
      initCount: 1,
      maxTime: 0.00001,
      minSamples: 1,
      minTime: 0.00001,
    };
    Object.assign(Benchmark.options, testSettings);
  }

  const suite = new Benchmark.Suite('WTF', {
    onAbort: (e) => {
      log('onAbort:', e);
    },
    onError: (e) => {
      log('onError:', e);
      if (e.target?.error) {
        const ndx = e.target.id - 1;
        const test = model.tests[ndx];
        console.error(`${test?.name}:`, e.target.error);
      }
      const data = benchmarkToData(e.target);
      window.parent.postMessage({type: 'error', data}, "*");
    },
    onCycle: (e) => {
      log('onCycle:', e);
      const data = benchmarkToData(e.target);
      window.parent.postMessage({type: 'cycle', data}, "*");
    },
    onComplete: (e) => {
      log('onComplete:', e);
      const data = e.currentTarget.map(benchmarkToData);
      window.parent.postMessage({type: 'complete', data}, "*");
    },
  });
  model.tests.forEach((test, i) => suite.add({
    name: `${i}`,
    fn: test.code,
  }));
  if (Benchmark.init) {
    await Benchmark.init();
  }
  window.parent.postMessage({type: 'start'}, '*');

  Benchmark.prototype.setup = model.setup;
  suite.run({
    async: true,
    defer: true,
  });

  const handlers = {
    abort: () => {
      suite.abort();
    },
  };

  window.addEventListener('message', (e) =>{
    const {type, data} = e.data;
    handlers[type](data);
  });
}(window.___model));