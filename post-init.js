// We have to remove this because it messages up benchmark.js
// error handling
window.removeEventListener('error', window.___jsbenchitUncaughtErrorListener);
delete window.___jsbenchitUncaughtErrorListener;