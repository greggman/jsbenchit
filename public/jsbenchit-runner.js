(async function() {
  const log = () => {};
  const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const url = new URL(params.url);
  let iframe;

  async function startServiceWorker() {
    // await waitForLoad();
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        log('ServiceWorker registration successful with scope: ', registration.scope);
        return registration;
      } catch (err) {
        log('ServiceWorker registration failed: ', err);
      }
    }
  }
  await startServiceWorker();
  const worker = navigator.serviceWorker?.controller || navigator.serviceWorker?.active;

  function cacheFile(pathname, type, content) {
    worker.postMessage({
      type: 'cacheFile',
      data: {
        pathname, // : '/moo.js',
        type,     // : 'application/javascript',
        content,  // 
      },
    });
  }

  function find(files, endings) {
    // calling toLowerCase a bunch is bad but there will never be more than a few files
    for (const ending of endings) {
      const file = files.find(file => file.name.toLowerCase().endsWith(ending.toLowerCase()));
      if (file) {
        return file;
      }
    }
    return '';
  }

  function getOrFind(files, name, ...endings) {
    return files.find(f => f.name.toLowerCase() === name.toLowerCase) || find(files, endings);
  }

  function insertInline(mainHTML, mainJS, mainCSS) {
    const style = document.createElement('style');
    style.textContent = mainCSS.content;
    (document.head || document.body || document.documentElement).appendChild(style);
    document.body.innerHTML = mainHTML.content;
    const script = document.createElement('script');
    script.type = 'module';
    script.text = mainJS.content;
    document.body.appendChild(script);
  }

  function makePageHTML(mainHTML, mainJS, mainCSS) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>jsBenchIt runner frame</title>
<!-- jsbenchit-section[${encodeURIComponent(mainCSS.name)}] -->
    <style>
${mainCSS.content}
    </style>
    <script src="${url.origin}/helper.js" type="module"></script>
  </head>
<!-- jsbenchit-section[${encodeURIComponent(mainHTML.name)}] -->
  <body>
${mainHTML.content}
  </body>
<!-- jsbenchit-section[${encodeURIComponent(mainJS.name)}] -->
  <${'script'} type="module">
${mainJS.content}
  </${'script'}>
</html>
`;
  }

  function applyCSSToSelfToRunContentInIFrame() {
    const style = document.createElement('style');
    style.textContent = `
html, body, iframe {
  width: 100%;
  height: 100%;
  margin: 0;
}
iframe {
  border: none;
  display: block;
  width: 100%;
  height: 100%;
}
`;
    document.head.appendChild(style);
  }

  function insertInBlob(mainHTML, mainJS, mainCSS) {
    applyCSSToSelfToRunContentInIFrame();
    const iframe = document.createElement('iframe');
    const html = makePageHTML(mainHTML, mainJS, mainCSS);
    const blob = new Blob([html], {type: 'text/html'});
    document.body.appendChild(iframe);
    iframe.src = URL.createObjectURL(blob);
    return iframe;
  }

  function insertInServiceWorker(mainHTML, mainJS, mainCSS) {
    applyCSSToSelfToRunContentInIFrame();
    const iframe = document.createElement('iframe');
    const html = makePageHTML(mainHTML, mainJS, mainCSS);
    cacheFile('/user-jsbenchit.html', 'text/html', html);
    document.body.appendChild(iframe);
    iframe.src = '/user-jsbenchit.html';
    return iframe;
  }

  const handlers = {
    run(data) {
      const files = data.files;
      const mainHTML = getOrFind(files, 'index.html', 'html');
      const mainJS = getOrFind(files, 'index.js', 'js', 'js', 'javascript');
      const mainCSS = getOrFind(files, 'index.css', 'css');
      if (data.inline) {
        insertInline(mainHTML, mainJS, mainCSS);
      } else {
        if (worker) {
          // Using a service worker allows the URL for the loaded
          // page to be constant so the debugger is happy.
          iframe = insertInServiceWorker(mainHTML, mainJS, mainCSS);
        } else {
          // if we use a blob it's hard to debug because the blob
          // will be a different URL every reload which means
          // the debugger will assume it's a different page
          // and not apply breakpoints etc...
          iframe = insertInBlob(mainHTML, mainJS, mainCSS);
        }
      }
    },
  };

  window.addEventListener('message', (e) => {
    const {type, data} = e.data;
    const fn = handlers[type];
    if (fn) {
      fn(data);
    } else {
      const isInner = iframe && e.source === iframe.contentWindow;
      const isTop = e.source === window.parent;
      if (isInner) {
        // pass message to parent
        window.parent.postMessage({type, data}, '*');
      } else if (isTop) {
        // pass the message to the frame
        iframe.contentWindow.postMessage({type, data}, '*');
      } else {
        // unknown message source
        console.log(isInner, isTop, e);
      }
    }
  });

  window.parent.postMessage({
    type: 'gimmeDaCodez',
  }, "*");

})();
