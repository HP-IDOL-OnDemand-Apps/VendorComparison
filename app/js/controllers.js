angular
    .module('havenApp.controllers', ['havenApp.services', 'angularFileUpload'])
    .controller('InitialCtrl', InitialCtrl);

/**
 * Initial App Controller
 * @param {Object} $rootScope the root scope
 * @param {Object} $scope the scope
 * @param {Object} $state the state
 *
 */
function InitialCtrl($rootScope, $scope, $state, RestService, $upload) {
    $scope.vendors = [{ "name": "Microsoft", 'cloud': [], 'tweets': [] }];
    $scope.searchVendorTerm = "";
    $scope.loading = 0;
    $scope.showClouds = false;
    $scope.showSentiment = false;

    $scope.$watch('files', function() {
        $scope.uploadVendors($scope.files);
    });

    $scope.submitWordCloud = function() {
      $scope.showClouds = true;
      $scope.showSentiment = false;

      for(var i in $scope.vendors) {
        (function(i) {
          if($scope.vendors[i].name == '') {
            return;
          }
          $scope.loading++;

          RestService.getWordCloud($scope.vendors[i].name.toString())
            .then(function(data) {
              $scope.vendors[i].cloud = data.result;
              $scope.loading--;
            }, function(fail) {
              $state.go("app.error");
            });
        })(i);
      }
    };

    $scope.uploadVendors = function(files) {
      $scope.showSentiment = true;
      $scope.showClouds = false;

      if(files && files.length) {
        for(var i = 0 ; i < files.length ; i++) {
          var file = files[i];
          $scope.loading++;
          $upload.upload({
            url: '/extractText',
            file: file
          }).success(function (data, status, headers, config) {
            data.result.forEach(function(datum) {
              $scope.vendors.push({"name": datum});
            });
            $scope.loading--;
          }).error(function(err) {
            console.log(err);
            $scope.loading--;
          });
        }
      }
    };

    $scope.searchVendor = function() {
      if($scope.searchVendorTerm == '') {
        return;
      }
      $scope.loading++;
      RestService.searchVendors($scope.searchVendorTerm)
        .then(function(data) {
          $scope.searchVendorTerm = '';
          $scope.loading--;
          
          data.result.forEach(function(datum) {
            $scope.vendors.push({ "name": datum, 'cloud': [], 'tweets': [] });
          });
        }, function(fail) {
          $state.go('app.error');
        });
    };

    $scope.addVendorRow = function() {
      $scope.vendors.push({"name": ""});
    };

    $scope.removeVendorRow = function(exVendor) {
      for(var i = 0 ; i < $scope.vendors.length ; i++) {
        if(exVendor == $scope.vendors[i].name) {
          $scope.vendors.splice(i, 1);
        }
      }
    };

    $scope.submitSentimentAnalysis = function() {
      $scope.showSentiment = true;
      $scope.showClouds = false;

      for(var i in $scope.vendors) {
        (function(i) {
          if($scope.vendors[i].name == '') {
            return;
          }
          $scope.loading++;

          /* getting tweet sentiments */
          RestService.getTweetSentiments($scope.vendors[i].name)
            .then(function(data) {
              $scope.vendors[i].tweets = data.tweets.tweets;
              $scope.loading--;
            }, function(fail) {
              $state.go("app.error");
            });
        })(i);
      }
    };
}
InitialCtrl.$inject = ['$rootScope', '$scope', '$state', 'RestService', '$upload'];
