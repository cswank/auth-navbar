'use strict';

var LoginCtrl = function ($scope, $modalInstance, message) {
    $scope.message = message;
    $scope.user = {
        'name': '',
        'password': ''
    };
    $scope.ok = function (event) {
        $modalInstance.close($scope.user);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

angular.module('cswank.auth-navbar', [])
    .factory('$auth', ['$http', function($http) {
        return {
            login: function(username, password, callback, errorCallback) {
                $http({
                    url: '/api/login',
                    method: "POST",
                    data: JSON.stringify({username:username, password: password}),
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    callback();
                }).error(function (data, status, headers, config) {
                    errorCallback();
                });
            },
            logout: function(callback) {
                $http({
                    url: '/api/logout',
                    method: "POST",
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    callback();
                }).error(function (data, status, headers, config) {
                    
                });
            },
            ping: function(callback) {
                $http.get("/api/ping").success(function(data) {
                    callback(data);
                });
            }
        }
    }])
    .directive("auth-navbar", ['$rootScope', '$auth', '$localStorage', '$modal', function($rootScope, $auth, $localStorage, $modal) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            template: '<div class="row-fluid">  <div class="navbar navbar-inverse navbar-fixed-top">    <div class="navbar-inner">      <div class="container">        <a href="/#/"><img height="62" src="/img/gavel.png"/></a>        <ul class="nav pull-right navbar-nav">          <li ng-show="loggedIn">            <a class="brand" ng-click="logout()" href="">log out {{$storage.username}}</a>          </li>          <li ng-hide="loggedIn">            <a class="brand" ng-click="login()" href="">log in</a>          </li>        </ul>      </div>    </div>  </div></div>',
            controller: function($scope, $timeout, $modal) {
                $scope.$storage = $localStorage.$default({
                    username: ""
                });
                $scope.username = "";
                $('[data-hover="dropdown"]').dropdownHover();
                $scope.login = function(errorMessage) {
                    var dlg = $modal.open({
                        template: '<div>  <div class="modal-header">    <a class="close" data-dismiss="modal">×</a>    <h3>Login</h3>    <a class="error">{{message}}</a>  </div>  <div class="modal-body">    <input placeholder="user name" ng-model="user.name" autocapitalize="off" autocorrect="off" auto-focus/><br/>    <input placeholder="password" type="password" ng-model="user.password" ng-enter="ok()"/>  </div>  <div class="modal-footer">    <button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button>    <button type="button" class="btn btn-primary" ng-enter="ok()" ng-click="ok()">Ok</button>  </div></div>',
                        controller: LoginCtrl,
                        resolve: {
                            message: function () {
                                return errorMessage;
                            }
                        }
                    });
                    dlg.result.then(function(user) {
                        $scope.username = user.name;
                        $scope.$storage.username = user.name;
                        $scope.password = user.password;
                        $auth.login($scope.username, $scope.password, function(){
                            $scope.loggedIn = true;
                            $rootScope.loggedIn = true;
                        }, function(){
                            $scope.login("username or password not correct, please try again");
                        });
                    });
                }
                
                $scope.logout = function() {
                    $auth.logout(function() {
                        $scope.loggedIn = false;
                    });
                }
                function ping() {
                    $auth.ping(function(data) {
                        $scope.loggedIn = true;
                        $rootScope.loggedIn = true;
                    }, function() {
                        $scope.loggedIn = false;
                        $rootScope.loggedIn = false;
                        $scope.errMsg = "login failed"
                    });
                }
                $scope.loggedIn = false;
                $rootScope.loggedIn = false;
                ping();
            }
        }
    }])
  });
