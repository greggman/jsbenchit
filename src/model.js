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
  return trackedValues[name];
}

export function set(name, newValue) {
  const trackedValue = trackedValues[name];
  if (!trackedValue) {
    throw new Error(`no such track value: ${name}`);
  }
  trackedValue.value = newValue;
  const fns = [...trackedValue.subscriptions.keys()];
  setTimeout(() => {
    for (const fn of fns) {
      fn(newValue, name);
    }
  });
}

export function subscribe(name, fn) {
  const trackedValue = getValueOrMakeNew(name);
  trackedValue.subscriptions.add(fn);
}

export function unsubscribe(name, fn) {
  const trackedValue = getValueOrMakeNew(name);
  trackedValue.subscriptions.delete(fn);
}

export const newTestData = {
  "title": "My Test",
  "description": "",
  "html": "// html",
  "setup": "// javascript setup",
  "tests": [
    {
      name: "test 1",
      code: "// put test code here",
    },
    {
      name: "test 2",
      code: "// put test code here",
    },
  ],
};

export let data = {
  "title": "My test",
  "description": "blu blu blu",
  "html": "<hr>",
  "setup": `const vowelArray = ['a', 'e', 'i', 'o', 'u'];
const isVowelByArray = c => vowelArray.includes(c.toLowerCase());
const isVowelByOr = c => {
  c = c.toLowerCase();
  return c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u';
}
const test = new Array(1000).fill(0).map(_ => String.fromCharCode(0x61 + Math.random() * 26 | 0)).join('');
const expected = test.split('').reduce((sum, c) => sum + isVowelByArray(c), 0);
const verify = result => {
  if (result !== expected) {
    throw new Error(\`actual: $\{result} not equal to expected: $\{expected}\`);
  }
};
console.log('-setup-');
`,
  "tests": [
    {
      name: "test1",
      code: `let sum = 0;
for (let i = 0; i < test.length; ++i) {
  sum += isVowelByArray(test[i]);
}
verify(sum);
`,
      result: 75,
    },
    {
      name: "test2",
      code: `let sum = 0;
for (let i = 0; i < test.length; ++i) {
  sum += isVowelByOr(test[i]);
}
verify(sum);
`,
      result: 57,
    },
  ],
}

add('dataVersion', 0);

function notify() {
  set('dataVersion', get('dataVersion') + 1);
}

export function addTest() {
  const name = `test ${data.tests.length + 1}`;
  data.tests.push({
    name,
    code: `// ${name}`,
  });
  notify();
}

export function setTestName(ndx, name) {
  data.tests[ndx].name = name;
  notify();
}

export function setTestCode(ndx, code) {
  data.tests[ndx].code = code;
  notify();
}

export function deleteTest(ndx) {
  data.tests.splice(ndx, 1);
  notify();
}

export function setData(newData) {
  // TODO: Validate!
  data = newData;
  notify();
}