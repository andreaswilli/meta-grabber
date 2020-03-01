import React, { Component } from 'react'
import { shell } from 'electron'

export default class Link extends Component {
  render() {
    return (
      <span className="link" onClick={() => shell.openExternal(this.props.url)}>
        {this.props.label}
        {this.props.children}
      </span>
    )
  }
}
