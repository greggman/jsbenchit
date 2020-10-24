import React from 'react';
import Dialog from './Dialog.js';
import SaveAsGist from './SaveAsGist.js';
import SaveAsJSON from './SaveAsJSON.js';
import SaveAsURL from './SaveAsURL.js';
import Section from './Section.js';

export default function Save(props) {
  const {data, gistId, onSave, onClose} = props;
  return (
    <Dialog title="Save As" onClose={onClose}>
      <Section heading="Save As Gist">
        <SaveAsGist gistId={gistId} data={data} onSave={onSave} onClose={onClose} />
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
