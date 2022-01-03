import React from 'react';

import BackupManager from './BackupManager.js';
import { classNames } from '../libs/css-utils.js';
import EditLine from './EditLine.js';
import Footer from './Footer.js';
import GitHub from '../libs/GitHub.js';
import {storageManager} from '../globals.js';
import Help from './Help.js';
import LatestResults from './LatestResults.js';
import Load from './Load.js';
import {isGistId, loadGistFromSrc} from '../libs/loader.js';
import * as model from '../libs/model.js';
import NamedCodeArea from './NamedCodeArea.js';
import OAuthManager from '../libs/OAuthManager';
import Platforms from './Platforms.js';
import Save from './Save.js';
import ServiceContext from '../ServiceContext.js';
import Split from './Split.js';
import TestArea from './TestArea.js';
import TestRunner from '../libs/TestRunner.js';
import Tests from './Tests.js';
import UserManager from '../libs/UserManager.js';

import './App.css';

const noJSX = () => [];
const stringOrEmpty = (str, prefix = '', suffix = '') => str ? `${prefix}${str}${suffix}` : '';
const darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');
const makeId = _ => `${Date.now()}+${Math.random()}`;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      path: window.location.pathname,
      dark: darkMatcher.matches,
      running: false,
      loading: false,
      dialog: noJSX,
      dataVersion: 0,
      gistId: '',
      messages: [],
      userData: {},
      testNum: 0,
      errorMsg: '',
    };
    this.github = new GitHub();
    this.testToKeyMap = new Map();
    this.oauthManager = new OAuthManager(storageManager);
    this.backupManager = new BackupManager(storageManager);
    this.userManager = new UserManager({
      oauthManager: this.oauthManager,
      github: this.github,
      addError: this.addError,
    });
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
    model.subscribe(model.testsVersionKey, (dataVersion) => {
      this.setState({dataVersion})
    });
    // this is a hack because I can't figure out how to
    // update the CodeMirror areas
    model.subscribe(model.updateVersionKey, (updateVersion) => {
      this.setState({updateVersion})
    });

    darkMatcher.addEventListener('change', () => {
      this.setState({dark: darkMatcher.matches});
    });

    const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const backup = this.backupManager.getBackup();
    let loaded = false;
    if (backup) {
      try {
        const data = JSON.parse(backup);
        if (data.href === window.location.href) {
          model.setData(data.data);
          const url = new URL(data.href);
          const {src} = Object.fromEntries(new URLSearchParams(url.search).entries());
          if (isGistId(src)) {
            this.setState({gistId: src, gistOwnerId: data.gistOwnerId});
          }
          loaded = true;
          this.addInfo('loaded backup from local storage')
        }
      } catch (e) {
        //
      }
      this.backupManager.clearBackup();
    }
    if (!loaded && query.src) {
      this.loadData(query.src);
    }
    this.updateTitle();
  }
  componentDidUpdate() {
    this.updateTitle();
  }
  updateTitle() {
    const data = model.data;
    document.title = data.title || 'jsBenchIt';
  }
  async loadData(src) {
    this.setState({loading: true});
    try {
      const {data, id, rawData} = await loadGistFromSrc(src, this.github);
      model.setData(data);
      if (id) {
        this.setState({
          gistId: src,
          gistOwnerId: rawData?.owner?.id,
        })
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
    this.setState({messages: [{msg:msg.toString(), className}, ...this.state.messages]});
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
    this.backupManager.clearBackup();
    window.location.href = window.location.origin;  // causes a reload
  }
  handleRun = async () => {
    this.setState({running: true, testNum: -1, errorMsg: ''});
    this.backupManager.setBackup(JSON.stringify({
      href: window.location.href,
      data: model.data,
      gistOwnerId: this.state.gistOwnerId,
    }));
    // console.log('--start--');
    try {
      const testRunner = new TestRunner();
      testRunner.addEventListener('progress', (e) => {
        this.setState({testNum: e.data.testNdx});
      });
      this.abort = testRunner.abort.bind(testRunner);
      const {success, data} = await testRunner.run(model.data);
      if (!success) {
        this.setState({errorMsg: data?.message || ''});
        this.addError(`could not run benchmark:\n${stringOrEmpty(data?.message)}${stringOrEmpty(data?.filename, ':')}${stringOrEmpty(data?.lineno, ':')}${stringOrEmpty(data?.colno, ':')}`);
      }
    } catch(e) {
      this.addError(e);
    }
    this.abort = undefined;
    this.backupManager.clearBackup();
    // console.log('--done--');
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
    this.setState({
      gistId,
      gistOwnerId: this.userManager.getUserData().id,
    });
  }
  handleAbort = () => {
    this.abort();
  };
  getTestKey(test) {
    let key = this.testToKeyMap.get(test);
    if (!key) {
      key = makeId();
      this.testToKeyMap.set(test, key);
    }
    return key;
  }
  renderHelp = () => {
    return (<Help onClose={this.closeDialog} />);
  }
  renderLoad = () => {
    return (
      <Load
        onLoad={this.handleOnLoad}
        onClose={this.closeDialog}
      />
    );
  }
  renderSave = () => {
    const data = model.data;
    return (
      <Save
        onSave={this.handleOnSave}
        onClose={this.closeDialog}
        gistId={this.state.gistId}
        gistOwnerId={this.state.gistOwnerId}
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
      testNum,
      gistId,
      errorMsg,
    } = this.state;
    const disabled = running;
    const hideStyle = {
      ...(!running && {display: 'none'}),
    };
    const disabledClass = classNames({disabled});
    return (
      <div className="App">
        <ServiceContext.Provider value={{
          github: this.github,
          oauthManager: this.oauthManager,
          addError: this.addError,
          addInfo: this.addInfo,
          storageManager,
          userManager: this.userManager,
          backupManager: this.backupManager,
        }}>
          <div className="head">
            <div>
              <a target="_blank" rel="noopener noreferrer" href={window.location.origin}> <img src="/resources/images/logo.svg" alt="logo"/>
            {window.location.hostname}<span className="beta">(beta)</span></a>
            </div>
            <div>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/greggman/jsbenchit/">
              <img alt="github" src="/resources/images/octocat-icon.svg"/>
            </a>
            </div>
          </div>
          <div className="top">
            <div className={classNames("left", {disabled})}>
              <div className="name">
                <EditLine value={data.title} onChange={v => model.setTitle(v)} />
                {!!userData.name && <div className="username"><a target="_blank" rel="noopener noreferrer" href={`https://github.com/${userData.name}`}>{userData.name}</a></div>}
                {!!userData.avatarURL && <a target="_blank" rel="noopener noreferrer" href={`https://github.com/${userData.name}`}><img className="avatar" src={userData.avatarURL} alt="avatar"/></a>}
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
                      key={`n1${hackKey}`}
                      title="Initialization"
                      value={data.initialization}
                      show={data.initialization.length > 0}
                      onValueChange={v => model.setInitialization(v)}
                    />
                    <NamedCodeArea
                      key={`n2${hackKey}`}
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
                            key={`ca${this.getTestKey(test)}`}
                            hackKey={hackKey}
                            desc={`Case ${ndx + 1}`}
                            test={test}
                            testNdx={ndx}
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
                        {testNum >= 0
                           ? <div>Testing {testNum + 1} of {data.tests.length}</div>
                           : <div>Initializing</div>
                        }
                        <div>Time remaining: ~{(data.tests.length - testNum) * 5}s</div>
                        <div><button onClick={this.handleAbort}>Stop Benchmark</button></div>
                      </div>
                    </div>
                  </div>
                  <div className="right">
                    {errorMsg && (
                      <div className="results-group">
                        <div className="result aborted">
                          <div className="result-error">error:{'\n'}{errorMsg}</div>
                        </div>
                      </div>
                    )}
                    <LatestResults/>
                    <Platforms/>
                    <Tests/>
                  </div>
                </Split>
              </div>
            )
          }
          <Footer
            gistId={gistId}
            title={data.title}
          />
          {dialog()}
          <div className="messages">
            {
              this.state.messages.map(({msg, className}, i) => (<div className={className} key={`err${i}`}>{msg}</div>))
            }
          </div>
        </ServiceContext.Provider>
      </div>
    );
  }
}

export default App;
