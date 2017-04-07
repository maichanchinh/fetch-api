'use strict';

var _FetchApi = require('../FetchApi');

var _FetchApi2 = _interopRequireDefault(_FetchApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock("../FetchApi.js");


describe('Unit tests of mock components', function () {
  var api;

  var throwError = function throwError(resp) {
    throw new Error('Got unexpected response: ' + resp);
  };

  beforeEach(function () {
    api = (0, _FetchApi2.default)();
  });

  afterEach(function () {
    expect(api.getPending().length).toEqual(0);
  });

  it('should return correct getPending', function () {
    api.setResponse('/users', JSON.stringify({ foo: 'bar' }));

    expect(api.getPending().length).toEqual(1);
    console.log(api.getPending().length);
    return api.get('users').then(function (resp) {
      expect(resp).toEqual({ foo: 'bar' });
    });
  });

  it('should raise error on unexpected calls', function () {
    return api.get('hi').then(throwError, function (err) {
      expect(err.message).toEqual('Call to /hi without expected response');
    });
  });

  it('should raise error on expected calls with params', function () {
    return api.get(['hi'], { foo: 'bar' }).then(throwError, function (err) {
      var message = 'Call to /hi?foo=bar without expected response';
      expect(err.message).toEqual(message);
    });
  });

  it('should parse json', function () {
    api.setResponse('/users/me?foo=bar', JSON.stringify({ foo: 'bar' }));
    return api.get(['users', 'me'], { foo: 'bar' }).then(function (resp) {
      expect(resp).toEqual({ foo: 'bar' });
    });
  });

  it('should raise error on parse json', function () {
    api.setResponse('/users/me?foo=bar', "some text");
    return api.get(['users', 'me'], { foo: 'bar' }).then(throwError, function (err) {
      expect(err.message).toEqual('Given setResponse is not JSON.');
    });
  });

  it('should parse text', function () {
    api.setResponse('/foo', 'bar');
    return api.rawGet('foo').then(function (resp) {
      expect(resp).toBe('bar');
    });
  });

  it('should check the headers passed to fetch', function () {
    api.setResponse('/me', 'bar');
    return api.rawGet('me').then(function (resp) {
      expect(resp).toBe('bar');
      // expect(fetch).toBeCalledWith(
      //   '/me',
      //   { headers: {}, method: 'get' }
      // );
    });
  });
});