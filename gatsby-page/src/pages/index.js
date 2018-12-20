import React from 'react'
import { Link } from 'gatsby'
import Helmet from 'react-helmet'
import Waypoint from 'react-waypoint'

import Layout from '../components/layout'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Download from '../components/Download'

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stickyNav: false
    }
  }

  _handleWaypointEnter= () => {
    this.setState(() => ({ stickyNav: false }));
  }

  _handleWaypointLeave = () => {
    this.setState(() => ({ stickyNav: true }));
  }

  render() {

    return (
      <Layout>
        <Helmet title="Gatsby Starter - Stellar" />

        <Header />

        <Waypoint
          onEnter={this._handleWaypointEnter}
          onLeave={this._handleWaypointLeave}
        >
        </Waypoint>
        <Nav sticky={this.state.stickyNav} />

        <div id="main">

          <section id="download" className="main special">
            <header className="major">
              <h2>Download</h2>
            </header>
            <Download userName="andreaswilli" repoName="meta-grabber" />
          </section>

          <section id="demo" className="main special">
            <header className="major">
              <h2>Demo</h2>
            </header>
            <div className="image">
              <img src="https://user-images.githubusercontent.com/17298270/47755099-5f33b300-dc9d-11e8-9560-aca6a21527a9.gif" />
            </div>
          </section>


        </div>

      </Layout>
    )
  }
}

export default Index
