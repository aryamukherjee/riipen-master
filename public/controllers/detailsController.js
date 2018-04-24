var detailsController = function($scope, $http, $routeParams) {
    
    $http({
            url: '/api/getassignment',
            method: 'GET',
            params: {_id: $routeParams.id}
        })
        .success(function(data) {
                $scope.assigndet = data;
                console.dir(data);
        })
        .error(function(error) {
                console.log('Error: ' + error);
        });
}

detailsController.$inject = ['$scope','$http','$routeParams'];