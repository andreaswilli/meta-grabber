import React, { Component } from 'react';
import classNames from 'classnames';

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
    console.log('update', this.props.message.id, this.props.message.willDismiss);
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
        <div className="message__text">{this.props.message.text}</div>
        {this.props.message.dismissable && (
          <div
            className="message__close"
            onClick={() => this.handleDismissMessage(this.props.message.id)}
          >X</div>
        )}
      </div>
    );
  }
}
