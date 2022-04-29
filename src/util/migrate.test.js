import { migrateFileNameTemplate } from './migrate'

const func = migrateFileNameTemplate

describe('macOS / Linux', () => {
  test('move dynamic part to template', () => {
    const [dir, template] = func(
      '/Users/test/Desktop/{show_name}',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('/Users/test/Desktop/')
    expect(template).toBe(
      '{show_name}/S{season_no} E{episode_no} - {episode_name}'
    )
  })

  test('move subdirs of dynamic part to template', () => {
    const [dir, template] = func(
      '/Users/test/Desktop/{show_name}/subdir',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('/Users/test/Desktop/')
    expect(template).toBe(
      '{show_name}/subdir/S{season_no} E{episode_no} - {episode_name}'
    )
  })

  test('move dynamic part to template (partially dynamic)', () => {
    const [dir, template] = func(
      '/Users/test/Desktop/Show {show_name}',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('/Users/test/Desktop/')
    expect(template).toBe(
      'Show {show_name}/S{season_no} E{episode_no} - {episode_name}'
    )
  })

  test('move dynamic part to template (root)', () => {
    const [dir, template] = func(
      '/{show_name}',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('/')
    expect(template).toBe(
      '{show_name}/S{season_no} E{episode_no} - {episode_name}'
    )
  })

  test('do not do anything if no dynamic part', () => {
    const [dir, template] = func(
      '/Users/test/Desktop',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('/Users/test/Desktop/')
    expect(template).toBe('S{season_no} E{episode_no} - {episode_name}')
  })

  test('do not do anything if empty', () => {
    const [dir, template] = func(
      '',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('')
    expect(template).toBe('S{season_no} E{episode_no} - {episode_name}')
  })
})

describe('Windows', () => {
  test('move dynamic part to template', () => {
    const [dir, template] = func(
      'C:\\Users/test/Desktop/{show_name}',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('C:/Users/test/Desktop/')
    expect(template).toBe(
      '{show_name}/S{season_no} E{episode_no} - {episode_name}'
    )
  })

  test('move dynamic part to template (root)', () => {
    const [dir, template] = func(
      'C:/{show_name}',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('C:/')
    expect(template).toBe(
      '{show_name}/S{season_no} E{episode_no} - {episode_name}'
    )
  })

  test('do not do anything if no dynamic part', () => {
    const [dir, template] = func(
      'C:/Users/test/Desktop',
      'S{season_no} E{episode_no} - {episode_name}'
    )

    expect(dir).toBe('C:/Users/test/Desktop/')
    expect(template).toBe('S{season_no} E{episode_no} - {episode_name}')
  })
})
