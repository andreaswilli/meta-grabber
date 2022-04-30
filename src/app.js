import React, { Component } from 'react'
import axios from 'axios'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { ipcRenderer } from 'electron'

import TvShowInput from './components/tvShowInput'
import FilePicker from './components/filePicker'
import { getTvDbToken, getTvShow } from './util/request'
import { formatEpisodeName } from './util/format'
import FileRename from './components/fileRename'
import Button from './components/button'
import SettingsPane from './components/settings/settingsPane'
import Messages from './components/messages'
import LoadingIndicator from './components/loadingIndicator'
import Modal from './components/modal'
import { migrateFileNameTemplate } from './util/migrate'

import SettingsIcon from './icons/settings.svg'

import './util/array.js'

class App extends Component {
  constructor(props) {
    super(props)

    getTvDbToken()

    i18n.on('languageChanged', () => {
      this.updateUsageHint(this.state.seasons, this.state.files)
    })

    // menu bar item clicked / cmd+, pressed
    ipcRenderer.on('settings-toggle', () => {
      this.setState((state) => ({
        settingsPaneOpen: !state.settingsPaneOpen,
      }))
    })

    this.initialState = {
      files: [],
      tvShow: null,
      seasons: [],
      query: '',
      outputDir: null,
      loading: false,
      messages: [],
      settingsPaneOpen: false,
      settings: this.loadSettings(),
      showFileNameMigrationModal: false,
    }

    this.state = this.initialState
  }

  componentDidMount() {
    this.updateUsageHint()

    if (this.state.settings.defaultOutputDir.includes('{show_name}')) {
      this.setState({ showFileNameMigrationModal: true })

      let { defaultOutputDir, template } = this.state.settings
      let [newDir, newTemplate] = migrateFileNameTemplate(
        defaultOutputDir,
        template
      )

      localStorage.setItem('defaultOutputDir', newDir ?? '(empty)')
      localStorage.setItem('template', newTemplate)

      this.setState({
        settings: {
          ...this.state.settings,
          defaultOutputDir: newDir,
          template: newTemplate,
        },
      })
    }
  }

  loadSettings() {
    return {
      uiLang: localStorage.getItem('uiLang') || 'en',
      metaDataLang: (localStorage.getItem('metaDataLang') || 'en').replace(
        /^\(empty\)$/,
        ''
      ),
      apiProvider: localStorage.getItem('apiProvider') || 'moviedb',
      template: (
        localStorage.getItem('template') ||
        'S{season_no} E{episode_no} - {episode_name}'
      ).replace(/^\(empty\)$/, ''),
      defaultOutputDir: (
        localStorage.getItem('defaultOutputDir') || ''
      ).replace(/^\(empty\)$/, ''),
      includedExtensions: (
        localStorage.getItem('includedExtensions') || 'mkv,avi,mp4,mov'
      )
        .replace(/^\(empty\)$/, '')
        .split(',')
        .map((ext) => ext.trim())
        .filter((ext) => ext),
      excludedTerms: (localStorage.getItem('excludedTerms') || 'sample')
        .replace(/^\(empty\)$/, '')
        .split(',')
        .map((ext) => ext.trim())
        .filter((term) => term),
    }
  }

  async getSeasonsOf(tvShow) {
    if (!tvShow || !tvShow.id) {
      this.setState({ seasons: [] })
      this.updateUsageHint([])
      return
    }
    this.setState({ loading: true })
    try {
      const seasons = await getTvShow(tvShow)
      this.setState((prevState) => {
        let nextState = {
          seasons,
        }
        const loadSeasonsError = prevState.messages.find(
          (m) => m.id === 'load-seasons-error'
        )
        if (loadSeasonsError) {
          nextState.messages = [
            ...prevState.messages.filter((m) => m.id !== 'load-seasons-error'),
            {
              ...loadSeasonsError,
              willDismiss: true,
            },
          ]
        }
        return nextState
      })
      this.updateUsageHint(seasons)
    } catch (error) {
      if (axios.isCancel(error)) {
        // ignore canceled request
      } else {
        this.handleMessages({
          id: 'load-seasons-error',
          text: t('error.loadSeasons', { error }),
          type: 'error',
          dismissable: true,
        })
      }
    } finally {
      this.setState({ loading: false })
    }
  }

  handleSelect(tvShow) {
    this.setState({ tvShow })
    this.getSeasonsOf(tvShow)
  }

  // use Set() to prevent duplicates in array
  handleFileOpen(files) {
    this.setState({
      files:
        files.length === 0
          ? files
          : [...new Set([...this.state.files, ...files])],
    })
    this.updateUsageHint(undefined, files)
  }

