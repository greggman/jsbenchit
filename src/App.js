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
import {isCompressedBase64, compressedBase64ToJSON} from './SaveAsURL.js';

import './App.css';

const idRE = /^[a-z0-9]+$/i;
const isGistId = s => idRE.test(s);

if (process.env.NODE_ENV === 'development') {
  window.d = model.data;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const noJSX = () => [];

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      path: window.location.pathname,
      running: false,
      loading: false,
      dialog: noJSX,
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
    // Redux is a joke. 50 lines code needed to set
    // a single field. Repeat those 50 lines for every field.
    // Things like redux-tools make it less to type those
    // 50 lines but they still execute 50 to 500 lines of code
    // just to set a single value.
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
      } else if (isCompressedBase64(src)) {
        const data = compressedBase64ToJSON(src);
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
    await wait();
    await wait();
    await wait();
    await wait();
    await wait();
    await wait();
    this.setState({loading: false});
  }
  addError = (msg) => {
    this.setState({errors: [msg, ...this.state.errors]});
    setTimeout(() => {
      this.setState({errors: this.state.errors.slice(0, this.state.errors.length - 1)});
    }, 5000);
  }
  closeDialog = () => {
    this.setState({dialog: noJSX});
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
    this.setState({dialog: this.renderSaveAs});
  }
  handleHelp = () => {

  }
  handleLoad = () => {

  }
  handleOnSave = (gistId) => {
    window.history.pushState({}, '', `${window.location.origin}?src=${gistId}`);
    this.setState({dialog: noJSX, gistId});
  }
  renderSaveAs = () => {
    const data = model.data;
    return (
      <SaveAs 
        onSave={this.handleOnSave}
        onClose={this.closeDialog}
        addError={this.addError}
        github={this.github}
        data={data} />
    );
  }
  render() {
    const data = model.data;
    const {running, loading, dialog} = this.state;
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
            <EditLine value={data.title} onChange={v => model.setTitle(v)} />
          </div>
          <div className={classNames("right", {disabled})}>
            <button tabIndex="1" onClick={this.handleRun}>Run</button>
            <button tabIndex="1" onClick={this.handleSave} className={classNames({disabled: !canSave})}>Save</button>
            <button tabIndex="1" onClick={this.handleSaveAs}>Save As</button>
            <button tabIndex="1" onClick={this.handleNew}>New</button>
            <button tabIndex="1" onClick={this.handleLoad}>Load</button>
            <button tabIndex="1" onClick={this.handleHelp}>?</button>
          </div>
        </div>
        {
          loading ? [] : (
            <div className="bottom">
              <div className="left">
                <NamedCodeArea
                  title="Description"
                  value={data.description}
                  onValueChange={v => model.setDescription(v)}
                  options={{editor: {mode: 'null', lineNumbers: false, lineWrapping: true}}}
                />
                <NamedCodeArea
                  title="HTML"
                  value={data.html}
                  onValueChange={v => model.setHTML(v)}
                  options={{editor: {mode: 'htmlmixed'}}}
                />
                <NamedCodeArea
                  title="Setup"
                  value={data.setup}
                  onValueChange={v => model.setSetup(v)}
                 />
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
        {dialog()}
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
