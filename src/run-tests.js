export default function runTests(model) {
  return new Promise(resolve => {
    const base = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : window.location.origin;
    const html = `
    <${'script'} type="module" src="${base}/error-reporter.js"></${'script'}>
    <${'script'} src="${base}/3rdparty/lodash.js"></${'script'}>
    <${'script'} src="${base}/3rdparty/platform.js"></${'script'}>
    <${'script'} src="${base}/3rdparty/benchmark.js"></${'script'}>
    <${'script'}>
    const model = ${JSON.stringify(model)};
    </${'script'}>
    <body>
    ${model.html}
    </body>
    <${'script'} type="module" src="${base}/runner.js"></${'script'}>
    `;
    const iframe = document.createElement('iframe');

    const handlers = {
      // window.addEventListener('error')
      uncaughtError(data) {

      },
      // benchmark onAbort
      abort(data) {
      },
      // benchmark onError
      error(data) {

      },
      // benchmark onCycle
      cycle(data) {

      },
      // benchmark onComplete
      complete(data) {
        window.removeEventListener('message', handleMessage);
        iframe.remove();
        resolve(data);
      },
    }

    const handleMessage = (e) => {
      const {type, data} =  e.data;
      handlers[type](data);
    };
    window.addEventListener('message', handleMessage);
    const blob = new Blob([html], {type: 'text/html'});
    iframe.sandbox = 'allow-scripts';
    iframe.src = URL.createObjectURL(blob);
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  });
};