import React, { Component } from 'react';

import { formatEpisodeName } from '../../util/format';

export default class NamingTemplate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      template: props.template,
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  handleChange(newTemplate) {
    this.setState({ template: newTemplate });

    if(this.isTemplateValid(newTemplate)) {
      this.props.onChange(newTemplate);
    }
  }

  isTemplateValid(newTemplate) {
    return newTemplate.match('{season_no}') && newTemplate.match('{episode_no}');
  }

  render() {
    return (
      <div>
        <input
          type="text"
          className="input"
          tabIndex={this.props.openState ? 0 : -1}
          value={this.state.template}
          onChange={event => this.handleChange(event.target.value)}
        />
        {!this.isTemplateValid(this.state.template) && <div className="settings-pane__setting__message error">
          The template has to contain <code>{'{season_no}'}</code> and <code>{'{episode_no}'}</code>, because file names have to be unique!
        </div>}
        {this.isTemplateValid(this.state.template) && <div className="settings-pane__setting__message">Example: {
          formatEpisodeName({
            season_number: 5,
            episode_number: 16,
            name: 'Felina',
          }, {
            name: 'Breaking Bad',
            first_air_date: '2008-01-20',
          }, this.state.template)
        }</div>}
      </div>
    );
  }
}
