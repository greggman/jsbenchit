import {parse} from 'platform';
import {hsl} from '../libs/color-utils.js';
import {classNames} from '../libs/css-utils.js';
import {formatResults, testResultsAreValid} from '../libs/model-utils.js';

const darkMatcher = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : {};

export function createResult(props, e) {
  const isDarkMode = darkMatcher.matches;
  const {max, test, result, key} = props;
  const {name} = test;
  const {aborted, hz} = result;
  const unRun = hz === undefined;
  const msg = aborted ? 
     'error/aborted' :
     unRun
         ? 'not run'
         : formatResults(result);
  const zeroToOne = hz / max;
  const width = aborted || unRun ? '100%' : `${(zeroToOne * 100).toFixed(1)}%`;
  const background = (aborted || unRun) ? {} : {background: hsl(1 / 7 - zeroToOne / 7, 1, isDarkMode ? 0.4 : 0.8)};

  return e('div', {key: key, className: classNames("result", {aborted, unRun})}, [
    e('div', {key: 'a',className: "result-bar", style: {
       width,
        ...background,
      }},
    ),
    e('div', {key: 'b', className: "result-info"}, [
      e('div', {key: 'a', className: "result-name"}, name),
      e('div', {key: 'b', className :"result-result"}, msg),
    ]),
  ]);
}

export function createResults(props, e) {
  const {tests, getResultFn, key = 'n'} = props;
  const max = tests
      .filter(testResultsAreValid)
      .reduce((max, test) => Math.max(max, getResultFn(test).hz || 0), 0);
  return e('div', {key: key}, 
    tests.map((test, ndx) => createResult({max, test, result: getResultFn(test), key: `res${ndx}`}, e))
  );
}

export function createTests(props, e) {
  const {tests} = props;
  // TODO: as this is costly we should decide how to optimize
  // 1. change the format?
  // 2. use shouldComponent
  let numResults = 0;
  const platforms = [...tests.reduce((platforms, test) => {
    return Object.keys(test.platforms).reduce((platforms, plat) => {
      platforms.add(plat);
      return platforms;
    }, platforms);
  }, new Set())];
 
  const elements = e('div', {key: 'a', className: "results-group"}, [
    e('div', {key: 'a'}, 'By Test:'),
    e('div', {key: 'b'}, tests.map((test, ndx) => e('div', {key: `test${ndx}`, className: "results"}, [
      e('div', {key: 'name'}, test.name),
      createResults({
        key: 'r',
        tests: platforms
          .filter(platform => test.platforms[platform])
          .map(platform => {
            ++numResults;
            return {
              name: parse(platform).description,
              results: test.platforms[platform],
            };
          }),
        getResultFn: test => test.results,
      }, e),
    ]))),
  ]);

  return numResults ? [elements] : [];
}

export function createPlatforms(props, e) {
  const {tests, onClickFactory} = props;

  // TODO: as this is costly we should decide how to optimize
  // 1. change the format?
  // 2. use shouldComponent
  const platforms = [...tests.reduce((platforms, test) => {
    return Object.keys(test.platforms).reduce((platforms, plat) => {
      platforms.add(plat);
      return platforms;
    }, platforms);
  }, new Set())];

  return e('div', {key: 'a', className: "results-group"}, [
    ...(platforms.length ? [
      e('div', {key: 'a'}, 'By Platform:'),
      e('div', {key: 'b'},
        platforms.map((platform, ndx) =>
          e('div', {key: `plat${ndx}`, className: "results"}, [
            e('div', {key: 'a'}, [
              e('span', {key: 'a'}, parse(platform).description),
              ...(onClickFactory ? [e('div', {
                key: 'b',
                className: "delete",
                onClick: onClickFactory(platform),
              }, 'ⓧ')] : []),
            ]),
            createResults({
              tests: tests.filter(test => test.platforms[platform]),
              getResultFn: test => test.platforms[platform],
              key: 'b',
            }, e),
          ]),
        )
      ),
    ] : []),
  ]);
}