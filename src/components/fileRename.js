import React, { Component } from 'react';

export default class FileRename extends Component {
  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Episode Name</th>
              <th>Old file name</th>
            </tr>
          </thead>
          <tbody>
            {(this.props.episodes || []).map((e, i) => (
              <tr key={e}>
                <td><input type="checkbox" /></td>
                <td>{e}</td>
                <td>{this.props.files[i] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
