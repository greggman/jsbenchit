import React from 'react';
import Dialog from './Dialog.js';
import SaveAsGist from './SaveAsGist.js';
import SaveAsJSON from './SaveAsJSON.js';
import SaveAsURL from './SaveAsURL.js';
import Section from './Section.js';

export default function Save(props) {
  const {data, github, gistId, onSave, onClose, addError} = props;
  return (
    <Dialog title="Save As" onClose={onClose}>
      <Section heading="Save As Gist">
        <SaveAsGist gistId={gistId} github={github} data={data} onSave={onSave} addError={addError} onClose={onClose} />
      </Section>
      <Section heading="Save As URL">
        <SaveAsURL data={data} />
      </Section>
      <Section heading="Save As JSON">
        <SaveAsJSON data={data} />
      </Section>
    </Dialog>
  )
}
