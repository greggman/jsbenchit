window.___jsbenchitUncaughtErrorListener = (e) => {
  console.error('initialization:', e.filename, e.message);
  const data = {
    ...(e.message && {message: e.message}),
    ...(e.filename && {filename: e.filename}),
    ...(e.lineno && {lineno: e.lineno}),
    ...(e.colno && {colno: e.colno}),
  }
  window.parent.postMessage({type: 'uncaughtError', data}, "*");
};
window.addEventListener('error', window.___jsbenchitUncaughtErrorListener);