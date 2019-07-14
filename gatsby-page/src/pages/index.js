import React from 'react'
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
        <Helmet title="Meta Grabber" />

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

          <section id="features" className="main special">
            <header className="major">
              <h2>Features</h2>
            </header>
            <ul className="features">
              <li>
                <span className="icon major style1 fa-tv"></span>
                <h3>Find Metadata</h3>
                <p>Search for tv shows and download metadata. The data is fetched either from <a target="_blank" rel="noopener noreferrer" href="https://www.themoviedb.org/">TheMovieDB</a> or <a target="_blank" rel="noopener noreferrer" href="https://www.thetvdb.com/">TheTVDB</a> depending on your settings.</p>
              </li>
              <li>
                <span className="icon major style3 fa-server"></span>
                <h3>Rename your Files</h3>
                <p>Rename the cryptically named files you downloaded to your hard drive. They can even be located on your NAS if it is mounted.</p>
              </li>
              <li>
                <span className="icon major style5 fa-language"></span>
                <h3>Multilingual</h3>
                <p>The user interface is available in English and German so far. The actual metadata can be downloaded in any available language, though.</p>
              </li>
            </ul>
          </section>

          <section id="demo" className="main special">
            <header className="major">
              <h2>Demo</h2>
            </header>
            <div className="image">
              <img alt="demo gif" src="https://user-images.githubusercontent.com/17298270/47755099-5f33b300-dc9d-11e8-9560-aca6a21527a9.gif" />
            </div>
          </section>

          <section id="about" className="main special">
            <header className="major">
              <h2>About this Project</h2>
            </header>
            <p>
              Meta Grabber is free, in fact, it's an open source project. The code is available on GitHub, please feel free to contribute.<br />
              If you want to report a bug or request a feature you can <a href="https://github.com/andreaswilli/meta-grabber/issues/new">open an issue</a> on GitHub.<br /><br />
              If you like this project you can buy me a coffee. Any donation is highly appreciated. ❤️
            </p>
            <footer className="major">
              <ul className="actions">
                <li><a
                  href="https://github.com/andreaswilli/meta-grabber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                ><span className="icon fa-github"></span> View on GitHub</a></li>
                <li><a
                  href="https://ko-fi.com/Y8Y7LBIM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                ><span className="icon fa-coffee"></span> Buy Me a Coffee</a></li>
              </ul>
            </footer>
          </section>

        </div>

      </Layout>
    )
  }
}

export default Index
