'use strict';

/* Services */
var app = angular.module('journeyToTheMoonApp.directives', [])
    .directive("dropzone", function () {
        return {
            restrict: "EA",
            transclude: true,
            template: "<div class='dropzone' ng-transclude></div>",
            scope: {
                onDrop: "="
            },
            link: function (scope, element, attrs) {

                //When an item is dragged over the document, add .dragOver to the body
                var onDragOver = function (e) {
                    e.preventDefault();
                    e.originalEvent.dataTransfer.dropEffect = "copy";
                    $(element).addClass("dragOver");
                };

                //When the user leaves the window, cancels the drag or drops the item
                var onDragEnd = function (e) {
                    e.preventDefault();
                    $(element).removeClass("dragOver");
                };

                //When a file is dropped on the overlay
                var loadFile = function (file) {
                    scope.$apply(scope.onDrop(file));
                };

                //Dragging begins on the document (shows the overlay)
                element.bind("dragover", onDragOver);

                //Dragging ends on the overlay, which takes the whole window
                element.bind("dragleave", onDragEnd)
                    .bind("drop", function (e) {
                        onDragEnd(e);
                        loadFile(e.originalEvent.dataTransfer.files[0]); /* This is the file */
                    });
            }
        };
    })
    .directive("googleTable", function () {
        return {
            restrict: "EA",
            scope: {
                data: "=",
                options: "="
            },
            table: null,
            link: function (scope, element, attrs) {
                var table = new google.visualization.Table(element[0]);
                scope.$watch('data', function() {
                    table.draw(scope.data, scope.options);
                });
            }
        };
    })
    .directive("googleGeoChart", function () {
        return {
            restrict: "EA",
            scope: {
                data: "=",
                options: "="
            },
            table: null,
            link: function (scope, element, attrs) {
                var chart = new google.visualization.GeoChart(element[0]);
                scope.$watch('data', function() {
                    chart.draw(scope.data, scope.options);
                });
            }
        };
    });