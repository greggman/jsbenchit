import React from 'react';
import { classNames } from './css-utils';

export default class SaveAsGist extends React.Component {
  constructor () {
    super();
    this.state = {
      saving: false,
      pat: localStorage.getItem('pat') || '',
    };
  }
  handlePATChange = (e) => {
    const pat = e.target.value;
    this.setState({pat});
    localStorage.setItem('pat', pat);
  }
  onSave = async() => {
    this.setState({saving: true});
    const {data, github, addError, onSave} = this.props;
    const {pat} = this.state;
    github.setPat(pat);
    try {
      const gist_id = await github.createGist(data);
      onSave(gist_id);
    } catch (e) {
      addError(`could not create gist: ${e}`)
    }
    this.setState({saving: false});
  }
  render() {
    const {pat} = this.state;
    return (
      <div>
        <div className="save-as-gist-pat">
          <div>Personal Access Token:&nbsp;</div>
          <div>
            <input
              type="password"
              value={pat}
              placeholder="personal access token"
              onChange={this.handlePATChange}
            />
          </div>
        </div>
        <p>
          <button
            className={classNames({disabled: !pat})}
            onClick={this.onSave}
          >Save to new Gist</button>
        </p>
        <p>
          <a href="https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token">Create a Personal Access Token</a> with only <b>gist</b> permissions.
          Paste it above. Note: This is a static website. Your person access token
          is stored only locally in your browser and only accessible by this domain.
        </p>
      </div>
    );
  }
}