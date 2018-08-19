import React, { Component } from 'react';
import axios from 'axios';

import TvShowInput from './components/tvShowInput';
import FilePicker from './components/filePicker';
import { makeRequestCreator, baseUrl, apiKey } from './util/request';
import { formatEpisodeName } from './util/format';
import FileRename from './components/FileRename';

import './util/array.js';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.get = makeRequestCreator();

    this.state = {
      files: [],
      tvShow: null,
      seasons: [],
      query: '',
    };
  }

  chooseTvShow(tvShow) {
    this.setState({ tvShow: tvShow.id });
  }

  async getSeasonsOf(tvShow) {
    if (!tvShow || !tvShow.id) {
      this.setState({ seasons: [] });
      return;
    }
    try {
      const response = await this.get(
        `${baseUrl}/tv/${tvShow.id}?api_key=${apiKey}&language=de`
      );
      // this.setState({ seasons: response.data.seasons });
      const seasons =
        await Promise.all(response.data.seasons.map(async season => {
          try{
            const response = await (makeRequestCreator())(
              `${baseUrl}/tv/${tvShow.id}/season/${
                season.season_number}?api_key=${apiKey}&language=de`
            );
            return response.data;
          } catch(e) {
              // TODO: error handling
          }
        }));
      this.setState({ seasons });
    } catch(e) {
      if (axios.isCancel(e)) {
        // ignore canceled request
      } else {
        // TODO: error handling
      };
    }
  }

  handleSelect(tvShow) {
    this.chooseTvShow(tvShow);
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
  }

  handleFileRenameSuccess() {
    this.setState({
      files: [],
      tvShow: null,
      seasons: [],
      query: '',
    });
  }

  render () {
    return (
      <div>
        <h1>Title</h1>
        <FilePicker onFileOpen={this.handleFileOpen.bind(this)} />
        <TvShowInput
          query={this.state.query}
          onSelect={this.handleSelect.bind(this)}
          onChange={query => this.setState({ query })}/>
        <FileRename
          seasons={
            this.state.seasons.map(s => ({
              name: s.name,
              episodes: s.episodes.map(e => formatEpisodeName(e, this.state.tvShow)),
            }))
          }
          files={this.state.files.sort()}
          onFileRenameSuccess={this.handleFileRenameSuccess.bind(this)}
        />
      </div>
    );
  }
}
