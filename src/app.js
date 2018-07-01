import React, { Component } from 'react';
import axios from 'axios';
import { remote } from 'electron';

export default class App extends Component {

  constructor() {
    super();

    this.baseUrl = 'http://api.themoviedb.org/3';
    this.apiKey = 'a7493504f75921f0d0f10f96d468d6cd';
    
    this.state = {
      results: [],
      query: '',
      files: [],
    };
  }

  async search(e) {
    e.preventDefault();
    if (!this.state.query || this.state.query.length < 3) return;

    const response = await axios.get(`${this.baseUrl}/search/tv?api_key=${
      this.apiKey}&language=de&query=${this.state.query}`);
    this.setState({
      results: response.data.results,
    });
  }

  async open() {
    const files = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections', 'createDirectory'],
      message: 'hi',
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
        <form onSubmit={this.search.bind(this)}>
          <input
            onChange={(e) => {
              this.setState({
                query: e.target.value
              });
            }}
            value={this.state.query} />
        </form>
        <br />
        {this.state.query}
        <br />
        <ul>
          {this.state.results.map(
            r => <li key={r.id}>{r.name} ({r.first_air_date.substr(0,4)})</li>
          )}
        </ul>
        <ul>
          {this.state.files.map(f => <li key={f}>{f}</li>)}
        </ul>
      </div>
    );
  }
}
