import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
require("babel-polyfill");

import App from './app';
import i18n from './i18n/i18n';

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App/>
  </I18nextProvider>,
  document.getElementById('root')
);
