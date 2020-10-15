import React from 'react';

import { classNames } from './css-utils.js';
import EditLine from './EditLine.js';
import Footer from './Footer.js';
import GitHub from './GitHub.js';
import Help from './Help.js';
import LatestResults from './LatestResults.js';
import Load from './Load.js';
import {loadGistFromSrc} from './loader.js';
import * as model from './model.js';
import NamedCodeArea from './NamedCodeArea.js';
import Platforms from './Platforms.js';
import Save from './Save.js';
import Split from './Split.js';
import TestArea from './TestArea.js';
import TestRunner from './TestRunner.js';

import './App.css';

if (process.env.NODE_ENV === 'development') {
  window.d = model.data;
}

const backupKey = 'jsBenchIt-backup';
const noJSX = () => [];
const stringOrEmpty = (str, prefix = '', suffix = '') => str ? `${prefix}${str}${suffix}` : '';
const darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');
const makeDisqusId = () => {
  const loc = window.location;
  const query = Object.fromEntries(new URLSearchParams(loc.search).entries());
  const src = query.src;
  return src
      ? `${encodeURIComponent(src)}`
      : '';
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      path: window.location.pathname,
      dark: darkMatcher.matches,
      disqusId: makeDisqusId(),
      running: false,
      loading: false,
      dialog: noJSX,
      dataVersion: 0,
      gistId: '',
      pat: localStorage.getItem('pat'),
      messages: [],
      userData: {},
    };
    this.github = new GitHub();
  }
  componentDidMount() {
    this.github.addEventListener('userdata', (e) => {
      this.setState({
        userData: e.data,
      });
    });
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
    // this is a hack because I can't figure out how to
    // update the CodeMirror areas
    model.subscribe('updateVersion', (updateVersion) => {
      this.setState({updateVersion})
    });

    darkMatcher.addEventListener('change', () => {
      this.setState({dark: darkMatcher.matches});
    });

    const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const backup = localStorage.getItem(backupKey);
    let loaded = false;
    if (backup) {
      try {
        const data = JSON.parse(backup);
        if (data.href === window.location.href) {
          model.setData(data.data);
          loaded = true;
          this.addInfo('loaded backup from local storage')
        }
      } catch (e) {
        //
      }
      localStorage.removeItem(backupKey);
    }
    if (!loaded && query.src) {
      this.loadData(query.src);
    }
  }
  async loadData(src) {
    this.setState({loading: true});
    try {
      const {data, id} = await loadGistFromSrc(src, this.github);
      model.setData(data);
      if (id) {
        this.setState({gistId: src})
      }
    } catch (e) {
      console.warn(e);
      this.addError(`could not load benchmark: src=${src} ${e}`);
    }
    this.setState({loading: false});
  }
  addMsg = (msg, className) => {
    switch (className) {
      case 'error':
        console.error(msg);
        break;
      default:
        console.log(msg);
        break;
    }
    this.setState({messages: [{msg, className}, ...this.state.messages]});
    setTimeout(() => {
      this.setState({messages: this.state.messages.slice(0, this.state.messages.length - 1)});
    }, 5000);
  }
  addInfo = (msg) => this.addMsg(msg, 'info');
  addError = (msg) => this.addMsg(msg, 'error');
  closeDialog = () => {
    this.setState({dialog: noJSX});
  }
  handleNew = async() => {
    model.setData(model.getNewTestData());
  }
  handleRun = async () => {
    this.setState({running: true});
    localStorage.setItem(backupKey, JSON.stringify({
      href: window.location.href,
      data: model.data,
    }));
    console.log('--start--');
    const testRunner = new TestRunner();
    this.abort = testRunner.abort.bind(testRunner);
    const {success, data} = await testRunner.run(model.data);
    if (!success) {
      this.addError(`could not run benchmark:\n${stringOrEmpty(data.message)}${stringOrEmpty(data.filename, ':')}${stringOrEmpty(data.lineno, ':')}${stringOrEmpty(data.colno, ':')}`);
    }
    this.abort = undefined;
    localStorage.removeItem(backupKey);
    console.log('--done--');
    this.setState({running: false});
  }
  handleSave = async () => {
    this.setState({dialog: this.renderSave});
  }
  handleHelp = () => {
    this.setState({dialog: this.renderHelp});
  }
  handleLoad = () => {
    this.setState({dialog: this.renderLoad});
  }
  handleOnLoad = async() => {
    this.setState({dialog: noJSX});
  }
  handleOnSave = (gistId) => {
    window.history.pushState({}, '', `${window.location.origin}?src=${gistId}`);
    this.setState({gistId});
  }
  handleAbort = () => {
    this.abort();
  };
  renderHelp = () => {
    return (<Help onClose={this.closeDialog} />);
  }
  renderLoad = () => {
    return (
      <Load
        onLoad={this.handleOnLoad}
        onClose={this.closeDialog}
        addError={this.addError}
        github={this.github}
      />
    );
  }
  renderSave = () => {
    const data = model.data;
    return (
      <Save
        onSave={this.handleOnSave}
        onClose={this.closeDialog}
        addError={this.addError}
        github={this.github}
        gistId={this.state.gistId}
        data={data} />
    );
  }
  render() {
    const data = model.data;
    const {
      running,
      loading,
      dialog,
      updateVersion: hackKey,
      userData,
    } = this.state;
    const disabled = running;
    const hideStyle = {
      ...(!running && {display: 'none'}),
    };
    const disabledClass = classNames({disabled});
    return (
      <div className="App">
        <div className="head">
          <div>
            <img src="/resources/images/logo.svg" alt="logo"/>
          jsBenchIt.org<span className="beta">(beta)</span>
          </div>
          <div>
          <a href="https://github.com/greggman/jsbenchit/">
            <img alt="github" src="/resources/images/octocat-icon.svg"/>
          </a>
          </div>
        </div>
        <div className="top">
          <div className={classNames("left", {disabled})}>
            <div className="name">
              <EditLine value={data.title} onChange={v => model.setTitle(v)} />
              {userData.userName ? <div className="username"><a target="_blank" rel="noopener noreferrer" href={`https://github.com/${userData.name}`}>{userData.name}</a></div> : []}
              {userData.avatarURL ? <a target="_blank" rel="noopener noreferrer" href={`https://github.com/${userData.name}`}><img className="avatar" src={userData.avatarURL} alt="avatar"/></a> : []}
            </div>
          </div>
          <div className="right">
            { running
                ? <button tabIndex="1" onClick={this.handleAbort}>Cancel</button>
                : <button tabIndex="1" onClick={this.handleRun}>Run</button>
            }
            <button tabIndex="1" className={disabledClass} onClick={this.handleSave}>Save</button>
            <button tabIndex="1" className={disabledClass} onClick={this.handleNew}>New</button>
            <button tabIndex="1" className={disabledClass} onClick={this.handleLoad}>Load</button>
            <button tabIndex="1" className={disabledClass} onClick={this.handleHelp}>?</button>
          </div>
        </div>
        {
          loading ? [] : (
            <div className="bottom">
              <Split direction="horizontal">
                <div className="left">
                  <NamedCodeArea
                    hackKey={hackKey}
                    title="Initialization"
                    value={data.initialization}
                    show={data.initialization.length > 0}
                    onValueChange={v => model.setInitialization(v)}
                  />
                  <NamedCodeArea
                    hackKey={hackKey}
                    title="Before Each Test"
                    value={data.setup}
                    show={data.setup.length > 0}
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
                          hackKey={hackKey}
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
                  </div>
                  <div className="blocked" style={hideStyle}>
                    <div className="abort">
                      <button onClick={this.handleAbort}>Stop Benchmark</button>
                    </div>
                  </div>
                </div>
                <div className="right">
                  <LatestResults tests={data.tests}/>
                  <Platforms tests={data.tests}/>
                </div>
              </Split>
            </div>
          )
        }
        <Footer
          disqusId={makeDisqusId()}
          title={data.title}
        />
        {dialog()}
        <div className="messages">
          {
            this.state.messages.map(({msg, className}, i) => (<div className={className} key={`err${i}`}>{msg}</div>))
          }
        </div>
      </div>
    );
  }
}

export default App;
