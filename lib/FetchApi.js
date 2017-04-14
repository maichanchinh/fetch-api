'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _buffer = require('buffer');

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _caseless = require('caseless');

var _caseless2 = _interopRequireDefault(_caseless);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//     fetch-api-warpper     Copyright (c) 2017- Chinh Mai Chan
// <maichanchinhls+fetch@gmail.com>     MIT Licensed

// * Author: [@maichanchinh](https://twitter.com/#!/maichanchinh)
// * Source: <https://github.com/maichanchinh/fetch-api> # fetch-api-warpper

var fetch = (typeof window === 'undefined' ? 'undefined' : (0, _typeof3.default)(window)) === 'object' ? window.fetch : global.fetch;

if (!fetch) {
  throw new Error('A global `fetch` method is required as either `window.fetch` for browsers or `gl' + 'obal.fetch` for node runtime environments. ');
}
var methodsSupport = ['get', 'post', 'put', 'del', 'head', 'options', 'patch'];
var respProperties = {
  readOnly: ['headers', 'ok', 'redirected', 'status', 'statusText', 'type', 'url', 'bodyUsed'],
  writable: ['useFinalURL'],
  callable: ['clone', 'error', 'redirect', 'arrayBuffer', 'blob', 'formData', 'json', 'text']
};

var createResponse = function createResponse(origResp) {
  var resp = {
    originalResponse: origResp
  };

  respProperties.readOnly.forEach(function (prop) {
    return resp[prop] = origResp[prop];
  });

  respProperties.writable.forEach(function (prop) {
    return resp[prop] = {
      get: function get() {
        return origResp[prop];
      },
      set: function set(value) {
        origResp[prop] = value;
      }
    };
  });

  var callable = null;
  respProperties.callable.forEach(function (prop) {
    Object.defineProperty(resp, prop, {
      value: (callable = origResp[prop], typeof callable === 'function' && callable.bind(origResp))
    });
  });

  var headersObj = {};
  origResp.headers.forEach(function (pair) {
    headersObj[pair[0]] = pair[1];
  });
  if (_lodash2.default.isObject(origResp.headers.map)) {
    resp['headersObj'] = Object.assign({}, headersObj, origResp.headers.map);
  }
  resp['headers'] = Object.assign({}, origResp.headers.map);
  return resp;
};

