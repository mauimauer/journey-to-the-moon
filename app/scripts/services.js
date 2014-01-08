'use strict';

/* Services */
var app = angular.module('journeyToTheMoonApp.services', [])
    .factory("JourneyToTheMoonService",['$q','$http', 'IndexedDbService', function($q, $http, db){
        var cityWorker1 = new Worker('scripts/worker.js');
        //var cityWorker2 = new Worker('scripts/worker.js');
        var travelWorker = new Worker('scripts/travelWorker.js');

        return {
            doWork : function(locations, cities, cb){
                cityWorker1.addEventListener('message', cb, false);
                //cityWorker2.addEventListener('message', cb, false);
                travelWorker.addEventListener('message', cb, false);
                travelWorker.postMessage({locations: locations }); // Send data to our worker.

                //var half_length = Math.ceil(locations.locations.length / 2);
                var rightSide = locations.locations;
                //var leftSide = rightSide.splice(0,half_length);

                cityWorker1.postMessage({locations: { locations: rightSide }, cities: cities}); // Send data to our worker.
                //cityWorker2.postMessage({locations: { locations: leftSide }, cities: cities}); // Send data to our worker.
            },
            fetchCityData: function() {
                var defer = $q.defer();
                db.hasFile('cities').then(function(haveFile) {
                    if(haveFile) {
                        defer.resolve(db.getFileFromDb("cities"));
                    } else {
                        $http({method: 'GET', url: '/resources/cities.json'}).
                            success(function(data, status, headers, config) {
                                // this callback will be called asynchronously
                                // when the response is available
                                db.putFileInDb("cities", data);
                                defer.resolve(data);
                            }).
                            error(function(data, status, headers, config) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                console("error");
                            });
                    }
                });
                return defer.promise;
            }
        };
    }])
    .factory("IndexedDbService",['$q','$rootScope',function($q, $rootScope){

        window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
        window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || "readonly";
        window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || "readwrite";
        var dbVersion = 1;
        var defer = $q.defer();

        var request = indexedDB.open("journeyToTheMoon", dbVersion);
        request.onsuccess = function (event) {

            console.log("Success creating/accessing IndexedDB database");
            var db = request.result;

            db.onerror = function (event) {
                console.log("Error creating/accessing IndexedDB database");
            };

            // Interim solution for Google Chrome to create an objectStore. Will be deprecated
            if (db.setVersion) {
                if (db.version != dbVersion) {
                    var setVersion = db.setVersion(dbVersion);
                    setVersion.onsuccess = function () {
                        createObjectStore(db);
                    };
                }
            }
            $rootScope.$apply(function(){
                defer.resolve(db);
            });
        };

        request.onupgradeneeded = function (event) {
            createObjectStore(event.target.result);
        };

        var createObjectStore = function (dataBase) {
                // Create an objectStore
                console.log("Creating objectStore")
                dataBase.createObjectStore("files");
        };

        return {
            db: defer.promise,
            doWork : function(data){
                /*defer = $q.defer();
                worker.postMessage(data); // Send data to our worker.
                return defer.promise;*/
            },
            putFileInDb: function (name, blob) {
                // Open a transaction to the database
                this.db.then(function(db) {
                    console.log("Putting "+name+" in IndexedDB");
                    var transaction = db.transaction(["files"], IDBTransaction.READ_WRITE);

                    // Put the blob into the dabase
                    var put = transaction.objectStore("files").put(blob, name);
                });
            },
            getFileFromDb: function(name) {
                var defer = $q.defer();
                this.db.then(function(db) {
                    console.log("Getting "+name+" from IndexedDB");
                    var transaction = db.transaction(["files"], IDBTransaction.READ_WRITE);
                    transaction.objectStore("files").get(name).onsuccess = function (event) {
                        $rootScope.$apply(function(){
                            defer.resolve(event.target.result);
                        });
                    };
                });
                return defer.promise;
            },
            hasFile: function(name) {
                var defer = $q.defer();
                this.db.then(function(db) {
                    var transaction = db.transaction(["files"], IDBTransaction.READ_WRITE);
                    transaction.objectStore("files").count(name).onsuccess = function (event) {
                        $rootScope.$apply(function(){
                            defer.resolve(event.target.result == 1);
                        });
                    };
                });
                return defer.promise;
            }
        }
    }]);