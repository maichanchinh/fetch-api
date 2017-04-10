'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getDefaultOptions = function getDefaultOptions(data, method) {
  var options = {
    method: !method || method != 'raw' ? 'get' : method,
    headers: {}
  };

  if (method != 'raw') {
    options.headers.Accept = 'application/json';
  }

  if (data !== undefined) {
    options.body = JSON.stringify(data);
    options.headers['Content-Type'] = 'application/json';
  }

  return options;
};

var FetchApi = function FetchApi(base, addOptions, useTrailingSlashes) {
  if (base === undefined) {
    base = "/";
  }
  if (addOptions === undefined) {
    addOptions = function addOptions() {};
  }

  var _getUrl = function _getUrl(segments) {
    var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var uri = new _urijs2.default(base);
    segments = segments || [];

    if (!(segments instanceof Array)) segments = [segments];
    var segment;
    for (var i = 0; i < segments.length; i++) {
      segment = segments[i].toString();
      uri = uri.segment(segment);
    }
    if (useTrailingSlashes && segment.indexOf('.') == -1) uri = uri.segment('');
    if (query) uri = uri.addSearch(query);
    return uri.toString();
  };

  var _getOptions = function _getOptions(data, method, url) {
    var options = getDefaultOptions(data, method);
    addOptions(options, url);
    return options;
  };

  var _parseText = function _parseText(response) {
    return response.text();
  };

  var _parseJson = function _parseJson(response) {
    if (response.status == 204) return;
    return response.json().then(function (json) {
      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        var error = new Error(response.statusText);
        error.json = json;
        throw error;
      }
    });
  };

  var _request = function _request(segments, query, data, method) {
    var url = _getUrl(segments, query);
    var options = _getOptions(data, method, url);
    var raw = fetch(url, options);
    if (method == 'raw') return raw.then(_parseText);
    return raw.then(_parseJson);
  };

  var get = function get(segments, query) {
    return _request(segments, query);
  };

  var rawGet = function rawGet(segments, query) {
    return _request(segments, query, undefined, 'raw');
  };

  var post = function post(segments, data, query) {
    return _request(segments, query, data, 'post');
  };

  var put = function put(segments, data, query) {
    return _request(segments, query, data, 'put');
  };

  var patch = function patch(segments, data, query) {
    return _request(segments, query, data, 'PATCH');
  };

  var del = function del(segments, query) {
    return _request(segments, query, undefined, 'delete');
  };

  return {
    _getUrl: _getUrl,
    get: get,
    rawGet: rawGet,
    post: post,
    put: put,
    patch: patch,
    del: del
  };
};

exports.default = FetchApi;