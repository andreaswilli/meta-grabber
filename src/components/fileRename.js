import React, { Component } from 'react';

export default class FileRename extends Component {

  constructor(props) {
    super(props);

    this.state = {
      excludedSeasons: [],
    };
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

  handleSeasonChange(e, seasonName) {
    if (e.target.checked) {
      // include season
      this.setState({
        excludedSeasons: this.state.excludedSeasons.filter(s => s.name !== seasonName),
      });
    } else {
      // exclude season
      this.setState({
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
  }

  handleEpisodeChange(e, episodeName) {
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
      this.setState({ excludedSeasons });
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
      this.setState({ excludedSeasons });
    }
  }

  render() {
    return (
      <div>
        {(this.props.seasons || []).map(s => (
          <div key={s.name}>
            <label className="pre">
              <input
                type="checkbox"
                checked={!this.isSeasonExcluded(s.name)}
                onChange={event => this.handleSeasonChange(event, s.name)}
              />
              {s.name}
            </label>
            {s.episodes.map(e => (
              <div key={e}>
                <label className="pre offset">
                  <input
                    type="checkbox"
                    checked={!this.isEpisodeExcluded(e)}
                    onChange={event => this.handleEpisodeChange(event, e)}
                  />
                  {e}
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
