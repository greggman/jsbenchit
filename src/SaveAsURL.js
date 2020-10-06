import React from 'react';
import {encode} from 'base64-arraybuffer';

const utf8Encoder = new TextEncoder();

export default function SaveAsURL(props) {
  const {data} = props;
  const bin = utf8Encoder.encode(JSON.stringify(data));
  const base64 = encode(bin.buffer);
  const url = `${window.location.origin}?src=b64,${base64}}`;

  return (
    <div>
      <div>copy / bookmark the link below</div>
      <a className="bookmark" href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    </div>
  );
}