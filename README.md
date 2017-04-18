[![Build Status](https://travis-ci.org/maichanchinh/fetch-api.svg?branch=master)](https://travis-ci.org/maichanchinh/fetch-api)

**Fetch-on-REST is a RESTful API wrapper** built around [window.fetch][fetch].

## Install the required packages:

    # optional (to support older browsers):
    npm install --save es6-promise

    # required (to add global `fetch` method):
    npm install --save isomorphic-fetch

    # required (this package):
    npm install --save frisbee

## Require it, set default options, and make some requests:

    // add optional support for older browsers
    import es6promise from 'es6-promise';
    es6promise.polyfill();
    
    // add required support for global `fetch` method
    // *this must always come before `frisbee` is imported*
    import 'isomorphic-fetch';
    
    // require the module
    import FetchApi from 'fetch-api-warpper';
    
    // create a new instance of Frisbee
    const api = new FetchApi({
      baseURI: 'https://api.startup.com',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    requestLogin();
    
    async function requestLogin() {
    
      // log in to our API with a user/pass
      try {
    
        // make the request
        let res = await api.post('/v1/login');
        console.log('response', res.body);
    
        // handle HTTP or API errors
        if (res.err) throw res.err;
    
        // set basic auth headers for all
        // future API requests we make
        api.auth(res.body.api_token);
    
        // now let's post a message to our API
        res = await api.post('/v1/messages', { body: 'Hello' });
        console.log('response', res.body);
    
        // handle HTTP or API errors
        if (res.err) throw res.err;
    
        // now let's get a list of messages filtered by page and limit
        res = await api.get('/v1/messages', {
          body: {
            limit: 10,
            page: 2
          }
        });
    
        // handle HTTP or API errors
        if (res.err) throw res.err;
    
        // now let's logout
        res = api.post('/v1/logout');
        console.log('response', res.body);
    
        // handle HTTP or API errors
        if (res.err) throw res.err;
    
        // unset auth now since we logged out
        api.auth();
    
        // for more information on `fetch` headers and
        // how to send and expect various types of data:
        // <https://github.com/github/fetch>
    
      } catch (err) {
        throw err;
      }
    
    }
## API

 - api.jwt(token) - helper function that sets a JWT Bearer header. It accepts the jwt_token as a single string argument
 - List of available HTTP methods:
	- api.get(path, options) - GET
	- api.head(path, options) - HEAD (does not currently work - see tests)
	- api.post(path, options) - POST
	- api.put(path, options) - PUT
	- api.del(path, options) - DELETE
	- api.options(path, options) - OPTIONS (does not currently work - see tests)
	- api.patch(path, options) - PATCH
