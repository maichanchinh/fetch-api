'use strict';

describe('tests for url parsing', function () {
  it('checks expansions', function () {
    var Rest = require('../rest.js');
    var api = Rest();
    expect(api._getUrl()).toEqual('/');
    expect(api._getUrl('/')).toEqual('/');
    expect(api._getUrl(['posts', 33])).toEqual('/posts/33');
    expect(api._getUrl(['users', 'me'])).toEqual('/users/me');
    // Example from https://blogs.dropbox.com/developers/2015/03/json-in-urls/
    var params = JSON.stringify({ a: "b", c: 4 });
    expect(api._getUrl(['users', 'me'], params)).toEqual('/users/me?%7B%22a%22%3A%22b%22%2C%22c%22%3A4%7D');
  });
});