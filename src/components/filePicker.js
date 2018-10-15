import React, { Component } from 'react';
import { remote } from 'electron';

import Button from './button';
import { readRecursively } from '../util/fs';

export default class FilePicker extends Component {

  async open() {
    const files = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections'],
    });
    if (!files) return;
    this.props.onFileOpen(readRecursively(files)
      .filter(file =>
        this.props.includedExtensions.filter(ext => ext).some(extension => file.toLowerCase().endsWith(extension)) &&
        !this.props.excludedTerms.filter(term => term).some(term => file.toLowerCase().includes(term)
      )
    ));
  }

  render() {
    return (
      <div className="file-picker">
        <Button
          label="open files"
          onClick={this.open.bind(this)}
        />
        <Button
          className="file-picker__clear"
          type="delete"
          disabled={!this.props.files.length > 0}
          label="X"
          onClick={() => this.props.onFileOpen([])}
        />
      </div>
    );
  }
}
