import React from 'react'
import axios from 'axios'

class Download extends React.Component {

  constructor(props) {
    super(props)

    const { userName, repoName } = props

    this.state = {
      latestReleaseUrl: `https://github.com/${userName}/${repoName}/releases/latest`,
      allReleasesUrl: `https://github.com/${userName}/${repoName}/releases`,
      links: {}
    }

    this.getLatestRelease()
  }

  getLatestRelease() {
    const { userName, repoName } = this.props
    axios.get(`https://api.github.com/repos/${userName}/${repoName}/releases/latest`).then(response => {
      this.setState({
        version: response.data.tag_name,
        links: {
          macos: response.data.assets.find(a => a.name.indexOf('.dmg') !== -1).browser_download_url,
          windows: response.data.assets.find(a => a.name.indexOf('.exe') !== -1).browser_download_url,
          linux: response.data.assets.find(a => a.name.indexOf('.AppImage') !== -1).browser_download_url
        }
      })
    })
  }

  render() {
    const { latestReleaseUrl, allReleasesUrl, links } = this.state

    return (
      <>
        <p>Download {this.state.version || 'the latest version'} for your operating system.</p>
        <footer className="major">
          <ul className="actions">
            <li><a
              href={links.windows || latestReleaseUrl}
              className="button"
            ><span className="icon fa-windows"></span> Windows</a></li>
            <li><a
              href={links.macos || latestReleaseUrl}
              className="button"
            ><span className="icon fa-apple"></span> macOS</a></li>
            <li><a
              href={links.linux || latestReleaseUrl}
              className="button"
            ><span className="icon fa-linux"></span> Linux</a></li>
          </ul>
          <p>You can also view <a href={allReleasesUrl}>all releases</a> of Meta Grabber.</p>
        </footer>
      </>
    )
  }
}

export default Download
