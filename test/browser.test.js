import jsdom from 'jsdom';
import app from './api';
import _ from 'lodash';

// setup global chai methods
import chai from 'chai';
import dirtyChai from 'dirty-chai';
chai.config.includeStack = true;
chai.config.showDiff = true;
chai.use(dirtyChai);
global.chai = chai;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.expect = chai.expect;
global.assert = chai.assert;

let window;
let server;
global._options = {
  baseURI: 'http://localhost:8088',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

describe('browser', () => {
  before(done => {
    jsdom.env({
      html: '',
      scripts: [require.resolve('./browser.bundled.js')],
      virtualConsole: jsdom
        .createVirtualConsole()
        .sendTo(console),
      done(err, _window) {
        if (err) 
          return done(err);
        window = _window;
        done();
      }
    });
  });

  before(done => {
    server = app.listen(8088, done);
  });

  after(() => {
    // free memory associated with the window
    window.close();
    server.close();
  });

  it('should have `fetch` defined', () => {
    expect(window.fetch)
      .to
      .exist();
  });

  it('should have `FetchApi` defined', () => {
    expect(window.fetchApi)
      .to
      .exist();
  });

  it('should create fetch-api-warpper instance with all methods', () => {

    const api = new window.fetchApi(global._options);
    expect(api)
      .to
      .be
      .an('object');

    let methods = [
      'auth',
      'jwt',
      'get',
      'head',
      'post',
      'put',
      'del',
      'options',
      'patch'
    ]; //.forEach( (method)  => expect(apiService[method]).to.be.a('function'));

    _.forEach(methods, (method) => {
      expect(api[method])
        .to
        .be
        .a('function');
    })
  });

  let methodTest = [
     'get',
    // 'head',
    'post',
    'put',
    // 'del',
    // 'options',
    'patch'
  ];

  _.forEach(methodTest, method => {
    const methodName = method === 'del' ? 'DELETE' : _.toUpper(method);

    it(`should return 200 on ${methodName}`, async () => {
      const api = new window.fetchApi(global._options);
      try {
        const res = await api[method]('/', {});
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('object');
      } catch (err) {
        throw err;
      }

    });
  });
})
