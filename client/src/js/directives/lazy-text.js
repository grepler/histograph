/**
 * @ngdoc overview
 * @name histograph
 * @description
 * # histograph
 *
 * Main module of the application. require marked
 */
angular.module('histograph')
  .directive('lazytext', function($compile, $log, $http) {
    return {
      restrict : 'A',
      template: '<div>url: {{url}}</div>',
      scope:{
        url: '='
      },
      link : function(scope, element, attrs) {
        'use strict';
        $log.log('::lazi-text ready', scope.url);
        
        scope.$watch('url', function(url) {
          if(!url)
            return;
          element.html('loading ...');
          $http.get('/txt/' + scope.url).then(function(res) {
            
            element.html(res.data.replace(/\n/g, '<br/>'));
          });
        })
      }
    }
  });