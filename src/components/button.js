import React, { Component } from 'react'
import classNames from 'classnames'

export default class Button extends Component {
  render() {
    return (
      <button
        data-test-id={this.props.testId}
        className={classNames('button', this.props.className, {
          'button--disabled': this.props.disabled,
          'button--delete': this.props.type === 'delete',
          'button--confirm': this.props.type === 'confirm',
          'button--icon-right': this.props.iconRight,
        })}
        disabled={this.props.disabled}
        onClick={!this.props.disabled ? this.props.onClick : undefined}
      >
        {this.props.icon}
        {this.props.label && (
          <div className="button__label">{this.props.label}</div>
        )}
      </button>
    )
  }
}
