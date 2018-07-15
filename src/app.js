import React, { Component } from 'react';
import axios from 'axios';
import { remote } from 'electron';

import TvShowInput from './components/tvShowInput';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      files: [],
      tvShow: null,
    };
  }

  chooseTvShow(tvShow) {
    this.setState({ tvShow: tvShow.id });
  }

  async open() {
    const files = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections', 'createDirectory'],
    });
    if (!files) return;
    this.setState({ files });
  }

  render () {
    return (
      <div>
        <h1>Title</h1>
        <button onClick={this.open.bind(this)}>open</button>
        <ul>
          {this.state.files.map(f => <li key={f}>{f}</li>)}
        </ul>
        <TvShowInput
          onSelect={this.chooseTvShow.bind(this)}/>
      </div>
    );
  }
}
