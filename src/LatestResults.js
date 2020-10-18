import React from 'react';
import Results from './Results';
import * as model from './model';

export default class LatestResults extends React.Component {
//  constructor(props) {
//    super(props);
//  }
  handleChange = () => {
    this.forceUpdate();
  }
  componentDidMount() {
    model.subscribe(model.resultsVersionKey, this.handleChange);
  }
  componentWillUnmount() {
    model.unsubscribe(model.resultsVersionKey, this.handleChange);
  }
  render() {

    const tests = model.getTests();
    return (
      <div className="results">
        <div>Latest Results:</div>
        <Results tests={tests} getResultFn={test => test.results} />
      </div>
    );
  }
}