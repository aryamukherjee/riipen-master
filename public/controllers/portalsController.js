var portalsController = function($scope, $http) {

    //initialize scope data
    $scope.portals = {
            totalitems: 0,
            currentPage: 1,
            itemsperpage: 10,
            recommendation: false,
            data: []
    };
    // On landing, get all recommended assignments
    $http({
            url: '/api/allportals',
            method: 'GET'
        })
        .success(function(data) {
                $scope.portals.data.length = 0;
                $scope.portals.totalitems = data.length;
                $scope.portals.recommendation = true;
                for (i = 0; i < data.length; i++) {
                    $scope.portals.data.push({
                        id: data[i]._id,
                        name: data[i]._source.name,
                        biography: data[i]._source.biography,
                        score: data[i]._score
                    });
                }
                console.log(data);
        })
        .error(function(error) {
                console.log('Error: ' + error);
        });
    
    $scope.searchSubmit = function() {
        
        if($scope.query){
            $scope.portals.data.length = 0;
            $scope.portals.totalitems = 0;
            $scope.portals.recommendation = false;
            $http({
                url: '/api/getmatchedportals',
                method: 'GET',
                params: {text: $scope.query}
            })
            .success(function(data) {
                for (i = 0; i < data.length; i++) {
                    $scope.portals.data.push({
                        id: data[i]._id,
                        name: data[i]._source.name,
                        biography: data[i]._source.biography,
                        score: data[i]._score
                    });
                }
                console.log(data); 
            })
            .error(function(error) {
                    console.log('Error: ' + error);
            }); 
        }
    };
}

portalsController.$inject = ['$scope', '$http'];