import React, { Component } from 'react';
import classNames from 'classnames';
import { remote } from 'electron';
import i18n from 'i18next';
import { withNamespaces, Trans } from 'react-i18next';

import { getLanguages } from '../../util/request';
import NamingTemplate from './namingTemplate';
import Link from '../../components/link';
import Button from '../../components/button';
import Autocomplete from '../../components/autocomplete';

import FolderIcon from '../../icons/folder.svg';

class SettingsPane extends Component {

  constructor(props) {
    super(props);

    this.apiProviders = [{
      name: 'TheMovieDB',
      value: 'moviedb'
    }, {
      name: 'TheTVDB',
      value: 'tvdb'
    }];

    this.state = {
      languages: [],
      query: '',
      apiProvider: props.settings.apiProvider,
    };
    this.loadLanguages(props.settings.apiProvider);
  }

  async loadLanguages(apiProvider) {
    try {
      const languages = await getLanguages(apiProvider);
      this.setState({
        languages,
        query: (languages.find(l => l.iso_639_1 === this.props.settings.metaDataLang) || {}).english_name || '',
      });
    } catch(e) {
      // ignore
      console.error(e);
    }
  }

  handleClose() {
    localStorage.setItem('uiLang', this.props.settings.uiLang),
    localStorage.setItem('metaDataLang', this.props.settings.metaDataLang || '(empty)');
    localStorage.setItem('apiProvider', this.props.settings.apiProvider);
    localStorage.setItem('template', this.props.settings.template || '(empty)');
    localStorage.setItem('defaultOutputDir', this.props.settings.defaultOutputDir || '(empty)');
    localStorage.setItem('includedExtensions', (this.props.settings.includedExtensions.filter(ext => ext).length > 0 && this.props.settings.includedExtensions) || '(empty)');
    localStorage.setItem('excludedTerms', (this.props.settings.excludedTerms.filter(term => term).length > 0 && this.props.settings.excludedTerms) || '(empty)');
    this.namingTemplate.setState({ template: this.props.settings.template }); // reset invalid template
    this.props.onOpenChange(false);
  }

  handleUiLanguageSelect(lang) {
    this.handleSettingsChange('uiLang', lang);
    i18n.changeLanguage(lang);
  }

  handleLanguageSelect(lang) {
    const language = this.state.languages.find(l => l.iso_639_1 === lang);
    this.setState({ query: language.english_name });
    this.handleSettingsChange('metaDataLang', language.iso_639_1);
  }

  handleApiProviderSelect(apiProvider) {
    this.setState({ apiProvider });
    this.handleSettingsChange('apiProvider', apiProvider);
    this.loadLanguages(apiProvider);
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
    const { t } = this.props;
    return (
      <div>
        <div className={classNames('settings-pane', {
          'settings-pane--hidden': !this.props.openState,
        })}>
          <div className="container settings-pane__container">
            <h2>{t('heading')}</h2>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">{t('uiLang.title')}</div>
              <Button
                className="settings-pane__setting__group__button"
                label={t('uiLang.de')}
                onClick={() => this.handleUiLanguageSelect('de')}
              />
              <Button
                className="settings-pane__setting__group__button"
                label={t('uiLang.en')}
                onClick={() => this.handleUiLanguageSelect('en')}
              />
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">{t('metaLang.title')}</div>
              <Autocomplete
                placeholder={t('metaLang.placeholder')}
                focusable={this.props.openState}
                onChange={event => this.setState({ query: event.target.value })}
                onSelect={this.handleLanguageSelect.bind(this)}
                onBlur={() => this.handleLanguageSelect(this.props.settings.metaDataLang)}
                items={this.filterLanguages()}
                getItemValue={item => item.iso_639_1}
                getItemKey={item => item.iso_639_1}
                getDisplayValue={item => item.english_name}
                value={this.state.query}
                showDropdown={this.filterLanguages().length > 0}
              />
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">{t('metadataProvider.title')}</div>
              <Autocomplete
                placeholder={t('metadataProvider.placeholder')}
                focusable={this.props.openState}
                onSelect={this.handleApiProviderSelect.bind(this)}
                items={this.apiProviders}
                getItemValue={item => item.value}
                getItemKey={item => item.value}
                getDisplayValue={item => item.name}
                value={this.apiProviders.find(p => p.value === this.props.settings.apiProvider).name}
                showDropdown={true}
              />
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">
                <Trans i18nKey="fileNameTemplate.title">
                  <Link
                    url="https://github.com/andreaswilli/meta-grabber#file-name-template"
                    label={t('fileNameTemplate.help')}
                  />
                </Trans>
              </div>
              <NamingTemplate
                onRef={ref => this.namingTemplate = ref}
                onChange={template => this.handleSettingsChange('template', template)}
                template={this.props.settings.template}
                openState={this.props.openState}
              />
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">
                {t('defaultOutputDir.title')}
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
                  label={t('defaultOutputDir.choose')}
                  icon={<FolderIcon />}
                  onClick={this.handleChooseOutputDir.bind(this)}
                />
              </div>
              <div className="settings-pane__setting__message">
                <Trans i18nKey="defaultOutputDir.hint">
                  <code>{'{show_name}'}</code>
                </Trans>
              </div>
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">
                {t('includedFileTypes.title')}
              </div>
              <input
                type="text"
                className="input"
                value={this.props.settings.includedExtensions}
                onChange={event => this.handleSettingsChange('includedExtensions', event.target.value
                  .split(',').map(ext => ext.trim()))}
                tabIndex={this.props.openState ? 0 : -1}
              />
              <div className="settings-pane__setting__message">
                {t('includedFileTypes.hint')}
              </div>
            </div>
            <div className="settings-pane__setting">
              <div className="settings-pane__setting__label">
                {t('excludedTerms.title')}
              </div>
              <input
                type="text"
                className="input"
                value={this.props.settings.excludedTerms}
                onChange={event => this.handleSettingsChange('excludedTerms', event.target.value
                  .split(',').map(term => term.trim()))}
                tabIndex={this.props.openState ? 0 : -1}
              />
              <div className="settings-pane__setting__message">
                {t('excludedTerms.hint')}
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

export default withNamespaces('settingsPane')(SettingsPane);
