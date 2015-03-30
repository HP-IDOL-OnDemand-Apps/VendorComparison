angular.module('havenApp.services', [])

    .factory('RestService',function ($http, $q) {
        return {
            /**
             * Get tweets list and analyze sentiments of each.
             * @param searchTerm - the term to search for
             */
            getTweetSentiments: function(searchTerm) {
                var deferred = $q.defer();

                $http.post('/searchTweets', { searchTerm: searchTerm }).success(function (data, status, headers, config) {
                    if(status == 200){
                        deferred.resolve(data);
                    } else {
                        deferred.reject("Error in getting tweet sentiments");
                    }
                }).
                error(function (data, status, headers, config) {
                    deferred.reject("Error in getting tweet sentiments");
                });
                return deferred.promise;
            },
            /**
             * Get list of words for word cloud.
             * @param cloudterm - the term to search for
             */
            getWordCloud: function(cloudterm) {
                var deferred = $q.defer();

                $http.post('/findRelatedConcepts', { 'key': cloudterm }).success(function (data, status, headers, config) {
                    if(status == 200){
                        deferred.resolve(data);
                    } else {
                        deferred.reject("Error in getting word cloud");
                    }
                }).
                error(function (data, status, headers, config) {
                    deferred.reject("Error in getting word cloud");
                });
                return deferred.promise;
            },
            /**
             * Search for vendors based on keyword
             * @param vendorSearchTerm - the keyword to search for
             */
            searchVendors: function(vendorSearchTerm) {
                var deferred = $q.defer();

                $http.post('/findSimilar', { 'text': vendorSearchTerm }).success(function (data, status, headers, config) {
                    if(status == 200){
                        deferred.resolve(data);
                    } else {
                        deferred.reject("Error in getting vendor search results");
                    }
                }).
                error(function (data, status, headers, config) {
                    deferred.reject("Error in getting vendor search results");
                });
                return deferred.promise;
            }
        };
    });