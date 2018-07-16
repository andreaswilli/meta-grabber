import React, { Component } from 'react';
import axios from 'axios';

import TvShowInput from './components/tvShowInput';
import FilePicker from './components/filePicker';
import { makeRequestCreator, baseUrl, apiKey } from './util/request';
import { formatEpisodeName } from './util/format';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.get = makeRequestCreator();

    this.state = {
      files: [],
      tvShow: null,
      seasons: [],
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

  render () {
    return (
      <div>
        <h1>Title</h1>
        <FilePicker onFileOpen={this.handleFileOpen.bind(this)} />
        <ul>
          {this.state.files.map(f => <li key={f}>{f}</li>)}
        </ul>
        <TvShowInput
          onSelect={this.handleSelect.bind(this)}/>
        {this.state.seasons.map(s => (
          <div
            className="pre"
            key={s.season_number}>
            <b>{s.name}</b><br />
            {s.episodes && s.episodes.map(e =>
              <div
                className="pre"
                key={e.episode_number}>
                {formatEpisodeName(e, this.state.tvShow)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
}
