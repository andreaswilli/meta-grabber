import React, { Component } from 'react';
import { remote } from 'electron';

export default class FilePicker extends Component {

  async open() {
    const files = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    });
    if (!files) return;
    this.props.onFileOpen(files);
  }

  render() {
    return (
      <div>
        <button onClick={this.open.bind(this)}>open files</button>
        <button onClick={() => this.props.onFileOpen([])}>clear files</button>
      </div>
    );
  }
}
