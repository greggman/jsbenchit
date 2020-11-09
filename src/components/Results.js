import React from 'react';
import {createResults} from '../libs/result-helper.js';
import './Results.css';

export default function Results(props) {
  return createResults(props, React.createElement);
};