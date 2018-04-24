var mainController = function($scope) {

    $scope.tag_id = 0;
    
    $scope.getByTag = function (id) {
        
        $scope.tag_id = id;
    };

}

mainController.$inject = ['$scope'];