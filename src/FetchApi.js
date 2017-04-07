import URI from 'urijs';

const getDefaultOptions = (data, method) => {
  let options = {
    method: (!method || method != 'raw') ? 'get' : method,
    headers: {}
  }

  if (method != 'raw') {
    options.headers.Accept = 'application/json';
  }

  if (data !== undefined) {
    options.body = JSON.stringify(data);
    options.headers['Content-Type'] = 'application/json';
  }

  return options;
}

const FetchApi = (base, addOptions, useTrailingSlashes) => {
  if (base === undefined) {
    base = "/"
  }
  if(addOptions === undefined) { addOptions = function() {}; }

  const _getUrl = (segments, query = [])  => {
    let uri = new URI(base);
    segments = segments || [];

    if(!(segments instanceof Array))
      segments = [segments]
    var segment;
    for(var i=0; i < segments.length; i++) {
      segment = segments[i].toString();
      uri = uri.segment(segment);
    }
    if(useTrailingSlashes && segment.indexOf('.') == -1)
      uri = uri.segment('');
    if(query)
      uri = uri.addSearch(query);
    return uri.toString();
  }

  const _getOptions = (data, method, url) => {
    var options = getDefaultOptions(data, method);
    addOptions(options, url);
    return options;
  }

  const _parseText = (response) => {
    return response.text();
  }

  const _parseJson = (response) => {
    if(response.status == 204)
      return;
    return response.json().then((json) => {
      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        var error = new Error(response.statusText);
        error.json = json;
        throw error;
      }
    });
  }

  const _request = (segments, query, data, method) => {
    var url = _getUrl(segments, query);
    var options = _getOptions(data, method, url);
    var raw = fetch(url, options);
    if(method == 'raw')
      return raw.then(_parseText);
    return raw.then(_parseJson);
  }

  const get = (segments, query) => {
    return _request(segments, query);
  }

  const rawGet = (segments, query) =>  {
    return _request(segments, query, undefined, 'raw')
  }

  const post = (segments, data, query) => {
    return _request(segments, query, data, 'post');
  }

  const put = (segments, data, query) => {
    return _request(segments, query, data, 'put');
  }

  const patch = (segments, data, query) => {
    return _request(segments, query, data, 'PATCH');
  }

  const del = (segments, query) => {
    return _request(segments, query, undefined, 'delete');
  }

  return {
    _getUrl: _getUrl,
    get: get,
    rawGet: rawGet,
    post: post,
    put: put,
    patch: patch,
    del: del
  }
}

export default FetchApi;