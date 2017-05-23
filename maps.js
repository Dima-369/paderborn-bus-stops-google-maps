var map;
var directionsDisplay;
// if false, only the markers are displayed without any downloaded bus information which is almost
// instant compared to downloading the bus data for each stop
var showBusTimes = true;

function initialize() {

    directionsDisplay = new google.maps.DirectionsRenderer();

    var mapOptions = {
        zoom: 15,
        // centering on the University of Paderborn
        center: new google.maps.LatLng(51.706768, 8.771104),
        clickableIcons: false
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);

    $.getJSON('bus_stops.json').done(
        function (data) {
            $.each(data, function (key_first, value_first) {

                var infoWindowContent = "";

                if (showBusTimes) {
                    var yql = 'https://query.yahooapis.com/v1/public/yql?'
                        + 'q=' + encodeURIComponent('select * from json where url=@url')
                        + '&url=' + encodeURIComponent("http://padersprinter.de/internetservice/services/passageInfo/stopPassages/stop?stop=" + key_first + "&mode=arrival")
                        + '&format=json&callback=?';

                    $.getJSON(yql, test_func);

                    function test_func(json) {

                        if (json.query.count) {

                            var data = json.query.results.json;
                            var hasContent = false;
                            infoWindowContent = "<h3 style=\"text-align: center\">" + value_first.name + "</h3><ul>";

                            if (data.actual) {
                                $.each(data.actual, function (key, val) {

                                    if (typeof val.patternText != 'undefined' && typeof val.direction != 'undefined' && typeof val.actualTime != 'undefined') {
                                        infoWindowContent += "<li>" + val.patternText + " (" + val.direction + "): " + "<b>" + val.actualTime + "</b></li>";
                                        hasContent = true;
                                    }
                                });
                            }

                            if (hasContent) {
                                infoWindowContent += "</ul>";
                                var infoWindow = new google.maps.InfoWindow({
                                    content: infoWindowContent
                                });

                                var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(value_first.latitude, value_first.longitude),
                                    map: map
                                });

                                marker.addListener('click', function () {
                                    if (!marker.open) {
                                        infoWindow.open(map, marker);
                                        marker.open = true;
                                    } else {
                                        infoWindow.close();
                                        marker.open = false;
                                    }
                                });
                            }

                        } else {
                            return false;
                        }
                    }

                } else {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(value_first.latitude, value_first.longitude),
                        map: map
                    });
                    var infoWindow = new google.maps.InfoWindow({
                        content: "<h3>" + value_first.name + "</h3>"
                    });

                    marker.addListener('click', function () {
                        if (!marker.open) {
                            infoWindow.open(map, marker);
                            marker.open = true;
                        } else {
                            infoWindow.close();
                            marker.open = false;
                        }
                    });
                }
            });
        }
    )
}

/**
 * Called by the Google Maps callback when it's done loading.
 */
function initMap() {
    var directionsService = new google.maps.DirectionsService();
    initialize()
}
