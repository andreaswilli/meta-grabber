import React, { Component } from 'react';
import fs from 'fs';
import { remote } from 'electron';

import { flatten } from '../util/array';
import { formatFileName, formatFilePath, formatFileExtension } from '../util/format';

export default class FileRename extends Component {

  constructor(props) {
    super(props);

    this.state = {
      excludedSeasons: [],
      assignments: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.assignEpisodesToFiles(nextProps);
  }

  isSeasonExcluded(seasonName) {
    return this.state.excludedSeasons.find(season =>
      season.name === seasonName) !== undefined;
  }

  isEpisodeExcluded(episodeName) {
    return this.state.excludedSeasons.filter(season =>
      season.excludedEpisodes.filter(episode =>
        episode === episodeName).length > 0).length > 0;
  }

  async handleSeasonChange(e, seasonName) {
    if (e.target.checked) {
      // include season
      await this.setState({
        excludedSeasons: this.state.excludedSeasons.filter(s => s.name !== seasonName),
      });
    } else {
      // exclude season
      await this.setState({
        excludedSeasons: [
          ...this.state.excludedSeasons,
          {
            name: seasonName,
            excludedEpisodes: this.props.seasons.find(s =>
              s.name === seasonName).episodes,
          },
        ],
      });
    }
    this.assignEpisodesToFiles(this.props);
  }

  async handleEpisodeChange(e, episodeName) {
    let season = this.props.seasons.find(season =>
      season.episodes.filter(episode =>
        episode === episodeName).length > 0);
    let excludedSeason = this.state.excludedSeasons.find(s => s.name === season.name);

    if (e.target.checked) {
      // include episode
      let excludedEpisodes = excludedSeason.excludedEpisodes.filter(e => e !== episodeName);
      let excludedSeasons = this.state.excludedSeasons.filter(s => s.name !== excludedSeason.name);
      if (excludedEpisodes.length > 0) {
        excludedSeasons = [
          ...excludedSeasons,
          {
            name: excludedSeason.name,
            excludedEpisodes: excludedEpisodes,
          },
        ];
      }
      await this.setState({ excludedSeasons });
    } else {
      // exclude episode
      let excludedSeasons = excludedSeason
        ? [
          ...this.state.excludedSeasons.filter(s => s.name !== excludedSeason.name),
          {
            name: excludedSeason.name,
            excludedEpisodes: [
              ...excludedSeason.excludedEpisodes,
              episodeName,
            ],
          }
        ]
        : [
          ...this.state.excludedSeasons,
          {
            name: season.name,
            excludedEpisodes: [episodeName],
          },
        ];
      await this.setState({ excludedSeasons });
    }
    this.assignEpisodesToFiles(this.props);
  }

  assignEpisodesToFiles(props) {
    let excludedEpisodesCount = 0;
    this.setState({
      assignments: flatten(props.seasons.map(s => s.episodes)).map((e, i) => {
        let excluded = this.isEpisodeExcluded(e);
        if (excluded) {
          excludedEpisodesCount++;
        }
        return {
          name: e,
          fileName: excluded ? undefined : props.files[i - excludedEpisodesCount],
        };
      }),
    });
  }

  getAssignedFileName(episodeName) {
    let assignment = this.state.assignments.find(a => a.name === episodeName);
    return assignment ? assignment.fileName : null;
  }

  async handleChooseOutputDir() {
    const outputDir = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (!outputDir) return;
    this.props.onChooseOutputDir(outputDir);
  }

  renameFiles() {
    let error = false;
    let assignments = this.state.assignments.filter(a => a.fileName);
    assignments.map((a, i) => {
      let newFileName = `${this.props.outputDir || formatFilePath(a.fileName)}/${a.name}.${formatFileExtension(a.fileName)}`;
      fs.rename(a.fileName, newFileName, err => {
        if (err) {
          error = true;
          throw err;
        }
        if (i >= assignments.length - 1 && !error) {
          this.props.onFileRenameSuccess();
        }
      });
    });
  }

  render() {
    return (
      <div>
        <span>{this.props.outputDir}</span>
        <button onClick={this.handleChooseOutputDir.bind(this)}>choose output dir</button>
        <button onClick={this.props.onClearOutputDir}>clear</button>
        <br />
        <button onClick={this.renameFiles.bind(this)}>rename</button>
        {(this.props.seasons || []).map(s => (
          <div key={s.name}>
            <label className="pre">
              <input
                type="checkbox"
                checked={!this.isSeasonExcluded(s.name)}
                onChange={event => this.handleSeasonChange(event, s.name)}
              />
              {s.name}
            </label>
            {s.episodes.map(e => (
              <div key={e}>
                <label className="pre offset">
                  <input
                    type="checkbox"
                    checked={!this.isEpisodeExcluded(e)}
                    onChange={event => this.handleEpisodeChange(event, e)}
                  />
                  <span>{e}</span>&nbsp;<b>{formatFileName(this.getAssignedFileName(e))}</b>
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
