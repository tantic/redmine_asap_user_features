import { App, plugin } from '@inertiajs/inertia-vue'
import Vue from 'vue'
import dayjs from 'dayjs';
import axios from 'axios'
import VModal from 'vue-js-modal'
import { i18n } from '@/plugins/i18n.js';
import store from './store'

Vue.use(VModal)
Vue.use(plugin)
Vue.use(dayjs)

// Tell Axios to send the CSRF token (taken from the cookie)
// in the header named as "X-CSRF-Token", as this is the name
// expected by Rails
axios.defaults.xsrfHeaderName = 'X-CSRF-Token'

const el = document.getElementById('app')

new Vue({
  store,
  i18n,
  render: h => h(App, {
    props: {
      initialPage: JSON.parse(el.dataset.page),
      resolveComponent: name => require(`./pages/${name}`).default,
    },
  }),
}).$mount(el)

Vue.filter('formatDate', function(value) {
  if (value) {
    return dayjs(String(value)).format('DD/MM/YYYY hh:mm');
  }
})

Vue.filter('formatDateSimple', function(value) {
  if (value) {
    return dayjs(String(value)).format('DD/MM/YYYY')
  }
})

Vue.filter('prettyBytes', function (num) {
  // jacked from: https://github.com/sindresorhus/pretty-bytes
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number');
  }

  var exponent;
  var unit;
  var neg = num < 0;
  var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
  unit = units[exponent];

  return (neg ? '-' : '') + num + ' ' + unit;
});