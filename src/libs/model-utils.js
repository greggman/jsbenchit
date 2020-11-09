
export function resultsAreValid(results) {
  return results && ! results.error && !results.aborted;
}

export function testResultsAreValid(test) {
  return resultsAreValid(test.results);
}

function formatNumber(number) {
  number = String(number).split('.');
  return `${number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',')}${(number[1] ? `.${number[1]}` : '')}`;
}

export function formatResults(results) {
  const {hz = 0, stats = {numSamples: 0, rme: 0}} = results;
  const opsPerSec = formatNumber(hz.toFixed(hz < 100 ? 2 : 0));
  const plusMinus = stats.rme.toFixed(2);
  return `${opsPerSec} ops/sec ±${plusMinus}% (runs: ${stats.numSamples})`;
}