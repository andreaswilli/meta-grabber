import React, { Component } from 'react';
import { remote } from 'electron';

import Button from './button';

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
      <div className="file-picker section">
        <Button
          label="open files"
          onClick={this.open.bind(this)}
        />
        <Button
          className="file-picker__clear"
          label="X"
          onClick={() => this.props.onFileOpen([])}
        />
      </div>
    );
  }
}
