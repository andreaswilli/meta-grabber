const template = 'S{season_number} E{episode_number} - {episode_name}';

export function formatFileName(fileName) {
  if (!fileName) return fileName;
  return fileName.split('/').last();
}

export function formatFilePath(fileName) {
  if (!fileName) return fileName;
  return fileName.split('/').slice(0, -1).join('/');
}

export function formatFileExtension(fileName) {
  if (!fileName) return fileName;
  return fileName.split('.').last();
}

export function formatEpisodeName(episode, tvShow) {
  return template
    .replace(/\{tvshow_name\}/g, tvShow.name)
    .replace(/\{season_number\}/g, leftPad(episode.season_number, 2, 0))
    .replace(/\{episode_number\}/g, leftPad(episode.episode_number, 2, 0))
    .replace(/\{episode_name\}/g, episode.name);
}

function leftPad(string, length, char) {
  string = string + '';
  length = length - string.length;
  if (length < 0) {
    return string;
  }
  if (!char && char !== 0) {
    char = ' ';
  }
  char = char + '';
  return char.repeat(length) + string;
}
