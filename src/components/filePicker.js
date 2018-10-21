import React, { Component } from 'react';
import { remote } from 'electron';

import Button from './button';
import { asyncReadRecursively } from '../util/fs';

import CrossIcon from '../icons/cross.svg';
import FolderIcon from '../icons/folder.svg';

export default class FilePicker extends Component {

  async open() {
    const paths = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections'],
    });
    this.props.onLoadingChange(true);
    if (!paths) {
      this.props.onLoadingChange(false);
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
      this.props.onLoadingChange(false);
    }
  }

  render() {
    return (
      <div className="file-picker">
        <Button
          label="Open Files"
          icon={<FolderIcon />}
          onClick={this.open.bind(this)}
        />
        <Button
          className="file-picker__clear"
          type="delete"
          disabled={!this.props.files.length > 0}
          icon={<CrossIcon />}
          onClick={() => this.props.onFileOpen([])}
        />
      </div>
    );
  }
}
