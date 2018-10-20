import React, { Component } from 'react';
import { remote } from 'electron';

import Button from './button';
import { asyncReadRecursively } from '../util/fs';

export default class FilePicker extends Component {

  async open() {
    const paths = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections'],
    });
    if (!paths) {
      return;
    }
    try {
      const files = await asyncReadRecursively(paths);
      this.props.onFileOpen(files.filter(file =>
          this.props.includedExtensions.filter(ext => ext).some(extension => file.toLowerCase().endsWith(extension)) &&
          !this.props.excludedTerms.filter(term => term).some(term => file.toLowerCase().includes(term))
      ));
    } catch (error) {
      this.props.onMessages({
        id: 'open-error',
        text: `Files could not be opened: ${error}`,
        type: 'error',
        dismissable: true,
      });
    } finally {
    }
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
