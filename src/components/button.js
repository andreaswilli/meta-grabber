import React, { Component } from 'react';
import classNames from 'classnames';

export default class Button extends Component {
  render () {
    return (
      <div
        className={classNames('button', this.props.className, {
          'button--disabled': this.props.disabled,
        })}
        onClick={!this.props.disabled && this.props.onClick}
      >{this.props.label}</div>
    );
  }
}
