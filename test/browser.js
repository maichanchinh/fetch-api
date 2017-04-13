import es6promise from 'es6-promise';
es6promise.polyfill();
import 'isomorphic-fetch';
import fetchApi from '../src/FetchApi';

typeof self !== 'undefined' ? self : this
window.fetchApi = fetchApi;