import React from 'react';
import Results from './Results';

export default function LatestResults(props) {
  const {tests} = props;

  return (
    <div className="results">
      <div>Latest Results:</div>
      <Results tests={tests} getResultFn={test => test.results} />
    </div>
  );
}