//     fetch-api-warpper     Copyright (c) 2017- Chinh Mai Chan
// <maichanchinhls+fetch@gmail.com>     MIT Licensed

// * Author: [@maichanchinh](https://twitter.com/#!/maichanchinh)
// * Source: <https://github.com/maichanchinh/fetch-api> # fetch-api-warpper

import _ from 'lodash';
import { Buffer } from 'buffer';
import qs from 'qs';
import caseless from 'caseless';
const fetch = typeof window === 'object'
  ? window.fetch
  : global.fetch;

if (!fetch) {
  throw new Error('A global `fetch` method is required as either `window.fetch` for browsers or `gl' +
      'obal.fetch` for node runtime environments. ')
}
const methodsSupport = [
  'get',
  'post',
  'put',
  'del',
  'head',
  'options',
  'patch'
];
const respProperties = {
  readOnly: [
    'headers',
    'ok',
    'redirected',
    'status',
    'statusText',
    'type',
    'url',
    'bodyUsed'
  ],
  writable: [
    'useFinalURL'
  ],
  callable: [
    'clone',
    'error',
    'redirect',
    'arrayBuffer',
    'blob',
    'formData',
    'json',
    'text'
  ]
}

const createResponse = (origResp) => {
  const resp = {
   originalResponse: origResp
  };

  respProperties.readOnly.forEach(
    prop => resp[prop] = origResp[prop]
  );

  respProperties.writable.forEach(
    prop => (resp[prop] = {
      get() {
        return origResp[prop];
      },
      set(value) {
        origResp[prop] = value;
      }
    })
  );

  let callable = null;
  respProperties.callable.forEach(
    prop => {
      Object.defineProperty(resp, prop, {
        value: (
          callable = origResp[prop],
          typeof callable === 'function' && callable.bind(origResp)
        )
      });
    }
  );

  const headersObj = {};
  origResp.headers.forEach(pair => {
    headersObj[pair[0]] = pair[1];
  });
  if(_.isObject(origResp.headers.map)){
    resp['headersObj'] = Object.assign({},headersObj, origResp.headers.map);
  }
  resp['headers'] = Object.assign({}, origResp.headers.map);
  return resp;
}

export default class FetchApi{

  constructor(opts = {}){
    this.opts = opts;
    if (!opts.baseURI)
      throw new Error('baseURI option is required');
    this.parseErr = new Error(`Invalid JSON received from ${opts.baseURI}`);
    this.headers = {
      ...opts.headers
    };
    
    this.arrayFormat = opts.arrayFormat || 'indices';
    if (opts.auth)
      this.auth(opts.auth);

    methodsSupport.forEach(method => {
      this[method] = this._initMethod(method);
    });
  }


  _initMethod = (method) => {
    return (path = '/', options = {}) => {
      // path must be string
      if (!_.isString(path)) throw new Error('`path` must be a string');

      // otherwise check if its an object
      if (!_.isObject(options) || _.isArray(options)) 
        throw new Error('`options` must be an object');

      const opts = {
        headers: {
          ...this.headers
        },
        ...options,
        method: method === 'del'? "DELETE": _.toUpper(method)
      };

      const c = caseless(opts.headers);

      if (_.isUndefined(opts.body)) {
        if (opts.method === 'POST') { opts.body = ''; }
      } else if (_.isObject(opts.body) || opts.body instanceof Array) {
        if (opts.method === 'GET') {
          path += `?${qs.stringify(opts.body, { arrayFormat: this.arrayFormat })}`;
          delete opts.body;
        } else if (c.get('Content-Type') === 'application/json') {
          try {
            opts.body = JSON.stringify(opts.body);
          } catch (err) {
            throw err;
          }
        }
      }

      return new Promise(async (resolve, reject) => {
        try {
          const originalRes = await fetch(this.opts.baseURI + path, opts);
          const res = createResponse(originalRes);
          let contentType = res.headers['Content-Type'];
          if(_.isUndefined(contentType)){
            contentType = res.headers['content-type'];
          }

          if (!res.ok) {
            res.err = new Error(res.statusText);

            // check if the response was JSON, and if so, better the error
            if (contentType && contentType.includes('application/json')) {

              try {
                // attempt to parse json body to use as error message
                res.body = await res.text();
                res.body = JSON.parse(res.body);
                // attempt to use Glazed error messages
                if (typeof res.body === 'object'
                  && typeof res.body.message === 'string') {
                  res.err = new Error(res.body.message);
                } else if (!(res.body instanceof Array)
                  // attempt to utilize Stripe-inspired error messages
                  && typeof res.body.error === 'object') {
                  if (res.body.error.message)
                    res.err = new Error(res.body.error.message);
                  if (res.body.error.stack)
                    res.err.stack = res.body.error.stack;
                  if (res.body.error.code)
                    res.err.code = res.body.error.code;
                  if (res.body.error.param)
                    res.err.param = res.body.error.param;
                }

              } catch (e) {
                res.err = this.parseErr;
              }
            }
            resolve(res);
            return;
          }
          // determine whether we're returning text or json for body
          if (contentType && contentType.includes('application/json')) {
                  res['debug'] = JSON.stringify(res.body);
            try {
              res.body = await res.text();
              res.body = JSON.parse(res.body);
            } catch (err) {
              if (contentType === 'application/json') {
                res.err = this.parseErr;
                resolve(res);
                return;
              }
            }
          } else {
            res.body = await res.text();
          }
          
          resolve(res);

        } catch (err) {
          reject(err);
        }

      });
    };
  }

  auth = (creds) =>{
    if(_.isString(creds)){
      const index = creds.indexOf(":");
      if(index !== -1){
        creds = [
          creds.substr(0, index),
          creds.substr(index+1)
        ]
      }
    }

    if(!_.isArray(creds)) creds = _.toArray(arguments);

    switch (creds.length) {
      case 0:
        creds = ['',''];
        break;
      case 1:
        creds.push('');
        break;
      case 2:
        break;
      default:
        throw new Error('auth option can only have two keys `[user, pass]`');
    }
    if(!_.isString(creds[0])){
      throw new Error('auth option `user` must be a string');
    }
    if(!_.isString(creds[1])){
      throw new Error('auth option `pass` must be a string');
    }

    if (!creds[0] && !creds[1]){
      delete this.headers.Authorization;
    }else{
       this.headers.Authorization =
        `Basic ${new Buffer(creds.join(':')).toString('base64')}`;
    }
    return this;
  }

  jwt = (token) => {
    if(_.isString(token)){
      this.headers.Authorization = `Bearer ${token}`;
    }else{
      throw new Error('jwt token must be a string');
    }
    return this;
  }
}