// Create the tile layer that will be the background of our map.
var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map with our layers.
var map = L.map("map-id", {
    center: [40, -100],
    zoom: 4,
  });

// Add our "streetmap" tile layer to the map.
streetmap.addTo(map);

// Get earthquake data and process
var equakedata = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson"

// colours from colorbrewer: https://colorbrewer2.org/#type=qualitative&scheme=Set3&n=9
var colours = ['#a6cee3','#1f78b4','#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6'];

// Data is all earthquakes greater than magnitude 4.5 in the last month
d3.json(equakedata).then(function(earthquakes) {

  // Extract geojson data for mapping
  var locationdata = earthquakes.features;

  function popupFromFeature(feature, layer) {
    if (feature.properties && feature.properties.place && feature.properties.time) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}`);
    }
}

function getColor(m) {
    return m > 100  ? colours[0] :
           m > 75  ? colours[1] :
           m > 50  ? colours[2] :
           m > 35  ? colours[3] :
           m > 20  ? colours[4] :
           m > 10  ? colours[5] :
           m > 5  ? colours[6] :
           m > 0  ? colours[7] :
                    colours[8];
        }

  L.geoJSON(locationdata, {
      pointToLayer: function(feature, latlng) {
        var fdepth = feature.geometry.coordinates[2];
        
        var mag = feature.properties.mag;
                
        var circleoptions = {
            radius: (10**(mag/5)),
            color: getColor(fdepth),
            fillcolor: getColor(fdepth),
            fillOpacity: 0.8
        }  
        return L.circleMarker(latlng, circleoptions)
      }
  ,onEachFeature: popupFromFeature}).addTo(map);

  // Set up the legend.
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [100, 75, 50, 35, 20, 10, 5, 0, -10];
    var colors = colours;
    var colblock = [];
    var labels = []

    // Add the minimum and maximum.
    var legendInfo = "<h1>Earthquake Depth</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      colblock.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      labels.push("<li>" + limits[index] + "</li")
    });

    //div.innerHTML = "<ul>" + labels.join("") + "</ul>";
    div.innerHTML += "<ul>" + colblock.join("") + "</ul>";
    return div;
  };

  // Adding the legend to the map
  legend.addTo(map);


});