import React, { Component } from 'react';
import classNames from 'classnames';

export default class Message extends Component {

  dismissMessage(id) {
    this.props.onMessagesUpdate(this.props.messages.filter(m => m.id !== id));
  }

  render() {
    return (
      <div>
        {(this.props.messages || []).map(m => (
          <div
            key={m.id}
            className={classNames('message', `message--${m.type}`)}
          >
            <div className="message__text">{m.text}</div>
            {m.dismissable && (
              <div
                className="message__close"
                onClick={() => this.dismissMessage(m.id)}
              >X</div>
            )}
            {(() => {
              if (!m.autoDismiss) return;
              setTimeout(() => this.dismissMessage(m.id), m.autoDismiss);
            })()}
          </div>
        ))}
      </div>
    );
  }
}
