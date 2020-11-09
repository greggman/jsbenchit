import React from 'react';

export default function Embed(props) {
  const {gistId} = props;
  return (
    <div>
      <div className="markdown">
        <p>
        You can embed the results of a jsBenchIt benchmark in 2 ways.
        </p>
        <h3>via iframe</h3>
        <p>Create an iframe pointing to
        {' '}<code>https://jsbenchit.org/embed.html?src=&lt;src&gt;</code>{' '} where
        {' '}<code>&lt;src&gt;</code>{' '} is one of the forms above. Either
        {' '}<code>?src=&lt;gist_id&gt;</code>{' '}or
        {' '}<code>?src=&lt;base64url&gt;</code>{' '}or
        {' '}<code>?src=&lt;url_to_json&gt;</code>.
        You can also add {' '}<code>noheader=true</code>{' '} if you don't want the header
        to appear. Add a `results=` parameter with comma separated {' '}<code>latest</code>,
        {' '}<code>platforms</code>, and/or {' '}<code>tests</code>{' '} to choose which results to show.
        If you don't specify any all 3 will show.
        </p>
        { !!gistId &&
            <React.Fragment>
              <p>
              For example:
              </p>
              <pre><code style={{userSelect: 'all'}}>
      &lt;iframe src="https://jsbenchit.org/embed.html?src={gistId}&amp;results=latest"&gt;&lt;/iframe&gt;
              </code></pre>
            </React.Fragment>
        }
        <p>
          The disadvantage of using an iframe is the it's up to you to make the iframe large enough
          to show the results. Otherwise you'll get a scrollbar.
        </p>
        <h3>via script</h3>
        <p>Create a script tag pointing to
        {' '}<code>https://jsbenchit.org/embed-resize.js</code>{' '} and add a {' '}<code>data-jsbenchit</code>{' '}
        attribute with the same parameters as the iframe.
        </p>
        { !!gistId &&
            <React.Fragment>
              <p>
              For example:
              </p>
              <pre><code style={{userSelect: 'all'}}>
      &lt;script src="https://jsbenchit.org/embed-resize.js" defer data-jsbenchit="src={gistId}&amp;results=latest"&gt;&lt;/script&gt;
              </code></pre>
            </React.Fragment>
        }
        <p>
          The advantage of using a script is it will resize the iframe's height to show all the content.
        </p>
      </div>
    </div>
  );
}