var FetchApi = function FetchApi() {
  var _this = this;

  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  (0, _classCallCheck3.default)(this, FetchApi);

  _initialiseProps.call(this);

  this.opts = opts;
  if (!opts.baseURI) throw new Error('baseURI option is required');
  this.parseErr = new Error('Invalid JSON received from ' + opts.baseURI);
  this.headers = (0, _extends3.default)({}, opts.headers);

  this.arrayFormat = opts.arrayFormat || 'indices';
  if (opts.auth) this.auth(opts.auth);

  methodsSupport.forEach(function (method) {
    _this[method] = _this._initMethod(method);
  });
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this,
      _arguments = arguments;

  this._initMethod = function (method) {
    return function () {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // path must be string
      if (!_lodash2.default.isString(path)) throw new Error('`path` must be a string');

      // otherwise check if its an object
      if (!_lodash2.default.isObject(options) || _lodash2.default.isArray(options)) throw new Error('`options` must be an object');

      var opts = (0, _extends3.default)({
        headers: (0, _extends3.default)({}, _this2.headers)
      }, options, {
        method: method === 'del' ? "DELETE" : _lodash2.default.toUpper(method)
      });

      var c = (0, _caseless2.default)(opts.headers);

      if (_lodash2.default.isUndefined(opts.body)) {
        if (opts.method === 'POST') {
          opts.body = '';
        }
      } else if (_lodash2.default.isObject(opts.body) || opts.body instanceof Array) {
        if (opts.method === 'GET') {
          path += '?' + _qs2.default.stringify(opts.body, { arrayFormat: _this2.arrayFormat });
          delete opts.body;
        } else if (c.get('Content-Type') === 'application/json') {
          try {
            opts.body = JSON.stringify(opts.body);
          } catch (err) {
            throw err;
          }
        }
      }

      return new Promise(function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve, reject) {
          var originalRes, res, contentType;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return fetch(_this2.opts.baseURI + path, opts);

                case 3:
                  originalRes = _context.sent;
                  res = createResponse(originalRes);
                  contentType = res.headers['Content-Type'];

                  if (_lodash2.default.isUndefined(contentType)) {
                    contentType = res.headers['content-type'];
                  }

                  if (res.ok) {
                    _context.next = 23;
                    break;
                  }

                  res.err = new Error(res.statusText);

                  // check if the response was JSON, and if so, better the error

                  if (!(contentType && contentType.includes('application/json'))) {
                    _context.next = 21;
                    break;
                  }

                  _context.prev = 10;
                  _context.next = 13;
                  return res.text();

                case 13:
                  res.body = _context.sent;

                  res.body = JSON.parse(res.body);
                  // attempt to use Glazed error messages
                  if ((0, _typeof3.default)(res.body) === 'object' && typeof res.body.message === 'string') {
                    res.err = new Error(res.body.message);
                  } else if (!(res.body instanceof Array)
                  // attempt to utilize Stripe-inspired error messages
                  && (0, _typeof3.default)(res.body.error) === 'object') {
                    if (res.body.error.message) res.err = new Error(res.body.error.message);
                    if (res.body.error.stack) res.err.stack = res.body.error.stack;
                    if (res.body.error.code) res.err.code = res.body.error.code;
                    if (res.body.error.param) res.err.param = res.body.error.param;
                  }

                  _context.next = 21;
                  break;

                case 18:
                  _context.prev = 18;
                  _context.t0 = _context['catch'](10);

                  res.err = _this2.parseErr;

                case 21:
                  resolve(res);
                  return _context.abrupt('return');

                case 23:
                  if (!(contentType && contentType.includes('application/json'))) {
                    _context.next = 40;
                    break;
                  }

                  res['debug'] = JSON.stringify(res.body);
                  _context.prev = 25;
                  _context.next = 28;
                  return res.text();

                case 28:
                  res.body = _context.sent;

                  res.body = JSON.parse(res.body);
                  _context.next = 38;
                  break;

                case 32:
                  _context.prev = 32;
                  _context.t1 = _context['catch'](25);

                  if (!(contentType === 'application/json')) {
                    _context.next = 38;
                    break;
                  }

                  res.err = _this2.parseErr;
                  resolve(res);
                  return _context.abrupt('return');

                case 38:
                  _context.next = 43;
                  break;

                case 40:
                  _context.next = 42;
                  return res.text();

                case 42:
                  res.body = _context.sent;

                case 43:

                  resolve(res);

                  _context.next = 49;
                  break;

                case 46:
                  _context.prev = 46;
                  _context.t2 = _context['catch'](0);

                  reject(_context.t2);

                case 49:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2, [[0, 46], [10, 18], [25, 32]]);
        }));

        return function (_x4, _x5) {
          return _ref.apply(this, arguments);
        };
      }());
    };
  };

  this.auth = function (creds) {
    if (_lodash2.default.isString(creds)) {
      var index = creds.indexOf(":");
      if (index !== -1) {
        creds = [creds.substr(0, index), creds.substr(index + 1)];
      }
    }

    if (!_lodash2.default.isArray(creds)) creds = _lodash2.default.toArray(_arguments);

    switch (creds.length) {
      case 0:
        creds = ['', ''];
        break;
      case 1:
        creds.push('');
        break;
      case 2:
        break;
      default:
        throw new Error('auth option can only have two keys `[user, pass]`');
    }
    if (!_lodash2.default.isString(creds[0])) {
      throw new Error('auth option `user` must be a string');
    }
    if (!_lodash2.default.isString(creds[1])) {
      throw new Error('auth option `pass` must be a string');
    }

    if (!creds[0] && !creds[1]) {
      delete _this2.headers.Authorization;
    } else {
      _this2.headers.Authorization = 'Basic ' + new _buffer.Buffer(creds.join(':')).toString('base64');
    }
    return _this2;
  };

  this.jwt = function (token) {
    if (_lodash2.default.isString(token)) {
      _this2.headers.Authorization = 'Bearer ' + token;
    } else {
      throw new Error('jwt token must be a string');
    }
    return _this2;
  };
};

exports.default = FetchApi;