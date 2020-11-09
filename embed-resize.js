(function() {
  function createURL(base, params) {
    const url = new URL(base);
    const searchParams = new URLSearchParams(url.search);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    }
    url.search = searchParams.toString();
    return url.href;
  }

  // find our own script tag
  const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const script = document.querySelector(`script[src*="src=${params.src}"]`);
  const iframe = document.createElement('iframe');
  iframe.src = createURL('https://jsbenchit.org', {...params, resize: true});
  script.appendChild(iframe);

  window.addEventListener('message', (e) => {
    if (e.source === iframe.contentWindow) {
      if (e.data) {
        const {type, data} = e.data;
        if (type === 'resize') {
          const {height} = data;
          iframe.style.height = `${height}px`;
        }
      }
    }
  });
}());