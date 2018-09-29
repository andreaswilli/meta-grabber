import React, { Component } from 'react';
import axios from 'axios';

import TvShowInput from './components/tvShowInput';
import FilePicker from './components/filePicker';
import { makeRequestCreator } from './util/request';
import { formatEpisodeName } from './util/format';
import FileRename from './components/fileRename';
import Button from './components/button';
import Message from './components/message';
import SettingsPane from './components/settings/settingsPane';

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
      settings: {
        metaDataLang: localStorage.getItem('metaDataLang') || 'en',
        template: localStorage.getItem('template') || 'S{season_no} E{episode_no} - {episode_name}',
        defaultOutputDir: localStorage.getItem('defaultOutputDir'),
      },
    };

    this.state = this.initialState;
  }

  componentDidMount() {
    this.updateUsageHint();
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
      // this.setState({ seasons: response.data.seasons });
      const seasons =
        await Promise.all(response.data.seasons.map(async season => {
          try{
            const response = await (makeRequestCreator())(
              `/tv/${tvShow.id}/season/${season.season_number}?language=${this.state.settings.metaDataLang}`
            );
            return response.data;
          } catch(e) {
              // TODO: error handling
          }
        }));
      this.setState({ seasons, loading: false });
      this.updateUsageHint(seasons);
    } catch(e) {
      if (axios.isCancel(e)) {
        // ignore canceled request
      } else {
        // TODO: error handling
      };
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
      settings: {
        metaDataLang: localStorage.getItem('metaDataLang') || 'en',
        template: localStorage.getItem('template') || 'S{season_no} E{episode_no} - {episode_name}',
        defaultOutputDir: localStorage.getItem('defaultOutputDir'),
      },
      messages: [
        ...this.initialState.messages.filter(m => m.id !== 'rename-error'), {
          id: 'rename-success',
          text: 'Files successfully renamed!',
          type: 'success',
          autoDismiss: 5000,
        },
      ],
    });
  }

  handleFileRenameError(error) {
    this.setState({
      messages: [
        ...this.state.messages, {
          id: 'rename-error',
          text: `Files could not be renamed: ${error}`,
          type: 'error',
          dismissable: true,
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
        messages: this.state.messages.filter(m => m.id !== 'usage-hint'),
      });
    }
  }

  render () {
    return (
      <div className="app">
        <div className="container">
          <div className="page">
            <div className="section">
              <TvShowInput
                query={this.state.query}
                onSelect={this.handleSelect.bind(this)}
                onChange={query => this.setState({ query })}
                metaDataLang={this.state.settings.metaDataLang}
              />
              <FilePicker
                onFileOpen={this.handleFileOpen.bind(this)}
                files={this.state.files}
              />
              <Button
                label="settings"
                className="settings-button"
                onClick={() => this.setState({ settingsPaneOpen: true })}
              />
            </div>
            <Message
              messages={this.state.messages}
              onMessagesUpdate={(messages) => this.setState({ messages })}
            />
            <FileRename
              tvShow={this.state.tvShow || {}}
              seasons={
                this.state.seasons.map(s => ({
                  name: s.name,
                  episodes: s.episodes.map(e => formatEpisodeName(e, this.state.tvShow, this.state.settings.template)),
                }))
              }
              loading={this.state.loading}
              files={this.state.files.sort()}
              outputDir={this.state.outputDir || this.state.settings.defaultOutputDir}
              onFileRenameSuccess={this.handleFileRenameSuccess.bind(this)}
              onFileRenameError={(error) => this.handleFileRenameError(error)}
              onChooseOutputDir={outputDir => this.setState({ outputDir })}
              onClearOutputDir={() => this.setState({ outputDir: '?' })}
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
