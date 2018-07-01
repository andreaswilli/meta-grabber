import React, { Component } from 'react';
import axios from 'axios';
import { remote } from 'electron';
import Autocomplete from 'react-autocomplete';

export default class App extends Component {

  constructor() {
    super();

    this.baseUrl = 'http://api.themoviedb.org/3';
    this.apiKey = 'a7493504f75921f0d0f10f96d468d6cd';

    this.get = this.makeRequestCreator();

    this.state = {
      results: [],
      query: '',
      files: [],
      selectedTVShow: null,
    };
  }

  makeRequestCreator() {
    var call;
    return function(url) {
      if (call) {
        call.cancel();
      }
      call = axios.CancelToken.source();
      return axios.get(url, { cancelToken: call.token });
    }
  }

  async search(query) {
    if (!query || query.length < 3) {
      this.setState({
        results: [],
        selectedTVShow: null,
      });
      return;
    }

    try {
      const response = await this.get(`${this.baseUrl}/search/tv?api_key=${
        this.apiKey}&language=de&query=${query}`);
      this.setState({
        results: response.data.results,
      });
    } catch(e) {
      if (axios.isCancel(e)) return;
      console.log(e);
    }
  }

  handleChange(e) {
    this.setState({
      query: e.target.value,
    });
    this.search(e.target.value);
  }

  handleSelect(query, item) {
    this.setState({
      query,
      selectedTVShow: item.id,
    });
  }

  async open() {
    const files = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections', 'createDirectory'],
    });
    if (!files) return;
    this.setState({
      files,
    });
  }

  render () {
    return (
      <div>
        <h1>Title</h1>
        <button onClick={this.open.bind(this)}>open</button>
        <Autocomplete
          getItemValue={(item) => item.name}
          items={this.state.results}
          renderItem={(item, isHighlighted) =>
            <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              {item.name} ({item.first_air_date.substr(0,4)})
            </div>
          }
          value={this.state.query}
          onChange={this.handleChange.bind(this)}
          onSelect={this.handleSelect.bind(this)}
        />
        <ul>
        {this.state.files.map(f => <li key={f}>{f}</li>)}
        </ul>
      </div>
    );
  }
}
