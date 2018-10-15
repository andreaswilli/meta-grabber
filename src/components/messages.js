import React, { Component } from 'react';
import Message from './message';

export default class Messages extends Component {

  handleDismissMessage(id) {
    setTimeout(() => {
      this.props.onMessagesUpdate(this.props.messages.filter(m => m.id !== id));
    }, 700);
  }

  render () {
    return (
      <div>
        {this.props.messages.map(m => (
          <Message
            key={m.id}
            message={m}
            onDismissMessage={id => this.handleDismissMessage(id)}
          />
        ))}
      </div>
    );
  }
}
