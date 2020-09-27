var queryurl = "http://127.0.0.1:5000/all-data";

var torontoGeoJson = "https://raw.githubusercontent.com/jasonicarter/toronto-geojson/master/toronto_crs84.geojson";

d3.json(queryurl).then(function(data) {

    // Once we get a response, send the data object to the createMarkers function
    createMarkers(data);

});

function createMarkers(crimeData) {
    console.log(crimeData);

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
        console.log(boundaryFeatures);

        // Creating a geoJSON layer with the retrieved data
        var neighbourhoods = L.geoJson(boundaryFeatures, {
            // Passing in our style object
            style: mapStyle,
            onEachFeature: function(feature, layer) {

                if (feature.properties && feature.properties.AREA_NAME) {
                    layer.bindPopup(feature.properties.AREA_NAME);
                }

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
                layer.on('click', function() {
                    // Let's say you've got a property called url in your geojsonfeature:
                    layer.openPopup();
                });
            }
        });

        createMap(markers, neighbourhoods);

    });

}; // end createMarkers

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

}; // end createMap function