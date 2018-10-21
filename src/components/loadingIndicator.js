import React, { Component } from 'react';
import classNames from 'classnames';

import LoadingAnimation from '../icons/loadingAnimation.svg';

export default class LoadingIndicator extends Component {
  render() {
    return (
      <div className={classNames('loading__backdrop', {
        'loading__backdrop--hidden': this.props.hidden,
      })}>
        <LoadingAnimation />
      </div>
    );
  }
}
