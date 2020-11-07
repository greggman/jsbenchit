import React from 'react';
import CodeArea from './CodeArea.js';
import EditLine from './EditLine.js';
import * as model from '../libs/model.js';

export default class TestArea extends React.Component {
//  constructor(props) {
//    super(props);
//  }
  handleChange = () => {
    this.forceUpdate();
  }
  componentDidMount() {
    const {test} = this.props;
    model.subscribeTest(test, this.handleChange);
  }
  componentWillUnmount() {
    const {test} = this.props;
    model.unsubscribeTest(test, this.handleChange);
  }
  handleTitleChange = (title) => {
    const {testNdx} = this.props;
    model.setTestName(testNdx, title);
  }
  handleValueChange = (value) => {
    const {testNdx} = this.props;
    model.setTestCode(testNdx, value);
  }
  render() {
    const {desc, test, hackKey} = this.props;
    const {name} = test;
    const heading = (
      <EditLine
        placeholder={desc}
        value={name}
        onChange={this.handleTitleChange}
      />
    );

    return (
      <CodeArea
        key={hackKey}
        value={test.code}
        {...this.props}
        heading={heading}
        onValueChange={this.handleValueChange} />
    );
  }
}