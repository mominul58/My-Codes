// **Load Sentinel-5P Aerosol Optical Depth (AOD) data**

// Define the Area of Interest (AOI)
var aoi = ee.FeatureCollection('projects/ee-mominul58/assets/sust_area');

// Load Sentinel-5P Aerosol Optical Depth (AOD) data
var s5p = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_AER_AI')
    .filterBounds(aoi)                  // Filter by AOI
    .filterDate('2024-01-01', '2024-12-01')  // Specify the date range
    .select('absorbing_aerosol_index'); // Select the absorbing aerosol index (AAI) band

// Calculate the mean AAI for the specified period
var aodMean = s5p.mean().rename('AOD').clip(aoi);

// Define a conversion function for AOD to PM2.5
// Note: There isn't a direct PM2.5 measurement in Sentinel-5P; this is an estimation
var aodToPM25 = function(image) {
  // Convert AOD to PM2.5 using an empirical formula (adjust based on the region)
  var pm25 = image.expression(
    'AOD * 50', // Example conversion factor
    { 'AOD': image.select('AOD') }
  ).rename('PM25'); // Valid band name without special characters
  return pm25;
};

// Apply the conversion
var pm25 = aodToPM25(aodMean);

// Define visualization parameters
var pm25VisParams = {
  min: 0,
  max: 100, // Adjust based on your expected PM2.5 range
  palette: ['blue', 'green', 'yellow', 'orange', 'red', 'purple', 'brown']
};

// Center the map and add layers
Map.centerObject(aoi, 10);
Map.addLayer(pm25, pm25VisParams, 'PM2.5');
Map.addLayer(aoi, {}, 'AOI');

// Print PM2.5 image to the console
print('PM2.5 Image:', pm25);

Export.image.toDrive({
  image: pm25,              // PM2.5 image
  description: 'PM25_Export', // Task description
  folder: 'EarthEngine',     // Folder name in Google Drive (optional)
  fileNamePrefix: 'PM25_Map', // File name prefix
  region: aoi.geometry(),    // AOI for export
  scale: 10,               // Pixel resolution in meters
  maxPixels: 1e13            // Maximum number of pixels
});
