/* global Benchmark */
/* global model */

(async function() {
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
      hz: b.hz,
      stats,
      ...(b.times && {times: {...b.times}}),
      ...(b.error && {error: {...b.error}}),
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
    onAbort: () => {},
    onError: (e) => {
      const data = benchmarkToData(e.target);
      window.parent.postMessage({type: 'error', data}, "*");
    },
    onCycle: (e) => {
      const data = benchmarkToData(e.target);
      window.parent.postMessage({type: 'cycle', data}, "*");
    },
    onComplete: (e) => {
      const data = e.currentTarget.map(benchmarkToData);
      window.parent.postMessage({type: 'complete', data}, "*");
    },
  });
  model.tests.forEach((test, i) => suite.add({
    name: `${i}`,
    fn: test.code,
  }));
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
}());