import React from 'react';
import Results from './Results';
import {parse} from 'platform';
import * as model from './model.js';

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
  renderTests() {
    const tests = model.getTests();
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

    const components = (
      <React.Fragment>
        <div>By Test:</div>
        <div>
          {
            tests.map((test, ndx) => {
              return (
                <div key={`test${ndx}`} className="results">
                  <div>{test.name}</div>
                  <Results 
                    tests={
                      platforms
                        .filter(platform => test.platforms[platform])
                        .map(platform => {
                          ++numResults;
                          return {
                            name: parse(platform).description,
                            results: test.platforms[platform],
                          };
                        })
                    }
                    getResultFn={test => test.results}
                  />
                </div>
              );
            })
          }
        </div>
      </React.Fragment>);

    return {
      numResults,
      components,
    };
  }
  render() {
    const {numResults, components} = this.renderTests();
    return (
      <div className="results-group">
        {numResults ? components : []}
      </div>
    );
  }
}