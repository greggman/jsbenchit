import React, {useState} from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/addon/scroll/simplescrollbars.js';

import { classNames } from './css-utils.js';

const darkMatcher = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : {};
// darkMatcher.addListener(render);

const noop = () => {};

export default function CodeArea(props) {
  const {value, heading, extra = [], options = {}, onValueChange = noop} = props;
  const [show, setShow] = useState(props.show === false || true);
  const [localValue, setLocalValue] = useState(value);
  const isDarkMode = darkMatcher.matches;
  const hideeHide = !show;
  return (
    <div className="code-area">
        <div className="expander">
          <div className="hider" onClick={()=>setShow(!show)}>{show ? '▼' : '◀'}</div>
          {heading}
        </div>
        <div className={classNames("hidee", {hideeHide})}>
          <div className="editor">
            <CodeMirror
              value={localValue}
              options={{
                mode: 'javascript',
                // scrollbarStyle: 'overlay',
                theme: isDarkMode ? 'material' : 'eclipse',
                ...(options.editor && options.editor),
              }}
              onBeforeChange={(editor, data, value) => {
                setLocalValue(value);
              }}
              onChange={(editor, data, value) => {
                onValueChange(value);
              }}
            />
          </div>
          {extra}
        </div>
    </div>
  );
};
