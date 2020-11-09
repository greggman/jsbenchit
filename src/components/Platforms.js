import React from 'react';
import * as model from '../libs/model.js';
import { createPlatforms } from '../libs/result-helper.js';

export default class Platforms extends React.Component {
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
    return createPlatforms({
      tests,
      onClickFactory: platform => platform => model.deleteTestPlatform(platform),
    }, React.createElement);
  }
}