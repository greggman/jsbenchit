import React from 'react';
import Results from './Results';
import {parse} from 'platform';
import * as model from './model.js';

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

    // TODO: as this is costly we should decide how to optimize
    // 1. change the format?
    // 2. use shouldComponent
    const platforms = [...tests.reduce((platforms, test) => {
      return Object.keys(test.platforms).reduce((platforms, plat) => {
        platforms.add(plat);
        return platforms;
      }, platforms);
    }, new Set())];

    return (
      <div className="results-group">
        {platforms.length
          ? (
          <React.Fragment>
            <div>By Platform:</div>
            <div>
              {
                platforms.map((platform, ndx) => {
                  return (
                    <div key={`plat${ndx}`} className="results">
                      <div>{parse(platform).description}
                        <div
                          className="delete"
                          onClick={() =>{
                            model.deleteTestPlatform(platform);
                          }}
                        >ⓧ</div>
                      </div>
                      <Results 
                        tests={tests.filter(test => test.platforms[platform])}
                        getResultFn={test => test.platforms[platform]}
                      />
                    </div>
                  );
                })
              }
            </div>
          </React.Fragment>)
          : []
        }
      </div>
    )
  }
}