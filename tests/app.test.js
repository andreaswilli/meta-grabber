import regeneratorRuntime from 'regenerator-runtime'
import fs from 'fs/promises'
import ElectronTest from './setupElectronTests'

const timeout = 20000
const electronTest = new ElectronTest({ timeout })
const TEST_FILE_DIR = './tmp'
const NO_OF_FILES = 7

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
    // create files
    await fs.mkdir(TEST_FILE_DIR, { recursive: true })
    await createMkvFiles()

    // TODO: open files

    // choose tv show
    await page.type('[data-test-id=input-tv-show]', 'breaking bad')
    await page.waitForSelector('.tv-show-input__wrapper > div > div')
    await expectText(
      '.tv-show-input__wrapper > div > div',
      'Breaking Bad (2008)'
    )
    await page.click('.tv-show-input__wrapper > div > div')
    await page.waitForSelector('.file-rename__item__label')
    await expectText('.file-rename__item__label', 'SEASON 0')

    // TODO: choose season

    // TODO: rename files
    const files = await fs.readdir(TEST_FILE_DIR)
    expect(files).toContain('bb.1x01.mkv')
    // expect(files).toContain('S01 E01 - Pilot.mkv')
    // expect(files).toContain('S01 E02 - Cats in the bag....mkv')
    // expect(files).toContain('S01 E03 - ...And the Bags in the River.mkv')
    // expect(files).toContain('S01 E04 - Cancer Man.mkv')
    // expect(files).toContain('S01 E05 - Gray Matter.mkv')
    // expect(files).toContain('S01 E06 - Crazy Hanful of Nothin.mkv')
    // expect(files).toContain('S01 E07 - A No-Rough-Stuff-Type Deal.mkv')

    // delete files
    await fs.rm(TEST_FILE_DIR, { recursive: true })
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

async function createMkvFiles() {
  for (let i = 1; i <= NO_OF_FILES; i++) {
    await fs.writeFile(`${TEST_FILE_DIR}/bb.1x0${i}.mkv`, '')
  }
}

async function createMkvSampleFiles() {
  for (let i = 1; i <= NO_OF_FILES; i++) {
    await fs.writeFile(`${TEST_FILE_DIR}/bb.1x0${i}-sample.mkv`, '')
  }
}

async function expectMkvSampleFiles(actualFiles) {
  for (let i = 1; i <= NO_OF_FILES; i++) {
    expect(actualFiles).toContain(`bb.1x0${i}-sample.mkv`)
  }
}
