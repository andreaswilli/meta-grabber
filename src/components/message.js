import React, { Component } from 'react';
import classNames from 'classnames';

import CrossIcon from '../icons/cross.svg';
import CheckmarkIcon from '../icons/checkmark.svg';
import InfoIcon from '../icons/info.svg';
import WarningIcon from '../icons/warning.svg';
import ErrorIcon from '../icons/error.svg';

export default class Message extends Component {

  constructor(props) {
    super(props);

    this.state = {
      inAnimation: false,
      outAnimation: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        inAnimation: true,
      });
    }, 0);
    if (!this.props.message.autoDismiss) return;
    setTimeout(() => this.handleDismissMessage(this.props.message.id), this.props.message.autoDismiss);
  }

  componentDidUpdate() {
    if(this.props.message.willDismiss && !this.state.outAnimation) {
      this.handleDismissMessage(this.props.message.id);
    }
  }

  handleDismissMessage(id) {
    this.setState({
      outAnimation: true,
    });
    this.props.onDismissMessage(id);
  }

  render() {
    return (
      <div
        className={classNames('message', `message--${this.props.message.type}`, {
          'message--visible': this.state.inAnimation,
          'message--dismiss': this.state.outAnimation,
        })}
      >
        <div
          className={classNames('message', `message--${this.props.message.type}`, {
            'message--visible': this.state.inAnimation,
            'message--dismiss': this.state.outAnimation,
          })}
        >
          <div className="message__icon">
            {this.props.message.type === 'success' && <CheckmarkIcon />}
            {this.props.message.type === 'info' && <InfoIcon />}
            {this.props.message.type === 'warning' && <WarningIcon />}
            {this.props.message.type === 'error' && <ErrorIcon />}
          </div>
          <div className="message__text">{this.props.message.text}</div>
          {this.props.message.dismissable && (
            <div
              className="message__close"
              onClick={() => this.handleDismissMessage(this.props.message.id)}
            >
              <CrossIcon />
            </div>
          )}
        </div>
    );
  }
}
