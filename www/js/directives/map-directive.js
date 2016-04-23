var app = angular.module('starter')

// - Documentação: https://developers.google.com/maps/documentation/
app.directive("appMap", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<div></div>",
        controller: 'mapCtrl',
        link: function(scope, element, attrs) {
              scope.initialize(element[0]);
        }
    };
});
