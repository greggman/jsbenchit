import React from 'react';
import * as model from '../libs/model.js';
import {createTests} from '../libs/result-helper.js';

export default class Tests extends React.Component {
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
    return createTests({tests}, React.createElement);
  }
}