'use strict';

angular.module('journeyToTheMoonApp')
    .controller('MainCtrl', ['$scope','JourneyToTheMoonService', 'IndexedDbService', function ($scope, service, db) {
        $scope.state = "init";
        $scope.processed = 0;
        $scope.countryOptions = {"sortColumn": 1, "sortAscending": false};
        $scope.cityOptions =  {"sortColumn": 2, "sortAscending": false};

        $scope.currentStat = 0;
        $scope.totalStat = 0;
        $scope.currentDate = null;

        $scope.fileDropped = function(file) {
            $scope.$apply(function(){
                $scope.file = file;
                $scope.state = "loaded_file";

                var reader = new FileReader();
                reader.onload = function (eventObj) {
                    var data = {};
                    try {
                        data = JSON.parse(eventObj.target.result);
                    } catch (e) {
                        console.error("loading failed");
                        return;
                    }
                    service.doWork(data, $scope.cities, $scope.workerNotice);
                };
                reader.readAsText(file);
            });
        }

        $scope.workerNotice = function(e) {

            if(e.data.type == "analyzeUpdate") {
                $scope.$apply(function(){
                    $scope.processed += e.data.count;
                    //console.log("processed: "+ $scope.processed);
                    $scope.countryData = google.visualization.arrayToDataTable(e.data.countryData);
                    $scope.cityData = google.visualization.arrayToDataTable(e.data.cityData);

                    $scope.currentStat = e.data.currentStat;
                    $scope.totalStat = e.data.total;
                    $scope.currentDate = e.data.date;
                })
            } else {
                $scope.$apply(function(){
                    if($scope.state == "loaded_file") {
                        $scope.state = "processing";
                    }
                    $scope.rocketStyle = {
                        "left": e.data.percent+"%"
                    }
                    $scope.exhaustStyle = {
                        "width": e.data.percent+"%"
                    }
                });
            }
        }

        service.fetchCityData().then(function(data) {
            $scope.cities = data;
        });

        google.load(
            "visualization",
            "1",
            {
                "packages": ["geochart", "table"],
                "callback": function () {
                    console.log("loaded google");
                }
            }
        );
  }]);
