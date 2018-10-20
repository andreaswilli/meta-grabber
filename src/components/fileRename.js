import React, { Component } from 'react';
import fs from 'fs';
import { remote } from 'electron';
import classNames from 'classnames';
import AnimateHeight from 'react-animate-height';
import util from 'util';

import Button from './button';
import { flatten } from '../util/array';
import { formatFileName, formatFilePath, formatFileExtension } from '../util/format';

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const rename = util.promisify(fs.rename);
const readFile = util.promisify(fs.readFile);

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
    if (!outputDir[0]) return;
    this.props.onChooseOutputDir(outputDir[0]);
  }

  async renameFiles() {
    this.props.onLoadingChange(true);
    let assignments = this.state.assignments.filter(a => a.fileName);
    try {
      // make sure that none of the new files replaces any existing file
      let nameMappings = await Promise.all(assignments.map(async a => {
        return new Promise(async (resolve, reject) => {
          const newFileDir = ((this.props.outputDir !== '?' && this.props.outputDir)
            || formatFilePath(a.fileName))
              .replace(/\{show_name\}/g, this.props.tvShow.name || 'error')
              .replace(/[#%&\{\}<>\*\?$!'":@]/g, '');
          try {
            // test if directory is existing
            await stat(newFileDir);
          } catch(e) {
            try {
              // create directory if it does not exist yet
              await mkdir(newFileDir);
            } catch (error) {
              reject(`Output directory could not be created: ${error}`);
            }
          }
          let newFileName = `${newFileDir}/${a.name}.${formatFileExtension(a.fileName)}`;
          try {
            // check if file is already exiting
            await readFile(newFileName);
            reject(`Error: File is already existing: ${newFileName}`);
          } catch(error) {
            if(error.toString().indexOf('no such file or directory') !== -1) {
              // file is not existing, continue
              resolve({
                oldFileName: a.fileName,
                newFileName,
              });
            } else {
              reject(error);
            }
          }
        });
      }));

      // none of the files are existing already, continue
      await Promise.all(nameMappings.map(mapping => {
        return new Promise(async (resolve, reject) => {
          try {
            await rename(mapping.oldFileName, mapping.newFileName);
            resolve();
          } catch(error) {
            reject(`Files could not be renamed: ${error}`);
          }
        });
      }));
      this.props.onFileRenameSuccess();
    } catch(error) {
      this.props.onMessages({
        id: 'rename-error',
        text: error,
        type: 'error',
        dismissable: true,
      });
    } finally {
      this.props.onLoadingChange(false);
    }
  }

  render() {
    return (
      <React.Fragment>
        {<div className="section section--main">
          <div className="file-rename__seasons">
            {(this.props.seasons || []).map((s, i) => (
              <AnimateHeight
                key={s.name}
                duration={ 500 }
                height={ this.isWholeSeasonExcluded(s.name) ? 62 : 'auto' }
              >
                <label className="file-rename__item__label">
                  <input
                    type="checkbox"
                    className="file-rename__item__checkbox"
                    checked={!this.isSeasonExcluded(s.name)}
                    onChange={event => this.handleSeasonChange(event, s.name)}
                  />
                  <div
                    className={classNames('file-rename__item', {
                      'file-rename__item--season--excluded': this.isWholeSeasonExcluded(s.name),
                    })}
                  >{s.name}</div>
                </label>
                {s.episodes.map((e, i) => (
                  <div key={e}>
                    <label className={classNames('file-rename__item', 'file-rename__item--episode', {
                      'file-rename__item--even': i%2 == 0,
                      'file-rename__item--included': !this.isEpisodeExcluded(e),
                    })}>
                      <input
                        type="checkbox"
                        tabIndex={-1}
                        className="file-rename__item__checkbox"
                        checked={!this.isEpisodeExcluded(e)}
                        onChange={event => this.handleEpisodeChange(event, e)}
                      />
                      <div className="file-rename__item__name">{e}</div>
                      <div className="file-rename__item__file-name">{formatFileName(this.getAssignedFileName(e))}</div>
                    </label>
                  </div>
                ))}
              </AnimateHeight>
            ))}
          </div>
        </div>}
        <div className="section section--output">
          <div className="file-rename__output__dir">
            {((this.props.outputDir !== '?' && this.props.outputDir) || 'none (leave the files where they are)')
              .replace(/\{show_name\}/g, this.props.tvShow.name || '{show_name}')
              .replace(/[#%&<>\*\?$!'":@]/g, '')}
          </div>
          <Button
            className="file-rename__output__choose"
            label="choose output dir"
            onClick={this.handleChooseOutputDir.bind(this)}
          />
          <Button
            className="file-rename__output__clear"
            type="delete"
            disabled={!this.props.outputDir || this.props.outputDir === '?'}
            label="X"
            onClick={this.props.onClearOutputDir}
          />
          <Button
            className="file-rename__rename-button"
            type="confirm"
            label="rename"
            onClick={this.renameFiles.bind(this)}
            disabled={this.state.assignments.filter(a => a.fileName).length === 0}
          />
        </div>
      </React.Fragment>
    );
  }
}
