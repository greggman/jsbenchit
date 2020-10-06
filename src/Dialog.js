import React from 'react';

export default function Dialog(props) {
  const {title, children, onClose} = props;
  return (
    <div className="dialog">
      <div>
        <div className="dialog-heading">
          <div className="dialog-title">{title}</div>
          <div className="dialog-close">
            <button onClick={onClose}>☒</button>
          </div>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
