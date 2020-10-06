import React from 'react';

function Progress(props) {
  const {max, value, text} = props;
  return (
    <div className="result-result">
        <span style={{width: `${value / max * 100 | 0}%`}}>{text}</span>
    </div>
  );
}

function Result(props) {
  const {name, result} = props.test;
  return (
    <div className="result">
      <div className="result-name">{name}</div>
      <Progress max="100" value={result} className="result-result" text={result} />
    </div>
  )
}

export default function Results(props) {
  const {tests} = props;
  return (
    <div className="results">
      {
        tests.map((test, ndx) => (<Result test={test} key={`res${ndx}`} />))
      }
    </div>
  );
};