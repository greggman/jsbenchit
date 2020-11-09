import {createURL} from '../libs/url.js';
import {loadGistFromSrc} from '../libs/loader.js';
import {getAnonGist, getUserData} from '../libs/GitHub.js';
import {createResults, createTests, createPlatforms} from '../libs/result-helper.js';
import '../components/Results.css';

function e(tag, attrs = {}, children = []) { 
  const elem = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        elem[key][k] = v;
      }
    } else if (elem[key] === undefined) {
      elem.setAttribute(key, value);
    } else {
      elem[key] = value;
    }
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      elem.appendChild(child);
    }
  } else {
    elem.textContent = children;
  }
  return elem;
}

async function main() {
  const github = {
    async getAnonGist(gist_id) {
      return await getAnonGist(gist_id);
    }
  };

  const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const {data, rawData} = await loadGistFromSrc(params.src, github);
  const userData = getUserData(rawData);
  if (userData) {
    const userURL = `https://github.com/${userData.name}/`;
    const userElem = document.querySelector('#user');
    userElem.href = userURL;
    userElem.textContent = userData.name;
    const avatarLink = document.querySelector('#avatar-link');
    avatarLink.href = userURL;
    const avatarElem = document.querySelector('#avatar');
    avatarElem.src = userData.avatarURL;
  }
  const a = document.querySelector('.head a');
  a.textContent = `jsBenchIt - ${data.title}`;
  a.href = createURL(window.location.origin, {src: params.src});
  if (params.noheader) {
    document.querySelector('.head').style.display = 'none';
  }

  const contentElem = document.querySelector('.content');

  function latestResults(data, parent) {
    const tests = data.tests;
    parent.appendChild(e('div', {className: 'results-group'}, [
      e('div', {}, 'Latest Results:'),
      e('div', {}, [
        e('div', {className: 'results'}, [createResults({tests, getResultFn: test => test.results}, e)]),
      ]),
    ]));
  }

  function platforms(data, parent) {
    const tests = data.tests;
    parent.appendChild(e('div', {}, [createPlatforms({tests}, e)]));
  }

  function tests(data, parent) {
    const tests = data.tests;
    parent.appendChild(e('div', {}, createTests({tests}, e)));
  }

  const results = new Set((params.results || '').toLowerCase().split(','));
  const all = !results.has('latest') && !results.has('platforms') && !results.has('tests');

  if (all || results.has('latest')) {
    latestResults(data, contentElem);
  }
  if (all || results.has('platforms')) {
    platforms(data, contentElem);
  }
  if (all || results.has('tests')) {
    tests(data, contentElem);
  }

  if (params.resize) {
    const observer = new ResizeObserver(entries => {
      window.parent.postMessage({
        type: 'jsbenchit-resize',
        data: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight,
        },
      }, "*");
    });
    observer.observe(document.body);
  }
}

main();

