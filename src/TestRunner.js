import * as model from './model.js';

export default class TestRunner extends EventTarget {
  abort() {
    if (this._abortImpl) {
      this._abortImpl();
    }
  }
  run(data) {
    return new Promise(async(resolve, reject) => {
      model.clearAllTestResults();

      const runTests = (test) => {
        return new Promise((resolve, reject) => {
          const iframe = document.createElement('iframe');

          const base = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : window.location.origin;
          const html = `
          <${'script'} type="module" src="${base}/error-reporter.js"></${'script'}>
          <${'script'} src="${base}/3rdparty/lodash.js"></${'script'}>
          <${'script'} src="${base}/3rdparty/platform.js"></${'script'}>
          <${'script'} src="${base}/3rdparty/benchmark.js"></${'script'}>
          <${'script'}>
          const model = ${JSON.stringify({
            ...data,
            settings: {
              ...(data.settings && data.settings),
              test,
            },
          })};
          </${'script'}>
          <${'script'}>
          ${data.initialization}
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
            window.removeEventListener('message', handleMessage);
            iframe.remove();
            resolve(result);
          };

          const abort = () => {
            if (iframe.contentWindow) {
              iframe.contentWindow.postMessage({type: 'abort'}, '*');
            }
            cleanup({success: true, data: {message: 'aborted'}});
          };
          this._abortImpl = abort;

          const updateTestResults = (data) => {
            const ndx = parseInt(data.name);
            const newData = {...data};
            delete newData.id;
            delete newData.name;
            model.setTestResult(ndx, newData, window.navigator.userAgent);
            const event = new Event('progress');
            event.data = {
              testNdx: ndx
            };
            this.dispatchEvent(event);
          };

          const handlers = {
            // error caught by window.addEventListener('error')
            uncaughtError(data) {
              abort();
              resolve({success: false, data});
            },
            // benchmark onAbort
            abort(data) {
              cleanup({success: true, data: {message: 'aborted because of error'}});
            },
            // benchmark onError
            error(data) {
              updateTestResults(data);
            },
            // benchmark onCycle
            cycle(data) {
              if (!test) {
                updateTestResults(data)
              }
            },
            // benchmark onComplete
            complete(data) {
              cleanup({success: true, data});
            },
            gimmeDaCodez: () => {
              iframe.contentWindow.postMessage({
                type: 'run',
                data: runnerData,
              }, "*");
            },
          };

          const handleMessage = (e) => {
            const {type, data} =  e.data;
            const fn = handlers[type];
            if (fn) {
              fn(data);
            }
          };
          window.addEventListener('message', handleMessage);
          iframe.src = `https://jsbenchitrunner.devcomments.org/runner-02.html${test ? '?test=true' : ''}`;
          //iframe.src = `http://localhost:8081/runner-02.html${test ? '?test=true' : ''}`;
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
        });
      }

      // first run all tests the once each
      // so if there is an error in the last test
      // we don't have to wait for all the other
      // tests to run to get a notified.
      try {
        await runTests(true);
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