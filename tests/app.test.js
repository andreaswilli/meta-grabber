const regeneratorRuntime = require('regenerator-runtime')
import ElectronTest from './setupElectronTests'

const timeout = 20000
const electronTest = new ElectronTest({ timeout })

let page

jest.setTimeout(timeout)

beforeAll(async () => {
  page = await electronTest.createPage()
})

afterAll(async () => electronTest.destroyPage())

describe('Home', () => {
  test('show initial instructions in snackbar', async () => {
    await page.waitForSelector('.message__text')
    const message = await page.$eval('.message__text', (el) => el.innerText)
    expect(message).toBe(
      'Please search for a TV show and open the files you want to rename.'
    )
  })
})
