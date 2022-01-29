const electron = require('electron')
const puppeteer = require('puppeteer-core')
const kill = require('tree-kill')
const { spawn } = require('child_process')
const regeneratorRuntime = require('regenerator-runtime')

// test set up from here: https://github.com/peterdanis/electron-puppeteer-demo
export default function ElectronTest({ timeout, port = 9200 }) {
  let pid
  let page

  async function createPage() {
    const startTime = Date.now()
    let browser

    // Start Electron with custom debugging port
    pid = spawn(electron, ['.', `--remote-debugging-port=${port}`], {
      shell: true,
    }).pid

    // Wait for Puppeteer to connect
    while (!browser) {
      try {
        browser = await puppeteer.connect({
          browserURL: `http://localhost:${port}`,
          defaultViewport: { width: 900, height: 672 },
        })
        ;[page] = await browser.pages()
      } catch (error) {
        if (Date.now() > startTime + timeout) {
          throw error
        }
      }
    }
    return page
  }

  async function destroyPage() {
    try {
      await page.close()
    } catch (error) {
      kill(pid)
    }
  }

  return {
    createPage,
    destroyPage,
  }
}
