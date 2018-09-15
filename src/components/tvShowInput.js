import React, { Component } from 'react';
import axios from 'axios';
import Autocomplete from 'react-autocomplete';

import Button from './button';
import { makeRequestCreator } from '../util/request';

export default class TvShowInput extends Component {

  constructor(props) {
    super(props);

    this.get = makeRequestCreator();

    this.state = {
      results: [],
    };
  }

  async search(query) {
    try {
      const response = await this.get(
        `/search/tv?language=${this.props.metaDataLang}&query=${query}`
      );
      this.setState({ results: response.data.results });
    } catch(e) {
      if (axios.isCancel(e)) {
        // ignore canceled request
      } else {
        // TODO: error handling
      };
    }
  }

  handleChange({ target: { value: query } }) {
    this.props.onChange(query);

    if (!query || query.trim().length < 3) {
      this.setState({ results: [] });
      this.props.onSelect({ id: null });
      return;
    }
    this.search(query.trim());
  }

  handleSelect(query, tvShowItem) {
    this.props.onChange(query);
    this.props.onSelect(tvShowItem);
  }

  clearInput() {
    this.props.onChange('');
    this.props.onSelect({ id: null });
    this.setState({ results: [] });
  }

  render () {
    return (
      <div className="tv-show-input">
        <Autocomplete
          wrapperStyle={{}}
          wrapperProps={{
            className: 'tv-show-input__wrapper',
          }}
          inputProps={{
            className: 'input',
            placeholder: 'Search TV show...',
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
            display: this.state.results.length > 0 ? 'block' : 'none',
            zIndex: 10,
          }}
          getItemValue={(item) => item.name}
          items={this.state.results}
          renderItem={(item, isHighlighted) =>
            <div key={item.id} style={{
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
              {item.name} ({item.first_air_date.substr(0, 4)})
            </div>
          }
          value={this.props.query}
          onChange={this.handleChange.bind(this)}
          onSelect={this.handleSelect.bind(this)}
        />
        <Button
          className="tv-show-input__clear"
          type="delete"
          disabled={!this.props.query}
          label="X"
          onClick={this.clearInput.bind(this)}
        />
      </div>
    );
  }
}
