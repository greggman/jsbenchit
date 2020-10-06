import React from 'react';

import { classNames } from './css-utils.js';
import EditLine from './EditLine.js';
import GitHub from './GitHub.js';
import * as model from './model.js';
import NamedCodeArea from './NamedCodeArea.js';
import TestArea from './TestArea.js';
import Results from './Results.js';
import runTests from './run-tests.js';
import SaveAs from './SaveAs.js';

import './App.css';

const idRE = /^[a-z0-9]+$/i;
const isGistId = s => idRE.test(s);

if (process.env.NODE_ENV === 'development') {
  window.d = model.data;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      path: window.location.pathname,
      running: false,
      loading: false,
      saveAs: true,
      dataVersion: 0,
      gistId: '',
      pat: localStorage.getItem('pat'),
      errors: [],
    };
    this.github = new GitHub();
  }
  componentDidMount() {
    const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    if (query.src) {
      this.loadData(query.src);
    }
    model.add('path', window.location.pathname);
    model.subscribe('path', (newValue) => {
      window.history.pushState({}, '', newValue);
      this.setState({
        path: newValue,
      });
    });
    // I still am not sure how I'm supposed to handle this.
    // Putting my model in the state itself seems wrong
    // and doesn't actually help since I'd have to 
    // generate an entirely new state object to change any
    // nested property.
    //
    // Storing the data outside I see no way to tell
    // components to re-render except to call forceUpdate
    // which all the documentation says "if you call this
    // you're doing it wrong".
    //
    // Redux is fucking joke. 50 lines code needed to set
    // a single field. Repeat those 50 lines for every field.
    // Things like redux-tools make it less to type those
    // 50 lines but they still execute 50 to 500 lines of code
    // just to fucking set a single value.
    //
    // And, AFAIK you still don't get any benefit WRT the UI
    // and it not re-rendering everything
    model.subscribe('dataVersion', (dataVersion) => {
      this.setState({dataVersion})
    });
  }
  async loadData(src) {
    this.setState({loading: true});
    try {
      if (isGistId(src)) {
        const data = await this.github.getAnonGist(src);
        model.setData(data);
      } else {
        const res = await fetch(src);
        const data = await res.json();
        model.setData(data);
      }
    } catch (e) {
      console.warn(e);
      this.addError(`could not load benchmark: src=${src}`);
    }
    this.setState({loading: false});
  }
  addError = (msg) => {
    this.setState({errors: [msg, ...this.state.errors]});
    setTimeout(() => {
      this.setState({errors: this.state.errors.slice(0, this.state.errors.length - 1)});
    }, 5000);
  }
  handleNew = async() => {
    this.setState({loading: true});
    // this is a hack! CodeArea doesn't update via state. We should fix that
    // but for now we just turn it off with (loading: true) so a new one will be created.
    await wait();
    model.setData(model.newTestData);
    await wait();
    await wait();
    this.setState({loading: false});
  }
  handleRun = async () => {
    this.setState({running: true});
    console.log('--start--');
    const benches = await runTests(model.data);
    console.log(benches);
    console.log('--done--');
    this.setState({running: false});
  }
  handleSave = async () => {
  }
  handleSaveAs = () => {
    this.setState({saveAs: true});
  }
  handleHelp = () => {

  }
  handleLoad = () => {

  }
  handleOnSave = (gistId) => {
    window.history.pushState({}, '', `${window.location.origin}?src=${gistId}`);
    this.setState({saveAs: false, gistId});
  }
  render() {
    const data = model.data;
    const {running, loading, saveAs} = this.state;
    const disabled = running;
    const hideStyle = {
      ...(!running && {display: 'none'}),
    };
    const canSave = this.state.pat && this.state.gistId;
    return (
      <div className="App">
        <h1 className="head">jsBenchIt</h1>
        <div className="top">
          <div className={classNames("left", {disabled})}>
            <EditLine value={data.title} onChange={(v) => data.title = v} />
          </div>
          <div className={classNames("right", {disabled})}>
            <button onClick={this.handleRun}>Run</button>
            <button onClick={this.handleSave}>Save</button>
            <button onClick={this.handleSaveAs} className={classNames({disabled: !canSave})}>Save As</button>
            <button onClick={this.handleNew}>New</button>
            <button onClick={this.handleLoad}>Load</button>
            <button onClick={this.handleHelp}>?</button>
          </div>
        </div>
        {
          loading ? [] : (
            <div className="bottom">
              <div className="left">
                <NamedCodeArea value={data.description} title="Description" options={{editor: {lineNumbers: false, lineWrapping: true}}} />
                <NamedCodeArea value={data.html} title="HTML" />
                <NamedCodeArea value={data.setup} title="Setup" />
                {
                  data.tests.map((test, ndx) => {
                    const extra = (
                      <div><button onClick={_ => model.deleteTest(ndx)}>-</button></div>
                    );
                    return (
                      <TestArea
                        key={`ca${ndx}`}
                        desc={`Case ${ndx + 1}`}
                        title={test.name}
                        value={test.code}
                        async={test.async}
                        onTitleChange={title => model.setTestName(ndx, title)}
                        onValueChange={value => model.setTestCode(ndx, value)}
                        extra={extra}
                      />
                    );
                  })
                }
                <div>
                  <button onClick={model.addTest}>+</button>
                  <div>foo</div>
                  <div>bar</div>
                </div>
                <div className="blocked" style={hideStyle} />
              </div>
              <div className="right">
                <div className="charts">
                  results
                </div>
                <Results tests={data.tests}/>
              </div>
            </div>
          )
        }
        {saveAs ? <SaveAs onSave={this.handleOnSave} addError={this.addError} github={this.github} data={data} /> : []}
        <div className="errors">
          {
            this.state.errors.map((msg, i) => (<div key={`err${i}`}>{msg}</div>))
          }
        </div>
      </div>
    );
  }
}

export default App;
