import React from 'react';
import CodeArea from './CodeArea.js';

export default function TextArea(props) {
  const {title} = props;
  const heading = (
    <div>{title}</div>
  );

  return (
    <CodeArea heading={heading} {...props} />
  );
}