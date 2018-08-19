import React, { Component } from 'react';
import axios from 'axios';
import Autocomplete from 'react-autocomplete';

import { makeRequestCreator, baseUrl, apiKey } from '../util/request';

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
        `${baseUrl}/search/tv?api_key=${apiKey}&language=de&query=${query}`
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
      <div>
        <Autocomplete
          getItemValue={(item) => item.name}
          items={this.state.results}
          renderItem={(item, isHighlighted) =>
            <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              {item.name} ({item.first_air_date.substr(0,4)})
            </div>
          }
          value={this.props.query}
          onChange={this.handleChange.bind(this)}
          onSelect={this.handleSelect.bind(this)}
        />
        <button onClick={this.clearInput.bind(this)}>clear</button>
      </div>
    );
  }
}
