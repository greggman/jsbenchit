import Ajv from 'ajv';

import {isDevelopment} from './flags.js';
import schema from './schema.json';
import SubscriptionManager from './subscription-manager.js';

const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
const validator = ajv.compile(schema);

const trackedValues = {};

function getValueOrMakeNew(name) {
  const trackedValue = trackedValues[name] || {
    subscriptions: new Set(),
  };
  trackedValues[name] = trackedValue;
  return trackedValue;
}

export function add(name, initialValue) {
  const trackedValue = getValueOrMakeNew(name);
  if (initialValue !== undefined) {
    trackedValue.value = initialValue;
  }
  return trackedValue;
}

export function get(name) {
  return trackedValues[name].value;
}

export function set(name, newValue) {
  const trackedValue = trackedValues[name];
  if (!trackedValue) {
    throw new Error(`no such track value: ${name}`);
  }
  trackedValue.value = newValue;
  const fns = [...trackedValue.subscriptions.keys()];
  for (const fn of fns) {
    fn(newValue, name);
  }
}

export function subscribe(name, fn) {
  const trackedValue = getValueOrMakeNew(name);
  trackedValue.subscriptions.add(fn);
}

export function unsubscribe(name, fn) {
  const trackedValue = getValueOrMakeNew(name);
  trackedValue.subscriptions.delete(fn);
}

const newTestData = {
  "title": "My Test",
  "initialization": "// runs once",
  "setup": "// runs before each test",
  "tests": [
    {
      name: "test 1",
      code: "// put test code here",
      results: {},
      platforms: {},
    },
    {
      name: "test 2",
      code: "// put test code here",
      results: {},
      platforms: {},
    },
  ],
};
export function getNewTestData() {
  return JSON.parse(JSON.stringify(newTestData));
}

/* eslint no-template-curly-in-string:0 */
export let data;

export const dataVersionKey = 'dataVersion';
export const updateVersionKey = 'updateVersion';
export const resultsVersionKey = 'resultsVersion';
export const testsVersionKey = 'testsVersion';

add(dataVersionKey, 0);   // any data changes (when an item in the data is change)
add(updateVersionKey, 0);  // all data changes (when the entire data objects replaced with new data)
add(resultsVersionKey, 0);  // results and test name changes
add(testsVersionKey, 0);  // tests added or removed or the main name is changed

const incVersion = key => set(key, get(key) + 1);
const incDataVersion = _ => incVersion(dataVersionKey);
const incResultsVersion = _ => incVersion(resultsVersionKey);
const incTestsVersion = _ => incVersion(testsVersionKey);
const incUpdateVersion = _ => {
  incVersion(updateVersionKey);
  incDataVersion();
  incTestsVersion();
  incResultsVersion();
};

export function addTest() {
  const name = `test ${data.tests.length + 1}`;
  data.tests.push({
    name,
    code: `// ${name}`,
    results: {},
    platforms: {},
  });
  incDataVersion();
  incTestsVersion();
}

export function deleteTest(ndx) {
  data.tests.splice(ndx, 1);
  incDataVersion();
  incTestsVersion();
  incResultsVersion();
}

const testSubscriptionManager = new SubscriptionManager();

export function subscribeTest(test, fn) {
  testSubscriptionManager.subscribe(test, fn);
}

export function unsubscribeTest(test, fn) {
  testSubscriptionManager.unsubscribe(test, fn);
}

export function getTests() {
  return data.tests;
}

export function setTitle(title) {
  data.title = title;
  incDataVersion();
  incResultsVersion();
  incTestsVersion();
}

export function setInitialization(init) {
  data.initialization = init;
  incDataVersion();
}

export function setSetup(setup) {
  data.setup = setup;
  incDataVersion();
}

export function setTestName(ndx, name) {
  const test = data.tests[ndx];
  test.name = name;
  incDataVersion();
  incResultsVersion();
  testSubscriptionManager.notify(test);
}

export function setTestCode(ndx, code) {
  const test = data.tests[ndx];
  test.code = code;
  incDataVersion();
  testSubscriptionManager.notify(test);
}

export function setTestResult(ndx, results, platform) {
  const test = data.tests[ndx];
  test.results = results;
  test.platforms[platform] = results;
  incDataVersion();
  incResultsVersion();
}

export function deleteTestPlatform(platform) {
  for (const test of data.tests) {
    delete test.platforms[platform];
  }
  incDataVersion();
  incResultsVersion();
}


