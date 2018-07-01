import axios from 'axios';

export const baseUrl = 'http://api.themoviedb.org/3';

export const apiKey = 'a7493504f75921f0d0f10f96d468d6cd';

export function makeRequestCreator() {
  var call;
  return function(url) {
    if (call) {
      call.cancel();
    }
    call = axios.CancelToken.source();
    return axios.get(url, { cancelToken: call.token });
  }
}
