export function getFileName(fileName) {
  if (!fileName) return fileName
  return fileName.split(/[\/\\]/).last()
}

export function getDir(fileName) {
  if (!fileName) return fileName
  return fileName
    .split(/[\/\\]/)
    .slice(0, -1)
    .join('/')
}

export function getFileExtension(fileName) {
  if (!fileName) return fileName
  return fileName.split('.').last()
}

export function formatEpisodeName(episode, tvShow, template) {
  return (template || 'missing template')
    .replace(/\{show_name\}/g, tvShow.name)
    .replace(/\{year\}/g, tvShow.first_air_date.substr(0, 4))
    .replace(/\{season_no\}/g, leftPad(episode.season_number, 2, 0))
    .replace(/\{episode_no\}/g, leftPad(episode.episode_number, 2, 0))
    .replace(/\{episode_name\}/g, episode.name || 'missing translation')
    .replace(/[#%&\{\}<>\*\?$!'":@]/g, '')
    .replace(/\\/g, '/')
}

function leftPad(string, length, char) {
  string = string + ''
  length = length - string.length
  if (length < 0) {
    return string
  }
  if (!char && char !== 0) {
    char = ' '
  }
  char = char + ''
  return char.repeat(length) + string
}
