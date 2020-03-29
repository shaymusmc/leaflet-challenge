// Visualizing Data with Leaflet

// Earthquake Query URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the Earthquake query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) +
      "</p><p>Magnitude: " +  feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  
  var earthquakes = L.geoJSON(earthquakeData, {

    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: radiusSize(feature.properties.mag),
        fillColor: colorRange(feature.properties.mag),
        color: "black",
        weight: 0.5,
        opacity: 0.5,
        fillOpacity: 0.8
      });
    },

    // Run the onEachFeature function once for each piece of data in the array
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Define function to create a map
function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });
  
    var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Map": satellitemap,
        "Grayscale Map": grayscalemap,
        "Outdoors Map": outdoorsmap
    };

    // Create the faultline layer
    var faultLine = new L.LayerGroup();

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        FaultLines: faultLine
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [grayscalemap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // Create function for Legend colors
    // inspiration: https://www.igismap.com/legend-in-leafletjs-map-with-topojson/
    function getColor(d) {
        return d > 5  ? '#ff0000' :
               d > 4  ? '#ff5900' :
               d > 3  ? '#ee9c00' :
               d > 2  ? '#eecc00' :
               d > 1  ? '#d4ee00' :
                        '#98ee00';
    }
    // Add Legend to map
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = [0, 1, 2, 3, 4, 5];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };

    legend.addTo(myMap);

    // Faultline Query URL
    var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

    // Perform a GET request to the Earthquake query URL
    d3.json(faultUrl, function(faultData) {
        L.geoJSON(faultData, {
            color: "#F39C12",
            weight: 2,
            fillOpacity: 0        
        }).addTo(faultLine)
    })
}

// Define function to create the circle radius based on the magnitude
function radiusSize(magnitude) {
    return magnitude * 3.5;
  };

// Define function to set the circle color based on the magnitude
function colorRange(magnitude) {

    switch (true) {
    case magnitude >= 5:
        return '#ff0000';
        break;

    case magnitude >= 4:
        return '#ff5900';
        break;
    
    case magnitude >= 3:
        return '#ee9c00';
        break;

    case magnitude >= 2:
        return '#eecc00';
        break;

    case magnitude >= 1:
        return '#d4ee00';
        break;

    default:
        return '#98ee00';
    };
};