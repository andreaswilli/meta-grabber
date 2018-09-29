import React, { Component } from 'react';
import classNames from 'classnames';
import Autocomplete from 'react-autocomplete';
import { remote } from 'electron';

import { makeRequestCreator } from '../../util/request';
import NamingTemplate from './namingTemplate';
import Link from '../../components/link';
import Button from '../../components/button';

export default class SettingsPane extends Component {

  constructor(props) {
    super(props);

    this.state = {
      languages: [],
      query: '',
    };
    this.loadLanguages();
  }

  async loadLanguages() {
    try {
      const response = await (makeRequestCreator())('/configuration/languages');
      this.setState({
        languages: response.data,
        query: (response.data.find(l => l.iso_639_1 === this.props.settings.metaDataLang) || {}).english_name,
      });
    } catch(e) {
      // TODO: error handling
    }
  }

  handleClose() {
    localStorage.setItem('metaDataLang', this.props.settings.metaDataLang);
    localStorage.setItem('template', this.props.settings.template);
    localStorage.setItem('defaultOutputDir', this.props.settings.defaultOutputDir);
    this.namingTemplate.setState({ template: this.props.settings.template }); // reset invalid template
    this.props.onOpenChange(false);
  }

  handleLanguageSelect(lang) {
    const language = this.state.languages.find(l => l.iso_639_1 === lang);
    this.setState({ query: language.english_name });
    this.handleSettingsChange('metaDataLang', language.iso_639_1);
  }

  handleSettingsChange(name, value) {
    this.props.onChange({
      ...this.props.settings,
      [name]: value,
    });
  }

  filterLanguages() {
    return this.state.languages.filter(l =>
      l.name.toLowerCase().match(this.state.query.toLowerCase())
      || l.english_name.toLowerCase().match(this.state.query.toLowerCase())
      || l.iso_639_1.toLowerCase().match(this.state.query.toLowerCase())
    )
  }

  async handleChooseOutputDir() {
    const outputDir = await remote.dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });
    if (!outputDir[0]) return;
    this.handleSettingsChange('defaultOutputDir', outputDir[0]);
  }

  render() {
    return (
      <div>
        <div className={classNames('settings-pane', {
          'settings-pane--hidden': !this.props.openState,
        })}>
          <div className="container">
            <h2>Settings</h2>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">Meta data language.</div>
              <Autocomplete
                wrapperStyle={{}}
                wrapperProps={{
                  className: 'tv-show-input__wrapper',
                }}
                inputProps={{
                  className: 'input',
                  placeholder: 'Choose language',
                  tabIndex: this.props.openState ? '0' : '-1',
                }}
                menuStyle={{
                  borderRadius: '2px',
                  color: getComputedStyle(document.documentElement).getPropertyValue('--color-autocomplete'),
                  backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-autocomplete'),
                  padding: '6px 0',
                  marginTop: '4px',
                  position: 'fixed',
                  overflow: 'auto',
                  maxHeight: '50%',
                  display: this.filterLanguages().length > 0 ? 'block' : 'none',
                  zIndex: 10,
                }}
                getItemValue={item => item.iso_639_1}
                items={this.filterLanguages()}
                renderItem={(item, isHighlighted) =>
                  <div key={item.iso_639_1} style={{
                    color: isHighlighted
                      ? getComputedStyle(document.documentElement).getPropertyValue('--color-autocomplete-selected')
                      : getComputedStyle(document.documentElement).getPropertyValue('--color-autocomplete'),
                    background: isHighlighted
                      ? getComputedStyle(document.documentElement).getPropertyValue('--color-bg-autocomplete-selected')
                      : getComputedStyle(document.documentElement).getPropertyValue('--color-bg-autocomplete'),
                    height: '14px',
                    padding: '12px',
                    lineHeight: '14px',
                  }}>
                    {item.english_name}
                  </div>
                }
                value={this.state.query}
                onChange={event => this.setState({ query: event.target.value })}
                onSelect={this.handleLanguageSelect.bind(this)}
              />
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">
                File name template (<Link
                  url="https://github.com/andreaswilli/meta-grabber#file-name-template"
                  label="help"
                />).</div>
              <NamingTemplate
                onRef={ref => this.namingTemplate = ref}
                onChange={template => this.handleSettingsChange('template', template)}
                template={this.props.settings.template}
                openState={this.props.openState}
              />
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">
                Default output directory.
              </div>
              <div className="settings-pane__setting__group">
                <input
                  type="text"
                  className="input"
                  value={this.props.settings.defaultOutputDir}
                  onChange={event => this.handleSettingsChange('defaultOutputDir', event.target.value)}
                  tabIndex={this.props.openState ? 0 : -1}
                />
                <Button
                  className="settings-pane__setting__group__button"
                  label="choose"
                  onClick={this.handleChooseOutputDir.bind(this)}
                />
              </div>
              <div className="settings-pane__setting__message">
                You can use <code>{'{show_name}'}</code> to dynamically include the name of the tv show.
              </div>
            </div>
          </div>
        </div>
        <div
          className={classNames('settings-backdrop', {
            'settings-backdrop--hidden': !this.props.openState,
          })}
          onClick={() => this.handleClose()}
        />
      </div>
    );
  }
}
