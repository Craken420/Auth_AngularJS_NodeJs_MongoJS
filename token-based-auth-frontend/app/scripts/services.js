'use strict';

angular.module('angularRestfulAuth')
    .factory('Main', ['$http', '$localStorage', function($http, $localStorage){
        console.log('FRONT:: factory')
        var baseUrl = "http://localhost:3001";
        function changeUser(user) {
            console.log('FRONT:: changeUser')
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            console.log('FRONT:: urlBase64Decode')
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            console.log('FRONT:: getUserFromToken')
            console.log('FRONT:: $localStorage.token', token)
            var token = $localStorage.token;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        return {
            save: function(data, success, error) {
                console.log('FRONT:: save')
                console.log('FRONT:: save - Url: ', baseUrl + '/signin')
                
                $http.post(baseUrl + '/signin', data).success(success).error(error)
            },
            signin: function(data, success, error) {
                console.log('FRONT:: signin')
                $http.post(baseUrl + '/authenticate', data).success(success).error(error)
            },
            me: function(success, error) {
                console.log('FRONT:: ME')
                $http.get(baseUrl + '/me').success(success).error(error)
            },
            logout: function(success) {
                console.log('FRONT:: LOGOUT')
                changeUser({});
                delete $localStorage.token;
                success();
            }
        };
    }
]);