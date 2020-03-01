import React from 'react'

import logo from '../assets/images/icon.svg'

const Header = props => (
  <header id="header" className="alt">
    <span className="logo">
      <img src={logo} alt="" />
    </span>
    <h1>Meta Grabber</h1>
    <p>
      A tool to grab metadata for tv shows and rename files on your hard disk.
    </p>
  </header>
)

export default Header
