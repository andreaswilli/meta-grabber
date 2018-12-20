import React from 'react'
import Scrollspy from 'react-scrollspy'
import Scroll from './Scroll'

const Nav = (props) => (
    <nav id="nav" className={props.sticky ? 'alt' : ''}>
        <Scrollspy items={ ['download', 'features', 'demo', 'about'] } currentClassName="is-active" offset={-300}>
            <li>
                <Scroll type="id" element="download">
                    <a href="#download">Download</a>
                </Scroll>
            </li>
            <li>
                <Scroll type="id" element="features">
                    <a href="#features">Features</a>
                </Scroll>
            </li>
            <li>
                <Scroll type="id" element="demo">
                    <a href="#demo">Demo</a>
                </Scroll>
            </li>
            <li>
                <Scroll type="id" element="about">
                    <a href="#demo">About this Project</a>
                </Scroll>
            </li>
        </Scrollspy>
    </nav>
)

export default Nav