export function validate(data) {
  if (!validator(data)) {
    debugger;
    throw new Error(`data not valid:\n${validator.errors.map(e => `${e.message}: ${e.dataPath}`)}`);
  }
}

export function setData(newData) {
  validate(newData);
  data = newData;
  incUpdateVersion();
  if (isDevelopment) {
    window.d = data;
  }
}

export function clearAllTestResults() {
  for (const test of data.tests) {
    test.results = {};
  }
  incDataVersion();
  incResultsVersion();
}

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

setData(isDevelopment ? {
  "title": "My test",
  "setup": "",
  "initialization": "const vowelArray = ['a', 'e', 'i', 'o', 'u'];\nconst isVowelByArray = c => vowelArray.includes(c.toLowerCase());\nconst isVowelByOr = c => {\n  c = c.toLowerCase();\n  return c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u';\n}\nconst test = new Array(1000).fill(0).map(_ => String.fromCharCode(0x61 + Math.random() * 26 | 0)).join('');\nconst expected = test.split('').reduce((sum, c) => sum + isVowelByArray(c), 0);\nconst verify = result => {\n  if (result !== expected) {\n    throw new Error(`actual: ${result} not equal to expected: ${expected}`);\n  }\n};\nconsole.log('-setup-');\n",
  "tests": [
    {
      "name": "test1",
      "code": "let sum = 0;\nfor (let i = 0; i < test.length; ++i) {\n  sum += isVowelByArray(test[i]);\n}\nverify(sum);\n",
      "results": {
        "aborted": false,
        "count": 3925,
        "cycles": 6,
        "hz": 48757.763975155285,
        "stats": {
          "numSamples": 45,
          "moe": 1.3253034196794547e-7,
          "rme": 0.6461883133219702,
          "sem": 6.761752141221708e-8,
          "deviation": 5.409401712977366e-7,
          "mean": 0.000020509554140127386,
          "variance": 2.926162689236246e-13
        },
        "times": {
          "cycle": 0.08049999999999999,
          "elapsed": 6.087,
          "period": 0.000020509554140127386,
          "timeStamp": 1602070187852
        }
      },
      "platforms": {
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36": {
          "aborted": false,
          "count": 3925,
          "cycles": 6,
          "hz": 48757.763975155285,
          "stats": {
            "numSamples": 45,
            "moe": 1.3253034196794547e-7,
            "rme": 0.6461883133219702,
            "sem": 6.761752141221708e-8,
            "deviation": 5.409401712977366e-7,
            "mean": 0.000020509554140127386,
            "variance": 2.926162689236246e-13
          },
          "times": {
            "cycle": 0.08049999999999999,
            "elapsed": 6.087,
            "period": 0.000020509554140127386,
            "timeStamp": 1602070187852
          }
        }
      }
    },
    {
      "name": "test2",
      "code": "let sum = 0;\nfor (let i = 0; i < test.length; ++i) {\n  sum += isVowelByOr(test[i]);\n}\nverify(sum);\n",
      "results": {
        "aborted": false,
        "count": 4467,
        "cycles": 4,
        "hz": 55738.7911907046,
        "stats": {
          "numSamples": 45,
          "moe": 1.6987329815854215e-7,
          "rme": 0.9468532294935285,
          "sem": 8.667005008088886e-8,
          "deviation": 6.879221958946363e-7,
          "mean": 0.00001794082682164028,
          "variance": 4.732369476044983e-13
        },
        "times": {
          "cycle": 0.08014167341226712,
          "elapsed": 5.979,
          "period": 0.00001794082682164028,
          "timeStamp": 1602070193946
        }
      },
      "platforms": {
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36": {
          "aborted": false,
          "count": 4467,
          "cycles": 4,
          "hz": 55738.7911907046,
          "stats": {
            "numSamples": 45,
            "moe": 1.6987329815854215e-7,
            "rme": 0.9468532294935285,
            "sem": 8.667005008088886e-8,
            "deviation": 6.879221958946363e-7,
            "mean": 0.00001794082682164028,
            "variance": 4.732369476044983e-13
          },
          "times": {
            "cycle": 0.08014167341226712,
            "elapsed": 5.979,
            "period": 0.00001794082682164028,
            "timeStamp": 1602070193946
          }
        }
      }
    }
  ]
} : getNewTestData());
