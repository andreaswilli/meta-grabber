import React, { Component } from 'react';
import fs from 'fs';
import { remote } from 'electron';
import classNames from 'classnames';
import AnimateHeight from 'react-animate-height';

import Button from './button';
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
    if (JSON.stringify(this.props.seasons) !== JSON.stringify(nextProps.seasons)) {
      this.setState({ excludedSeasons: [] });
    }
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

  isWholeSeasonExcluded(seasonName) {
    return (this.state.excludedSeasons.find(season =>
      season.name === seasonName) || { excludedEpisodes: {}}).excludedEpisodes.length ===
      this.props.seasons.find(season =>
      season.name === seasonName).episodes.length;
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
      properties: ['openDirectory', 'createDirectory'],
    });
    if (!outputDir) return;
    this.props.onChooseOutputDir(outputDir);
  }

  renameFiles() {
    let assignments = this.state.assignments.filter(a => a.fileName);
    try {
      for (let i = 0; i < assignments.length; i++) {
        const a = assignments[i];
        let newFileName = `${this.props.outputDir || formatFilePath(a.fileName)}/${a.name}.${formatFileExtension(a.fileName)}`;
        fs.renameSync(a.fileName, newFileName);
      }
      this.props.onFileRenameSuccess();
    } catch(e) {
      this.props.onFileRenameError(e);
    }
  }

  render() {
    return (
      <React.Fragment>
        {<div className="section section--main">
          <div className="file-rename__seasons">
            {this.props.loading && <div className="file-rename__loading">loading...</div>}
            {!this.props.loading && (this.props.seasons || []).map((s, i) => (
              <AnimateHeight
                key={s.name}
                duration={ 500 }
                height={ this.isWholeSeasonExcluded(s.name) ? 62 : 'auto' }
              >
                <label className={classNames('file-rename__item', {
                  'file-rename__item--season--excluded': this.isWholeSeasonExcluded(s.name),
                })}>
                  <input
                    type="checkbox"
                    className="file-rename__item__checkbox"
                    checked={!this.isSeasonExcluded(s.name)}
                    onChange={event => this.handleSeasonChange(event, s.name)}
                  />
                  {s.name}
                </label>
                {s.episodes.map((e, i) => (
                  <div key={e}>
                    <label className={classNames('file-rename__item', 'file-rename__item--episode', {
                      'file-rename__item--even': i%2 == 0,
                      'file-rename__item--included': !this.isEpisodeExcluded(e),
                    })}>
                      <input
                        type="checkbox"
                        className="file-rename__item__checkbox"
                        checked={!this.isEpisodeExcluded(e)}
                        onChange={event => this.handleEpisodeChange(event, e)}
                      />
                      <div>{e}</div>
                      <div className="file-rename__item__file-name">{formatFileName(this.getAssignedFileName(e))}</div>
                    </label>
                  </div>
                ))}
              </AnimateHeight>
            ))}
          </div>
        </div>}
        <div className="section section--output">
          <div className="file-rename__output__dir">{this.props.outputDir || 'none (leave the files where they are)'}</div>
          <Button
            className="file-rename__output__choose"
            label="choose output dir"
            onClick={this.handleChooseOutputDir.bind(this)}
          />
          <Button
            className="file-rename__output__clear"
            label="X"
            onClick={this.props.onClearOutputDir}
          />
          <Button
            className="file-rename__rename-button"
            label="rename"
            onClick={this.renameFiles.bind(this)}
          />
        </div>
      </React.Fragment>
    );
  }
}
