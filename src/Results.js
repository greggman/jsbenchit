import React from 'react';
import {hsl} from './color-utils.js';
import {classNames} from './css-utils.js';
import {formatResults, testResultsAreValid} from './model.js';

const darkMatcher = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : {};

function Result(props) {
  const isDarkMode = darkMatcher.matches;
  const {max, test} = props;
  const {name, results} = test;
  const {aborted, hz} = results;
  const unRun = hz === undefined;
  const msg = aborted ? 
     'aborted' :
     unRun
         ? 'not run'
         : formatResults(results);
  const zeroToOne = hz / max;
  const width = aborted || unRun ? '100%' : `${(zeroToOne * 100).toFixed(1)}%`;
  const background = (aborted || unRun) ? {} : {background: hsl(1 / 7 - zeroToOne / 7, 1, isDarkMode ? 0.4 : 0.8)};

  return (
    <div className={classNames("result", {aborted, unRun})}>
      <div className="result-bar" style={{
        width,
        ...background,
      }}>
      </div>
      <div className="result-info" style={{}}>
        <div className="result-name">{name}</div>
        <div className="result-result">{msg}</div>
      </div>
    </div>
  )
}



export default function Results(props) {
  const {tests} = props;
  const max = tests
      .filter(testResultsAreValid)
      .reduce((max, test) => Math.max(max, test.results.hz || 0), 0);
  return (
    <div>
      {
        tests.map((test, ndx) => (<Result max={max} test={test} key={`res${ndx}`} />))
      }
    </div>
  );
};