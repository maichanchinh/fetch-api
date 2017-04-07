jest.unmock('urijs')
jest.unmock('FetchApi')

let FetchApi = require.requireActual('../FetchApi.js').default;

let __responses = {};

const toText = (text) => {
  return new Promise(function(resolve) {
    resolve(text)
  })
}

const toJson = (text) => {
  return new Promise(function(resolve, reject) {
    try {
      var json = JSON.parse(text);
      resolve(json);
    } catch(err) {
      reject(new Error('Given setResponse is not JSON.'));
    }
  })
}

function fakeRequest(url) {
  return new Promise(function(resolve, reject) {
    process.nextTick(function() {
      if(!__responses.hasOwnProperty(url))
        reject(new Error(`Call to ${url} without expected response`));
      var response = __responses[url];
      delete __responses[url];
      resolve({
        status: 200,
        json: toJson.bind(null, response),
        text: toText.bind(null, response)
      });
    })
  })
};

global.fetch = jest.fn(fakeRequest);
// global.fetch = fetch;
function FetchMock(base, addOptions, useTrailingSlashes){
  var fetchApi  = FetchApi(base, addOptions, useTrailingSlashes)

  fetchApi.setResponse = function(url, response) {
    __responses[url] = response;
  }

  fetchApi.getPending = function() {
    var pending = [];
    for (var property in __responses) {
      if (__responses.hasOwnProperty(property)) {
        pending.push(property);
      }
    }
    return pending;
  }

  return fetchApi
}
export default FetchMock;