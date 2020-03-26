// Visualizing Data with Leaflet

// Earthquake Query URL
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the Earthquake query URL
d3.json(quakeUrl, function(data) {
  createFeatures(data.features);
//   console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Define function to create the circle radius based on the magnitude
  function circleRadius(magnitude) {
    return magnitude * 20000;
  }

  // Define function to set the circle color based on the magnitude
  function circleColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c"
    }
    else if (magnitude > 4) {
      return "#ea822c"
    }
    else if (magnitude > 3) {
      return "#ee9c00"
    }
    else if (magnitude > 2) {
      return "#eecc00"
    }
    else if (magnitude > 1) {
      return "#d4ee00"
    }
    else {
      return "#98ee00"
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: circleRadius(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

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
        layers: [grayscalemap, earthquakes, faultLine]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

   

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


    // // Create function for Legend colors
    // function getColor(d) {
    //     return d > 5  ? '#ff3333' :
    //            d > 4  ? '#ff6633' :
    //            d > 3  ? '#ff9933' :
    //            d > 2  ? '#ffcc33' :
    //            d > 1  ? '#ffff33' :
    //                     '#ccff33';
//   }
    // Add Legend to map
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
  
        var div = L.DomUtil.create('div', 'info legend');
        var grade = [0, 1, 2, 3, 4, 5];
        var colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grade.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
            grade[i] + (grade[i + 1] ? '&ndash;' + grade[i + 1] + '<br>' : '+');
        }
    
        return div;
    };

    legend.addTo(myMap);

}