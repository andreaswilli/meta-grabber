import React, { Component } from 'react';
import fs from 'fs';
import { remote } from 'electron';
import classNames from 'classnames';
import AnimateHeight from 'react-animate-height';
import util from 'util';

import Button from './button';
import { flatten } from '../util/array';
import { formatFileName, formatFilePath, formatFileExtension } from '../util/format';

import CrossIcon from '../icons/cross.svg';
import FolderIcon from '../icons/folder.svg';
import CheckmarkIcon from '../icons/checkmark.svg';
import CheckboxUncheckedIcon from '../icons/checkbox-0.svg';
import CheckboxCheckedIcon from '../icons/checkbox-1.svg';

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const rename = util.promisify(fs.rename);
const readFile = util.promisify(fs.readFile);

export default class FileRename extends Component {

  constructor(props) {
    super(props);

    this.state = {
      includedSeasons: [],
      assignments: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.seasons) !== JSON.stringify(nextProps.seasons)) {
      this.setState({ includedSeasons: [] });
    }
    this.assignEpisodesToFiles(nextProps);
  }

  isSeasonIncluded(seasonName) {
    return this.state.includedSeasons.find(season =>
      season.name === seasonName) !== undefined;
  }

  isEpisodeIncluded(episodeName) {
    return this.state.includedSeasons.filter(season =>
      season.includedEpisodes.filter(episode =>
        episode === episodeName).length > 0).length > 0;
  }

  isWholeSeasonExcluded(seasonName) {
    return this.state.includedSeasons.find(s => s.name === seasonName) === undefined;
  }

  async handleSeasonChange(e, seasonName) {
    if (e.target.checked) {
      // include season
      await this.setState({
        includedSeasons: [
          ...this.state.includedSeasons.filter(s => s.name !== seasonName), {
            name: seasonName,
            includedEpisodes: this.props.seasons.find(s =>
              s.name === seasonName).episodes,
          },
        ],
      });
    } else {
      // exclude season
      await this.setState({
        includedSeasons: this.state.includedSeasons.filter(s => s.name !== seasonName),
      });
    }
    this.assignEpisodesToFiles(this.props);
  }

  async handleEpisodeChange(e, episodeName) {
    const season = this.props.seasons.find(season =>
      season.episodes.filter(episode =>
        episode === episodeName).length > 0);
    const includedSeason = this.state.includedSeasons.find(s =>
      s.name === season.name);
    let includedSeasons;

    if (e.target.checked) {
      // include episode
      includedSeasons = [
        ...this.state.includedSeasons.filter(s => s.name !== season.name), {
          name: includedSeason.name,
          includedEpisodes: [
            ...includedSeason.includedEpisodes,
            episodeName,
          ],
        }
      ];
    } else {
      // exclude episode
      includedSeasons = [
        ...this.state.includedSeasons.filter(s => s.name !== includedSeason.name), {
          name: includedSeason.name,
          includedEpisodes: includedSeason.includedEpisodes.filter(e => e !== episodeName),
        },
      ].filter(s => s.includedEpisodes.length > 0);
    }
    await this.setState({ includedSeasons });
    this.assignEpisodesToFiles(this.props);
  }

  assignEpisodesToFiles(props) {
    let excludedEpisodesCount = 0;
    this.setState({
      assignments: flatten(props.seasons.map(s => s.episodes)).map((e, i) => {
        let included = this.isEpisodeIncluded(e);
        if (!included) {
          excludedEpisodesCount++;
        }
        return {
          name: e,
          fileName: included ? props.files[i - excludedEpisodesCount] : undefined,
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
        <div className="section section--main">
          {this.props.seasons.length > 1 && <div className="button-row">
            <Button
              label="Include All"
              icon={<CheckboxCheckedIcon />}
              onClick={() => this.setState({ includedSeasons: this.props.seasons.map(s => ({
                name: s.name,
                includedEpisodes: s.episodes,
              }))})}
              disabled={
                JSON.stringify(this.state.includedSeasons.map(s => s.includedEpisodes)) ===
                JSON.stringify(this.props.seasons.map(s => s.episodes))
              }
            />
            <Button
              label="Exclude All"
              icon={<CheckboxUncheckedIcon />}
              onClick={() => this.setState({ includedSeasons: [] })}
              disabled={this.state.includedSeasons.length === 0}
            />
          </div>}
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
                    checked={this.isSeasonIncluded(s.name)}
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
                      'file-rename__item--included': this.isEpisodeIncluded(e),
                    })}>
                      <input
                        type="checkbox"
                        tabIndex={-1}
                        className="file-rename__item__checkbox"
                        checked={this.isEpisodeIncluded(e)}
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
        </div>
        <div className="section section--output">
          <div className="file-rename__output__dir">
            {((this.props.outputDir !== '?' && this.props.outputDir) || 'none (leave the files where they are)')
              .replace(/\{show_name\}/g, this.props.tvShow.name || '{show_name}')
              .replace(/[#%&<>\*\?$!'":@]/g, '')}
          </div>
          <Button
            className="file-rename__output__choose"
            label="Choose Output Dir"
            icon={<FolderIcon />}
            onClick={this.handleChooseOutputDir.bind(this)}
          />
          <Button
            className="file-rename__output__clear"
            type="delete"
            disabled={!this.props.outputDir || this.props.outputDir === '?'}
            icon={<CrossIcon />}
            onClick={this.props.onClearOutputDir}
          />
          <Button
            className="file-rename__rename-button"
            type="confirm"
            label="Rename"
            icon={<CheckmarkIcon />}
            onClick={this.renameFiles.bind(this)}
            disabled={this.state.assignments.filter(a => a.fileName).length === 0}
          />
        </div>
      </React.Fragment>
    );
  }
}
