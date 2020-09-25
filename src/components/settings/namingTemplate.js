import React, { Component } from 'react'
import { withTranslation, Trans } from 'react-i18next'

import { formatEpisodeName } from '../../util/format'

class NamingTemplate extends Component {
  constructor(props) {
    super(props)

    this.state = {
      template: props.template,
    }
  }

  componentDidMount() {
    this.props.onRef(this)
  }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  handleChange(newTemplate) {
    this.setState({ template: newTemplate })

    if (this.isTemplateValid(newTemplate)) {
      this.props.onChange(newTemplate)
    }
  }

  isTemplateValid(newTemplate) {
    return newTemplate.match('{season_no}') && newTemplate.match('{episode_no}')
  }

  render() {
    const { t } = this.props
    return (
      <div>
        <input
          type="text"
          className="input"
          tabIndex={this.props.openState ? 0 : -1}
          value={this.state.template}
          onChange={event => this.handleChange(event.target.value)}
        />
        {!this.isTemplateValid(this.state.template) && (
          <div className="settings-pane__setting__message error">
            <Trans i18nKey="fileNameTemplate.errorInvalidTemplate" t={t}>
              <code>{'{season_no}'}</code>
              <code>{'{episode_no}'}</code>
            </Trans>
          </div>
        )}
        {this.isTemplateValid(this.state.template) && (
          <div className="settings-pane__setting__message">
            {t('fileNameTemplate.hint', {
              example: formatEpisodeName(
                {
                  season_number: 5,
                  episode_number: 16,
                  name: t('fileNameTemplate.episodeExampleName'),
                },
                {
                  name: t('fileNameTemplate.tvShowExampleName'),
                  first_air_date: '2008-01-20',
                },
                this.state.template
              ),
            })}
          </div>
        )}
      </div>
    )
  }
}

export default withTranslation('settingsPane')(NamingTemplate)
