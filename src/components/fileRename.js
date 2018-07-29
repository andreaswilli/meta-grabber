import React, { Component } from 'react';

export default class FileRename extends Component {
  render() {
    return (
      <div>
        {(this.props.seasons || []).map(s => (
          <div key={s.name}>
            <label className="pre"><input type="checkbox" />{s.name}</label>
            {s.episodes.map(e => (
              <div key={e}>
                <label className="pre"><input type="checkbox" />{e}</label>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
