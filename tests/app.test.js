const regeneratorRuntime = require('regenerator-runtime')
import ElectronTest from './setupElectronTests'

const timeout = 20000
const electronTest = new ElectronTest({ timeout })

let page

jest.setTimeout(timeout)

beforeAll(async () => {
  page = await electronTest.createPage()
  await loadDefaultSettings()
  await page.reload()
})

afterAll(async () => electronTest.destroyPage())

describe('Home', () => {
  test('show initial instructions in snackbar', async () => {
    await expectText(
      '.message__text',
      'Please search for a TV show and open the files you want to rename.'
    )
  })

  test('rename files', async () => {
    // TODO: create files
    // TODO: open files

    // choose tv show
    await page.type('[data-test-id=input-tv-show]', 'breaking bad')
    await expectText(
      '.tv-show-input__wrapper > div > div',
      'Breaking Bad (2008)'
    )
    await page.waitForSelector('.tv-show-input__wrapper > div > div')
    await page.click('.tv-show-input__wrapper > div > div')
    await expectText('.file-rename__item__label', 'SEASON 0')

    // TODO: choose season
    // TODO: rename files
    // TODO: delete files
  })
})

describe('Settings', () => {
  test('change ui language', async () => {
    await page.click('.settings-button')
    await wait(400) // css transition
    await expectText('h2', 'Settings')
    await page.click('[data-test-id=button-ui-lang-de]')
    await expectText('h2', 'Einstellungen')
    await page.click('[data-test-id=button-ui-lang-ch]')
    await expectText('h2', 'Istellige')
    await page.click('[data-test-id=button-ui-lang-en]')
    await expectText('h2', 'Settings')
  })
})

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

async function loadDefaultSettings() {
  await page.evaluate(() => {
    localStorage.setItem('uiLang', 'en')
    localStorage.setItem('apiProvider', 'tvdb')
    // TODO: set rest of localstorge to default values
  })
}

async function expectText(selector, expectedText) {
  const actualText = await page.$eval(selector, (el) => el.innerText)
  expect(actualText).toBe(expectedText)
}
