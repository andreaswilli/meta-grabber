import React, { Component } from 'react';
import axios from 'axios';

import TvShowInput from './components/tvShowInput';
import FilePicker from './components/filePicker';
import { makeRequestCreator } from './util/request';
import { formatEpisodeName } from './util/format';
import FileRename from './components/fileRename';
import Button from './components/button';
import SettingsPane from './components/settings/settingsPane';
import Messages from './components/messages';
import LoadingIndicator from './components/loadingIndicator';

import './util/array.js';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.get = makeRequestCreator();

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
    };

    this.state = this.initialState;
  }

  componentDidMount() {
    this.updateUsageHint();
  }

  loadSettings() {
    return {
      metaDataLang: (localStorage.getItem('metaDataLang') || 'en').replace(/^\(empty\)$/, ''),
      template: (localStorage.getItem('template') || 'S{season_no} E{episode_no} - {episode_name}')
        .replace(/^\(empty\)$/, ''),
      defaultOutputDir: (localStorage.getItem('defaultOutputDir') || '').replace(/^\(empty\)$/, ''),
      includedExtensions: ((localStorage.getItem('includedExtensions') || 'mkv,avi,mp4,mov'))
        .replace(/^\(empty\)$/, '').split(',').map(ext => ext.trim()).filter(ext => ext),
      excludedTerms: ((localStorage.getItem('excludedTerms') || 'sample'))
        .replace(/^\(empty\)$/, '').split(',').map(ext => ext.trim()).filter(term => term),
    };
  }

  async getSeasonsOf(tvShow) {
    if (!tvShow || !tvShow.id) {
      this.setState({ seasons: [] });
      this.updateUsageHint([]);
      return;
    }
    this.setState({ loading: true });
    try {
      const response = await this.get(
        `/tv/${tvShow.id}?language=${this.state.settings.metaDataLang}`
      );
      const seasons =
        await Promise.all(response.data.seasons.map(async season => {
          const response = await (makeRequestCreator())(
            `/tv/${tvShow.id}/season/${season.season_number}?language=${this.state.settings.metaDataLang}`
          );
          return response.data;
        }));
      this.setState({ seasons });
      this.updateUsageHint(seasons);
    } catch(error) {
      if (axios.isCancel(error)) {
        // ignore canceled request
      } else {
        this.handleMessages({
          id: 'load-seasons-error',
          text: `Failed to load seasons: ${error}`,
          type: 'error',
          dismissable: true,
        });
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSelect(tvShow) {
    this.setState({ tvShow });
    this.getSeasonsOf(tvShow);
  }

  // use Set() to prevent duplicates in array
  handleFileOpen(files) {
    this.setState({
      files: files.length === 0 ? files : [...new Set([
        ...this.state.files,
        ...files,
      ])],
    });
    this.updateUsageHint(undefined, files);
  }

  handleFileRenameSuccess() {
    this.setState({
      ...this.initialState,
      settings: this.loadSettings(),
      messages: [
        ...this.initialState.messages.filter(m => m.id !== 'rename-error'), {
          id: 'rename-success',
          text: 'Files successfully renamed!',
          type: 'success',
          autoDismiss: 3000,
        },
      ],
    });
  }

  updateUsageHint(seasons, files) {
    let newSeasons = seasons !== undefined ? seasons : this.state.seasons;
    let newFiles = files !== undefined ? files : this.state.files;
    if (newSeasons.length === 0 || newFiles.length === 0) {
      this.setState({
        messages: [
          ...this.state.messages.filter(m => m.id !== 'usage-hint'), {
            id: 'usage-hint',
            text: `Please${newSeasons.length === 0
              ? ` search for a TV show${newFiles.length === 0 ? ' and' : '.'}` : ''}${
                newFiles.length === 0 ? ' open the files you want to rename.' : ''}`,
            type: 'info',
          },
        ]
      })
    } else {
      this.setState({
        messages: [
          ...this.state.messages.filter(m => m.id !== 'usage-hint'), {
            ...this.state.messages.find(m => m.id === 'usage-hint'),
            willDismiss: true,
          },
        ],
      });
    }
  }

  handleMessages(messages) {
    const msgArray = [].concat(messages);
    this.setState({
      messages: [
        ...this.state.messages.filter(msg => msgArray.every(m => m.id !== msg.id)),
        ...msgArray,
      ],
    });
  }

  render () {
    return (
      <div className="app">
        <LoadingIndicator hidden={!this.state.loading} />
        <div className="container">
          <div className="page">
            <div className="section">
              <TvShowInput
                query={this.state.query}
                onSelect={this.handleSelect.bind(this)}
                onChange={query => this.setState({ query })}
                metaDataLang={this.state.settings.metaDataLang}
                onMessages={this.handleMessages.bind(this)}
              />
              <FilePicker
                onFileOpen={this.handleFileOpen.bind(this)}
                includedExtensions={this.state.settings.includedExtensions}
                excludedTerms={this.state.settings.excludedTerms}
                files={this.state.files}
                onLoadingChange={loading => this.setState({ loading })}
                onMessages={this.handleMessages.bind(this)}
              />
              <Button
                label="settings"
                className="settings-button"
                onClick={() => this.setState({ settingsPaneOpen: true })}
              />
            </div>
            <Messages
              messages={this.state.messages}
              onMessagesUpdate={messages => this.setState({ messages })}
            />
            <FileRename
              tvShow={this.state.tvShow || {}}
              seasons={
                this.state.seasons.map(s => ({
                  name: s.name,
                  episodes: s.episodes.map(e => formatEpisodeName(e, this.state.tvShow, this.state.settings.template)),
                }))
              }
              files={this.state.files.sort()}
              outputDir={this.state.outputDir || this.state.settings.defaultOutputDir}
              onFileRenameSuccess={this.handleFileRenameSuccess.bind(this)}
              onChooseOutputDir={outputDir => this.setState({ outputDir })}
              onClearOutputDir={() => this.setState({ outputDir: '?' })}
              onLoadingChange={loading => this.setState({ loading })}
              onMessages={this.handleMessages.bind(this)}
            />
          </div>
        </div>
        <SettingsPane
          onOpenChange={open => this.setState({ settingsPaneOpen: open })}
          onChange={settings => this.setState({ settings })}
          openState={this.state.settingsPaneOpen}
          settings={this.state.settings}
        />
      </div>
    );
  }
}
