import React from 'react';
import Dialog from './Dialog.js';

export default function Help(props) {
  const {onClose} = props;
  const asyncInitCode = `
Benchmark.init = () => {
  return new Promise(resolve => {
    window.img = new Image();
    img.onload = resolve;
    img.src = 'url-for-img';
  });
}
`.trim();
  return (
    <Dialog title="jsBenchIt" onClose={onClose}>
      <div className="markdown">
      <p>Add your test cases, click <code>Run</code>.</p>
      <p><a target="_blank" rel="noopener noreferrer" href="https://jsbenchit.org/?src=d401d49caa9e9295a026bbaee70fee3b">Click here for an example</a>.</p>
      <h2>Contribute, Fix, Enhance!</h2>
      <p>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/greggman/jsbenchit">https://github.com/greggman/jsbenchit</a>
      </p>
      <h2>Docs</h2>
      <p><a target="_blank" rel="noopener noreferrer" href="https://github.com/greggman/jsbenchit/docs/index.md">See Here</a>.</p>
      <h2>Saving</h2>
      <p>You can save your tests in multiple ways.</p>
      <ol>
        <li>To a github gist using your github account.
        </li>
        <li>Save it manually into github
          <p>
           Copy the JSON. Go to github. Create a new gist. Name the file
           <code>jsBenchIt.json</code> Paste the JSON in. Pick "Create public gist".
          </p>
          <p>
           Note the id in the URL after you create the gist.
          </p>
          <p>
           Create a url in the form <code>https://jsbenchit.org/?src=&lt;gist_id&gt;</code>.
          </p>
          <p>
           Example: <a target="_blank" rel="noopener noreferrer" href="https://jsbenchit.org/?src=d401d49caa9e9295a026bbaee70fee3b">https://jsbenchit.org/?src=d401d49caa9e9295a026bbaee70fee3b</a>
          </p>
        </li>
        <li>Save it manually somewhere else.
          <p>
           If there's some other service that will provide a string via
           http get then copy and save the JSON there then create a URL
           in the form of <code>https://jsbenchit.org/?src=&lt;url&gt;</code>. Note: you
           will have to escape the URL although if just paste it into your
           browser it will likely do the conversion for you.
          </p>
        </li>
        <li>Save it as a bookmark or link
          <p>
           In the SaveAs dialog there's a link that contains all the data
           for your benchmark.
          </p>
        </li>
      </ol>
    <h2>Asynchronous Initialization</h2>
    <p>Only the "Initialization" portion may be asynchronous. To make
     the initialization asynchronous set <code>Benchmark.init</code> to function
     that returns a <code>Promise</code>. Example:
    </p>
    <pre><code>{asyncInitCode}</code></pre>
    <h2>Comparing across browsers</h2>
    <p>
      Saving saves the results of the benchmark so if you want to compare
      across browsers:
    </p>
    <h3>With Personal Access Token</h3>
    <ol>
      <li>Create your benchmark</li>
      <li>Run it</li>
      <li>Save a new gist using Personal Access Token</li>
      <li>Copy URL to another browser</li>
      <li>Run it</li>
      <li>Save over old gist using Personal Access Token</li>
    </ol>
    <p>Repeat steps 4, 5, 6 on other browsers.</p>
    <h3>With URL</h3>
    <ol>
      <li>Create your benchmark</li>
      <li>Run it</li>
      <li>Pick Save and copy the URL</li>
      <li>Copy URL to another browser</li>
      <li>Run it</li>
      <li>Pick Save and copy the URL</li>
    </ol>
    <p>Repeat steps 4, 5, 6 on other browsers.</p>
    <p>Note: In general it only makes sense to compare results of browsers
       on the same machine.</p>
    <hr/>
    <p>Also see <a target="_blank" rel="noopener noreferrer" href="https://jsgist.org">jsgist.org</a></p>
    </div>
    </Dialog>
  );
}