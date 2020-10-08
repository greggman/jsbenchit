import React from 'react';
import CodeArea from './CodeArea.js';

export default function TextArea(props) {
  const {title, hackKey} = props;
  const heading = (
    <div>{title}</div>
  );

  return (
    <CodeArea hackKey={hackKey} heading={heading} {...props} />
  );
}