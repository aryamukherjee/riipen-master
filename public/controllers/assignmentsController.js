var assignmentsController = function($scope, $http, $uibModal, $rootScope) {

    $scope.$parent.tag_id = 0;
    //initialize scope data
    $scope.assignments = {
            totalitems: 0,
            currentPage: 1,
            itemsperpage: 20,
            recommendation: false,
            data: [],
            allData: []
    };
    
    function loadData(){
        $scope.assignments.data.length = 0;
        $scope.assignments.totalitems = $scope.assignments.allData.length;
        var startIndex = ($scope.assignments.currentPage - 1) * $scope.assignments.itemsperpage;
        for (i = startIndex; i < startIndex + $scope.assignments.itemsperpage; i++) {
            if(startIndex > $scope.assignments.allData.length)
            {
                break;
            }
            $scope.assignments.data.push({
                id: $scope.assignments.allData[i]._id,
                name: $scope.assignments.allData[i]._source.name,
                summary: $scope.assignments.allData[i]._source.summary,
                score: $scope.assignments.allData[i]._score
            });
        }
    }
    // On landing, get all recommended assignments
    $http({
            url: '/api/recommendations',
            method: 'GET',
            params: {location_id: 3, tag_id: 797}//hard coded tag_id for tag: operations
        })
        .success(function(data) {
            $scope.assignments.allData.length = 0;
            $scope.assignments.recommendation = true;
            $scope.assignments.allData = data;    
            loadData();
        })
        .error(function(error) {
                console.log('Error: ' + error);
        });

    
    function getByTag(id) {
        
        if($scope.tag_id != 0){
            $scope.assignments.data.length = 0;
            $scope.assignments.totalitems = 0;
            $scope.assignments.recommendation = false;
            $http({
                url: '/api/getbytag',
                method: 'GET',
                params: {tag_id: id}
            })
            .success(function(data) {
                $scope.assignments.allData.length = 0;
                $scope.assignments.recommendation = false;
                $scope.assignments.allData = data;    
                loadData();
            })
            .error(function(error) {
                    console.log('Error: ' + error);
            }); 
        }
    };
    
    $scope.searchSubmit = function() {
        
        if($scope.query){
            $scope.assignments.data.length = 0;
            $scope.assignments.totalitems = 0;
            $scope.assignments.recommendation = false;
            $http({
                url: '/api/getmatchedassignments',
                method: 'GET',
                params: {text: $scope.query}
            })
            .success(function(data) {
                $scope.assignments.allData.length = 0;
                $scope.assignments.allData = data;    
                loadData();
            })
            .error(function(error) {
                    console.log('Error: ' + error);
            }); 
        }
    };
    
    $scope.pageChanged = function () {
        loadData();
    }
    
    $scope.$watch('tag_id', function () {
        getByTag($scope.tag_id);
    }); 
    
}

assignmentsController.$inject = ['$scope', '$http', '$uibModal', '$rootScope'];