import React, { Component } from 'react';
import classNames from 'classnames';

export default class Message extends Component {

  dismissMessage(index) {
    this.props.onMessagesUpdate(this.props.messages.filter((_, i) => i !== index));
  }

  render() {
    return (
      <div>
        {(this.props.messages || []).map((m, i) => (
          <div
            key={i}
            className={classNames('message', `message--${m.type}`)}
          >
            <div className="message__text">{m.text}</div>
            {m.dismissable && (
              <div
                className="message__close"
                onClick={() => this.dismissMessage(i)}
              >X</div>
            )}
            {(() => {
              if (!m.autoDismiss) return;
              setTimeout(() => this.dismissMessage(i), m.autoDismiss);
            })()}
          </div>
        ))}
      </div>
    );
  }
}
