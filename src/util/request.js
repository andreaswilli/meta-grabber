import axios from 'axios';

export function makeRequestCreator() {
  const baseUrl = 'http://api.themoviedb.org/3';
  const apiKey = 'a7493504f75921f0d0f10f96d468d6cd';

  var call;
  return function(url) {
    if (call) {
      call.cancel();
    }
    const fullUrl = `${baseUrl}${url}${url.match(/\?/) ? '&': '?'}api_key=${apiKey}`;
    call = axios.CancelToken.source();
    return axios.get(fullUrl, { cancelToken: call.token });
  }
}
