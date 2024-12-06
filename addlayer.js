// Load your uploaded shapefile (replace with your asset path)
var shapefile = ee.FeatureCollection('projects/ee-mominul58/assets/sust_area');

// Add it to the map
// Map.centerObject(shapefile, 12); // Adjust zoom level
Map.addLayer(shapefile);