  handleFileRenameSuccess() {
    this.setState({
      ...this.initialState,
      settings: this.loadSettings(),
      messages: [
        ...this.initialState.messages.filter((m) => m.id !== 'rename-error'),
        {
          id: 'rename-success',
          text: this.props.t('fileRenameSuccess'),
          type: 'success',
          autoDismiss: 3000,
        },
      ],
    })
  }

  updateUsageHint(seasons, files) {
    const { t } = this.props
    let newSeasons = seasons !== undefined ? seasons : this.state.seasons
    let newFiles = files !== undefined ? files : this.state.files
    if (newSeasons.length === 0 || newFiles.length === 0) {
      this.setState({
        messages: [
          ...this.state.messages.filter((m) => m.id !== 'usage-hint'),
          {
            id: 'usage-hint',
            text: t('usageHint.message', {
              message: `${
                newSeasons.length === 0 ? t('usageHint.searchTvShow') : ''
              }${
                newSeasons.length === 0 && newFiles.length === 0
                  ? t('usageHint.and')
                  : ''
              }${newFiles.length === 0 ? t('usageHint.openFiles') : ''}`,
            }),
            type: 'info',
          },
        ],
      })
    } else {
      const usageHint = this.state.messages.find((m) => m.id === 'usage-hint')
      this.setState({
        messages: [
          ...this.state.messages.filter((m) => m.id !== 'usage-hint'),
          usageHint ? { ...usageHint, willDismiss: true } : undefined,
        ].filter((m) => m),
      })
    }
  }

  handleMessages(messages) {
    const msgArray = [].concat(messages)
    this.setState({
      messages: [
        ...this.state.messages.filter((msg) =>
          msgArray.every((m) => m.id !== msg.id)
        ),
        ...msgArray,
      ],
    })
  }

  render() {
    const { t } = this.props
    return (
      <div className="app">
        <LoadingIndicator hidden={!this.state.loading} />
        {this.state.showFileNameMigrationModal && (
          <Modal>
            <div className="migrate-file-name-template">
              <h1>{t('fileNameMigration.title')}</h1>
              <p
                dangerouslySetInnerHTML={{
                  __html: t('fileNameMigration.changes'),
                }}
              ></p>
              <p>{t('fileNameMigration.check')}</p>
              <Button
                label={t('fileNameMigration.showSettings')}
                onClick={() =>
                  this.setState({
                    settingsPaneOpen: true,
                    showFileNameMigrationModal: false,
                  })
                }
              />
            </div>
          </Modal>
        )}
        <div className="container">
          <div className="page">
            <div className="section">
              <TvShowInput
                query={this.state.query}
                onSelect={this.handleSelect.bind(this)}
                onChange={(query) => this.setState({ query })}
                metaDataLang={this.state.settings.metaDataLang}
                onMessages={this.handleMessages.bind(this)}
              />
              <FilePicker
                onFileOpen={this.handleFileOpen.bind(this)}
                includedExtensions={this.state.settings.includedExtensions}
                excludedTerms={this.state.settings.excludedTerms}
                files={this.state.files}
                onLoadingChange={(loading) => this.setState({ loading })}
                onMessages={this.handleMessages.bind(this)}
              />
              <Button
                label={t('settings')}
                icon={<SettingsIcon />}
                className="settings-button"
                onClick={() => this.setState({ settingsPaneOpen: true })}
              />
            </div>
            <Messages
              messages={this.state.messages}
              onMessagesUpdate={(messages) => this.setState({ messages })}
            />
            <FileRename
              tvShow={this.state.tvShow || {}}
              seasons={this.state.seasons.map((s) => ({
                name: s.name,
                episodes: s.episodes.map((e) =>
                  formatEpisodeName(
                    e,
                    this.state.tvShow,
                    this.state.settings.template
                  )
                ),
              }))}
              files={this.state.files.sort()}
              outputDir={
                this.state.outputDir || this.state.settings.defaultOutputDir
              }
              onFileRenameSuccess={this.handleFileRenameSuccess.bind(this)}
              onChooseOutputDir={(outputDir) => this.setState({ outputDir })}
              onClearOutputDir={() => this.setState({ outputDir: '?' })}
              onLoadingChange={(loading) => this.setState({ loading })}
              onMessages={this.handleMessages.bind(this)}
            />
          </div>
        </div>
        <SettingsPane
          onOpenChange={(open) => this.setState({ settingsPaneOpen: open })}
          onChange={(settings) => this.setState({ settings })}
          openState={this.state.settingsPaneOpen}
          settings={this.state.settings}
        />
      </div>
    )
  }
}

export default withTranslation('app')(App)
