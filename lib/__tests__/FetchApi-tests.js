'use strict';

var _FetchApi = require('../FetchApi');

var _FetchApi2 = _interopRequireDefault(_FetchApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('../FetchApi.js');

describe('tests for url parsing', function () {
  it('checks expansions', function () {
    var api = (0, _FetchApi2.default)();
    expect(api._getUrl()).toEqual('/');
    expect(api._getUrl('/')).toEqual('/');
    expect(api._getUrl(['posts', 33])).toEqual('/posts/33');
    expect(api._getUrl(['users', 'me'])).toEqual('/users/me');
    // Example from https://blogs.dropbox.com/developers/2015/03/json-in-urls/
    var params = JSON.stringify({ a: "b", c: 4 });
    expect(api._getUrl(['users', 'me'], params)).toEqual('/users/me?%7B%22a%22%3A%22b%22%2C%22c%22%3A4%7D');
  });

  it('checks expansions with default get params', function () {
    var api = (0, _FetchApi2.default)('/api?authentication=foobar');
    expect(api._getUrl(['users', 'me'])).toEqual('/api/users/me?authentication=foobar');
    expect(api._getUrl(['users', 'me'], { foo: 'bar' })).toEqual('/api/users/me?authentication=foobar&foo=bar');
  });

  it('checks trailing slashes', function () {
    var api = (0, _FetchApi2.default)('/api', function () {}, true);
    expect(api._getUrl(['posts', 33])).toEqual('/api/posts/33/');
    expect(api._getUrl(['users', 'me'])).toEqual('/api/users/me/');
    expect(api._getUrl(['users', 'me'], { foo: 'bar' })).toEqual('/api/users/me/?foo=bar');
    expect(api._getUrl(['users', 'me.html'], { foo: 'bar' })).toEqual('/api/users/me.html?foo=bar');
  });
});