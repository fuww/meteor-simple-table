/* eslint-env es6:false */
/* eslint-disable prefer-arrow-callback */

Package.describe({
  summary: 'Package for just a simple table',
  version: '0.0.3',
  name: 'fuww:simple-table',
  git: 'https://github.com/fuww/meteor-simple-table.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use([
    'ecmascript@0.4.0',
    'templating@1.2.0',
    'reactive-var@1.0.0',
    'underscore@1.0.0',
    'practicalmeteor:underscore-deep@0.9.0'
  ], 'client');

  api.mainModule('client/main.js', 'client');
});
