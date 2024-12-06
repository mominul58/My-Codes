// Define the Area of Interest (AOI)
var aoi = ee.FeatureCollection('projects/ee-mominul58/assets/sust_area');

// Load Sentinel-5P NO2 Tropospheric Column data
var s5p = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2')
    .filterBounds(aoi)                  // Filter by AOI
    .filterDate('2024-01-01', '2024-12-01')  // Specify the date range
    .select('tropospheric_NO2_column_number_density'); // Select NO2 column density

// Calculate the mean NO2 column density over the specified period
var no2Mean = s5p.mean().rename('NO2').clip(aoi);

// Define a conversion function for NO2 to PM2.5
// Note: This is an approximation based on an empirical formula
var no2ToPM25 = function(image) {
  // Convert NO2 to PM2.5 using a region-specific empirical factor
  var pm25 = image.expression(
    'NO2 * 100', // Example conversion factor (adjust based on local studies)
    { 'NO2': image.select('NO2') }
  ).rename('PM25'); // Valid band name without special characters
  return pm25;
};

// Apply the conversion
var pm25 = no2ToPM25(no2Mean);

// Define visualization parameters for PM2.5
var pm25VisParams = {
  min: 0,
  max: 100, // Adjust based on expected PM2.5 range
  palette: ['blue', 'green', 'yellow', 'orange', 'red', 'purple']
};

// Center the map and add layers
Map.centerObject(aoi, 10);
Map.addLayer(pm25, pm25VisParams, 'PM2.5 from NO2');
Map.addLayer(aoi, {}, 'AOI');

// Export PM2.5 raster to Google Drive
Export.image.toDrive({
  image: pm25,              // PM2.5 image
  description: 'PM25_from_NO2', // Task description
  folder: 'EarthEngine',     // Folder name in Google Drive
  fileNamePrefix: 'PM25_Map_NO2', // File name prefix
  region: aoi.geometry(),    // AOI for export
  scale: 1000,               // Pixel resolution in meters
  maxPixels: 1e13            // Maximum number of pixels
});
