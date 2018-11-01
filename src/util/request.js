import axios from 'axios';

const tvDb = {
  baseUrl: 'https://api.thetvdb.com',
  apiKey: '69JBGM9TE7NT0LU7',
};

const movieDb = {
  baseUrl: 'http://api.themoviedb.org/3',
  apiKey: 'a7493504f75921f0d0f10f96d468d6cd',
};

const searchTvShow = makeRequestCreator();

export function getTvDbToken() {
  axios.post('https://api.thetvdb.com/login', {
    apikey: '69JBGM9TE7NT0LU7',
  }).then(response => {
    localStorage.setItem('tvDbToken', response.data.token);
  });
}

export function getLanguages() {
  return (makeRequestCreator())(localStorage.getItem('apiProvider') === 'moviedb' ? '/configuration/languages' : '/languages');
}

export async function search(query) {
  if (localStorage.getItem('apiProvider') === 'moviedb') {
    const response = await searchTvShow(`/search/tv?query=${query}`);
    return response.data.results;
  } else {
    // use tvdb api
    const response = await searchTvShow(`/search/series?name=${query}`);
    return response.data.data.map(result => ({
      id: result.id,
      name: result.seriesName,
      first_air_date: result.firstAired,
    }));
  }
}

export async function getTvShow(tvShow) {
  if (localStorage.getItem('apiProvider') === 'moviedb') {
    const response = await axios.get(getMovieDbUrl(`/tv/${tvShow.id}`));
    return Promise.all(response.data.seasons.map(async season => {
      const response = await axios.get(
        getMovieDbUrl(`/tv/${tvShow.id}/season/${season.season_number}`)
      );
      return response.data;
    }));
  } else {
    // use tvdb api
    const response = await (makeRequestCreator())(`/series/${tvShow.id}/episodes`);
    const seasons = response.data.data.reduce((acc, cur) => {
      const season = acc.find(s => s.season_number === cur.airedSeason) || {
        season_number: cur.airedSeason,
        name: `Season ${cur.airedSeason}`,
        episodes: [],
      };
      return [
        ...acc.filter(s => s.season_number !== cur.airedSeason), {
          ...season,
          episodes: [
            ...season.episodes, {
              season_number: cur.airedSeason,
              episode_number: cur.airedEpisodeNumber,
              name: cur.episodeName,
            }
          ],
        }
      ];
    }, []);
    return seasons.map(season => ({ ...season, episodes: season.episodes.sort((a, b) => a.episode_number - b.episode_number) }))
        .sort((a, b) => a.season_number - b.season_number);
  }
}

function makeRequestCreator() {
  var call;
  return function(url) {
    if (call) {
      call.cancel();
    }
    call = axios.CancelToken.source();

    if (localStorage.getItem('apiProvider') === 'moviedb') {
      return axios.get(getMovieDbUrl(url), { cancelToken: call.token });
    } else {
      // use tvdb api
      return axios.get(getTvDbUrl(url), {
        cancelToken: call.token,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tvDbToken')}`,
          'Accept-Language': localStorage.getItem('metaDataLang'),
        }
      });
    }
  }
}

function getMovieDbUrl(url) {
  return `${movieDb.baseUrl}${url}${url.match(/\?/) ? '&': '?'}api_key=${movieDb.apiKey
    }&language=${localStorage.getItem('metaDataLang')}`;
}

function getTvDbUrl(url) {
  return `${tvDb.baseUrl}${url}`;
}
