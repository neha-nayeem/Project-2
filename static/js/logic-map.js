// toronto neighbourhoods geojson url
var torontoGeoJson = "https://raw.githubusercontent.com/jasonicarter/toronto-geojson/master/toronto_crs84.geojson";

// select the modal popup element
var modal = d3.select("#modalDiv");

// read in the JSON data
d3.json("/api/v1/raw-data").then(function(data) {

    // Once we get a response, send the data object to the createMarkers function
    createMarkers(data);

});

// define a function to add marker clusters to the map
function createMarkers(crimeData) {

    // define a new marker cluster group
    var markers = L.markerClusterGroup();

    // loop through data
    for (var i = 0; i < crimeData.length; i++) {

        // Set the data location property to a variable
        var lat = crimeData[i].Lat;
        var lng = crimeData[i].Long;
        var location = [lat, lng];

        // Check for location property
        if (location) {
            // Add a new marker to the cluster group and bind a pop-up
            markers.addLayer(L.marker(location)
                .bindPopup(`<strong>Crime: </strong>${crimeData[i]["MCI"]}<br><strong>Location: </strong>${location}<br><strong>Neighbourhood: </strong>${crimeData[i]["Neighbourhood Name"]}`));
        };

    }; // close for

    // Our style object
    var mapStyle = {
        color: "white",
        fillColor: "#ccf5ff",
        fillOpacity: 0.7,
        weight: 1.5
    };

    // Grabbing our GeoJSON data..
    d3.json(torontoGeoJson).then(function(response) {

        var boundaryFeatures = response.features;

        // Creating a geoJSON layer with the retrieved data
        var neighbourhoods = L.geoJson(boundaryFeatures, {

            // Passing in our style object
            style: mapStyle,

            // function for each geoJSON feature/layer
            onEachFeature: function(feature, layer) {

                // if AREA_NAME is present, bind popup
                if (feature.properties && feature.properties.AREA_NAME) {
                    layer.bindPopup(feature.properties.AREA_NAME);
                }

                // event listeners for each layer
                layer.on('mouseover', function() {
                    layer.openPopup(),
                        this.setStyle({
                            'fillColor': '#00b8e6'
                        });
                });

                layer.on('mouseout', function() {
                    layer.closePopup(),
                        this.setStyle({
                            'fillColor': '#ccf5ff'
                        });
                });

                // on click event listener that send the neighbourhood name to plotCharts() and brings up the modal popup
                layer.on('click', function() {
                    // store the neighbourhood name property
                    var areaName = feature.properties.AREA_NAME;

                    // format the name by trimming the neighbourhood ID from the end of the string
                    areaName = areaName.slice(0, areaName.indexOf("("));
                    areaName = areaName.trimEnd();

                    // initiate the modal popup
                    $('#modalDiv').modal('show');

                    // call the plotCharts function for the neighbourhood
                    plotCharts(areaName);

                });
            }
        });

        // call the createMaps function with our markers and neighbourhood layers
        createMap(markers, neighbourhoods);

    });

}; // end createMarkers

// define a createMap function
function createMap(markers, neighbourhoods) {

    // Initial parameters to create map
    var torontoLocation = [43.6532, -79.3832];
    var mapZoom = 12;

    // Create multiple tile layers that will be the background of our map
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Light": light,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Crimes": markers,
        "Neighbourhoods": neighbourhoods
    };


    // Create the map object with options
    var myMap = L.map("map", {
        center: torontoLocation,
        zoom: mapZoom,
        layers: [light, markers, neighbourhoods]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // re-adjust the width/height bounds of the map container to fit in the bootstrap div
    setTimeout(function() {
        myMap.invalidateSize();
    }, 10);

}; // end createMap function