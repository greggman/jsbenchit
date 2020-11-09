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

  const iframes = [...document.querySelectorAll(`script[data-jsbenchit]`)].map(script => {
    const params = Object.fromEntries(new URLSearchParams(script.dataset.jsbenchit).entries());
    // so we don't do this more than once even if this script is loaded more than once
    script.removeAttribute('data-jsbenchit');
    const iframe = document.createElement('iframe');
    iframe.src = createURL('https://jsbenchit.org/embed.html', {...params, resize: true});
    iframe.className = 'jsbenchit';
    script.parentElement.insertBefore(iframe, script);
    return iframe;
  });

  if (iframes.length) {
    // add some style. You can override by applying your own
    const style = document.querySelector('style[data-jsbenchit]');
    if (!style) {
      const style = document.createElement('style');
      style.textContent = `iframe.jsbenchit { width: 100%; border: none; }`;
      style.dataset.jsbenchit = '1';
      const parent = document.head || document.documentElement;
      parent.insertBefore(style, parent.firstElementChild);
    }

    window.addEventListener('message', (e) => {
      if (e.data?.type === 'jsbenchit-resize') {
        const iframe = iframes.find(iframe => e.source === iframe.contentWindow);
        if (iframe) {
          const {height} = e.data.data;
          iframe.style.height = `${height}px`;
        }
      }
    });
  }

}());