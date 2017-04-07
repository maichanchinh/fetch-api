'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urljs = require('urljs');

var _urljs2 = _interopRequireDefault(_urljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getDefaultOptions = function getDefaultOptions(_ref) {
  var data = _ref.data,
      method = _ref.method;

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
    (function (addOptions) {});
  }

  var _getUrl = function _getUrl(_ref2) {
    var segments = _ref2.segments,
        query = _ref2.query;

    var uri = new _urljs2.default(base);
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

  var _getOptions = function _getOptions(_ref3) {
    var data = _ref3.data,
        method = _ref3.method,
        url = _ref3.url;

    var options = getDefaultOptions(data, method);
    addOptions(options, url);
    return options;
  };

  var _parseText = function _parseText(_ref4) {
    var response = _ref4.response;

    return response.text();
  };

  var _parseJson = function _parseJson(_ref5) {
    var response = _ref5.response;

    if (response.status == 204) return;
    return response.json().then(function (_ref6) {
      var json = _ref6.json;

      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        var error = new Error(response.statusText);
        error.json = json;
        throw error;
      }
    });
  };

  var _request = function _request(_ref7) {
    var segments = _ref7.segments,
        query = _ref7.query,
        data = _ref7.data,
        method = _ref7.method;

    var url = _getUrl(segments, query);
    var options = _getOptions(data, method, url);
    var raw = fetch(url, options);
    if (method == 'raw') return raw.then(_parseText);
    return raw.then(_parseJson);
  };

  var get = function get(_ref8) {
    var segments = _ref8.segments,
        query = _ref8.query;

    return _request(segments, query);
  };

  var rawGet = function rawGet(_ref9) {
    var segments = _ref9.segments,
        query = _ref9.query;

    return _request(segments, query, undefined, 'raw');
  };

  var post = function post(_ref10) {
    var segments = _ref10.segments,
        data = _ref10.data,
        query = _ref10.query;

    return _request(segments, query, data, 'post');
  };

  var put = function put(_ref11) {
    var segments = _ref11.segments,
        data = _ref11.data,
        query = _ref11.query;

    return _request(segments, query, data, 'put');
  };

  var patch = function patch(_ref12) {
    var segments = _ref12.segments,
        data = _ref12.data,
        query = _ref12.query;

    return _request(segments, query, data, 'PATCH');
  };

  var del = function del(_ref13) {
    var segments = _ref13.segments,
        query = _ref13.query;

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