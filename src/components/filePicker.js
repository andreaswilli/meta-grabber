import React, { Component } from 'react'
import { remote } from 'electron'
import { withTranslation } from 'react-i18next'

import Button from './button'
import { asyncReadRecursively } from '../util/fs'

import CrossIcon from '../icons/cross.svg'
import FolderIcon from '../icons/folder.svg'

class FilePicker extends Component {
  async open() {
    const { t } = this.props
    const { filePaths: paths, canceled } = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections'],
    })
    if (canceled) {
      return
    }
    this.props.onLoadingChange(true)
    try {
      const files = await asyncReadRecursively(paths)
      this.props.onFileOpen(
        files.filter(
          file =>
            this.props.includedExtensions
              .filter(ext => ext)
              .some(extension => file.toLowerCase().endsWith(extension)) &&
            !this.props.excludedTerms
              .filter(term => term)
              .some(term => file.toLowerCase().includes(term))
        )
      )
    } catch (error) {
      this.props.onMessages({
        id: 'open-error',
        text: t('error.openFiles', { error }),
        type: 'error',
        dismissable: true,
      })
    } finally {
      this.props.onLoadingChange(false)
    }
  }

  render() {
    const { t } = this.props
    return (
      <div className="file-picker">
        <Button
          label={t('openFiles')}
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
    )
  }
}

export default withTranslation('filePicker')(FilePicker)
