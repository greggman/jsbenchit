import * as model from './model.js';

export default class TestRunner {
  abort() {
    if (this._abortImpl) {
      this._abortImpl();
    }
  }
  run(data) {
    return new Promise(resolve => {
      const base = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : window.location.origin;
      const html = `
      <${'script'} type="module" src="${base}/error-reporter.js"></${'script'}>
      <${'script'} src="${base}/3rdparty/lodash.js"></${'script'}>
      <${'script'} src="${base}/3rdparty/platform.js"></${'script'}>
      <${'script'} src="${base}/3rdparty/benchmark.js"></${'script'}>
      <${'script'}>
      const model = ${JSON.stringify(data)};
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
      }

      const iframe = document.createElement('iframe');
      model.clearAllTestResults();

      const cleanup = () => {
        window.removeEventListener('message', handleMessage);
        iframe.remove();
      };

      const abort = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({type: 'abort'}, '*');
        }
        cleanup();
      };
      this._abortImpl = abort;

      const updateTestResults = (data) => {
        const ndx = parseInt(data.name);
        const newData = {...data};
        delete newData.id;
        delete newData.name;
        model.setTestResult(ndx, newData, window.navigator.userAgent);
      };

      const handlers = {
        // error caught by window.addEventListener('error')
        uncaughtError(data) {
          abort();
          resolve({success: false, data});
        },
        // benchmark onAbort
        abort(data) {
          debugger;
        },
        // benchmark onError
        error(data) {
          updateTestResults(data);
        },
        // benchmark onCycle
        cycle(data) {
          updateTestResults(data)
        },
        // benchmark onComplete
        complete(data) {
          cleanup();
          resolve({success: true, data});
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
        } else {
          console.error('unknown code', e.data);
        }
      };
      window.addEventListener('message', handleMessage);
      iframe.src = 'https://jsbenchitrunner.devcomments.org/runner.html';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    });
  }
};