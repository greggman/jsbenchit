import * as model from './model.js';
import {isDevelopment} from './flags.js';
import {createURL} from './url.js';
import * as winMsgMgr from './WindowMessageManager';

const log = _ => _;
//const log = console.log.bind(console);


export default class TestRunner extends EventTarget {
  static lastIframe;
  abort() {
    if (this._abortImpl) {
      this._abortImpl();
    }
  }
  run(data) {
    return new Promise(async(resolve, reject) => {
      model.clearAllTestResults();
      let errors = 0;

      const runTests = (test) => {
        return new Promise((resolve, reject) => {
          if (TestRunner.lastIframe) {
            TestRunner.lastIframe.remove();
          }
          const iframe = document.createElement('iframe');
          TestRunner.lastIFrame = iframe;

          const base = isDevelopment
              ? 'http://localhost:8080'
              : window.location.origin;
          const html = `
          <${'script'} type="module" src="${base}/error-reporter.js"></${'script'}>
          <${'script'} src="${base}/3rdparty/lodash.js"></${'script'}>
          <${'script'} src="${base}/3rdparty/platform.js"></${'script'}>
          <${'script'} src="${base}/3rdparty/benchmark.js"></${'script'}>
          <${'script'}>
          ${data.initialization}
          </${'script'}>
          <${'script'}>
          window.___model = ${JSON.stringify({
            ...data,
            settings: {
              ...(data.settings && data.settings),
              test,
            },
          })};
          </${'script'}>
          <body>
          </body>
          <${'script'} type="module" src="${base}/runner.js"></${'script'}>
          `;
          const runnerData = {
            name: data.title,
            files: [
              {
                name: 'html',
                content: html,
              },
              {
                name: 'css',
                content: '',
              },
              {
                name: 'javascript',
                content: '',
              },
            ],
          };

          let cleanup = (result) => {
            cleanup = () => {}; // only cleanup once
            winMsgMgr.remove('uncaughtError', null, handleUncaughtError);
            winMsgMgr.remove('abort', null, handleAbort);
            winMsgMgr.remove('error', null, handleError);
            winMsgMgr.remove('cycle', null, handleCycle);
            winMsgMgr.remove('complete', null, handleComplete);
            winMsgMgr.remove('gimmeDaCodez', null, handleGimmeDaCodez);
            // keep the iframe around so the debugger can look at it.
            // iframe.remove()
            resolve(result);
          };

          const abort = () => {
            if (iframe.contentWindow) {
              iframe.contentWindow.postMessage({type: 'abort'}, '*');
            }
            cleanup({success: true, data: {message: 'aborted'}});
          };
          this._abortImpl = abort;

          const sendProgress = (ndx) => {
            const event = new Event('progress');
            event.data = {
              testNdx: ndx
            };
            this.dispatchEvent(event);
          }

          const updateTestResults = (data) => {
            const ndx = parseInt(data.name);
            const newData = {...data};
            delete newData.id;
            delete newData.name;
            model.setTestResult(ndx, newData, window.navigator.userAgent);
            sendProgress(ndx + 1);
          };

          // error caught by window.addEventListener('error')
          const handleUncaughtError = (data) => {
            log('handleUncaughtError:', data);
            abort();
            resolve({success: false, data});
          };
          // benchmark onAbort
          const handleAbort = (data) => {
            log('handleAbort:', data);
            cleanup({success: true, data: {message: 'aborted because of error'}});
          };
          const handleStart = () => {
            if (!test) {
              sendProgress(0);
            }
          };
          // benchmark onError
          const handleError = (data) => {
            log('handleError:', data);
            ++errors;
            updateTestResults(data);
          };
          // benchmark onCycle
          const handleCycle = (data) => {
            log('handleCycle:', data);
            if (!test) {
              updateTestResults(data)
            }
          };
          // benchmark onComplete
          const handleComplete = (data) => {
            log('handleComplete:', data);
            cleanup({success: errors === 0, data});
          };
          const handleGimmeDaCodez = () => {
            iframe.contentWindow.postMessage({
              type: 'run',
              data: runnerData,
            }, "*");
          };

          winMsgMgr.on('uncaughtError', null, handleUncaughtError);
          winMsgMgr.on('abort', null, handleAbort);
          winMsgMgr.on('error', null, handleError);
          winMsgMgr.on('start', null, handleStart);
          winMsgMgr.on('cycle', null, handleCycle);
          winMsgMgr.on('complete', null, handleComplete);
          winMsgMgr.on('gimmeDaCodez', null, handleGimmeDaCodez);

          iframe.src = isDevelopment
              ? createURL('http://localhost:8081/runner-03.html', {...(test && {test}), url: 'http://localhost:8080/jsbenchit-runner.js'})
              : createURL('https://jsbenchitrunner.devcomments.org/runner-03.html', {...(test && {test}), url: 'https://jsbenchit.org/jsbenchit-runner.js'});
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
        });
      }

      // first run all tests the once each
      // so if there is an error in the last test
      // we don't have to wait for all the other
      // tests to run to get a notified.
      try {
        const result = await runTests(true);
        if (!result.success) {
          resolve(result);
          return;
        }
      } catch (e) {
        resolve({success: false, e});
        return;
      }

      try {
        const result = await runTests();
        resolve(result);
      } catch(e) {
        reject(e);
      }
    });
  }
};