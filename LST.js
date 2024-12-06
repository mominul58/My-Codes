// LST Map with google Earth engine 

// Define the AOI using your shapefile link
var aoi = ee.FeatureCollection('projects/ee-mominul58/assets/sust_area');

// Filter Landsat 8 Surface Reflectance data
var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(aoi)
    .filterDate('2024-01-01', '2024-12-31') // Specify the desired date range
    .filter(ee.Filter.lt('CLOUD_COVER', 10)) // Filter images with less than 10% cloud cover
    .first();
  
 // Function to calculate Land Surface Temperature (LST)
var calculateLST = function(image) {
  // Get thermal band (Band 10) and scale it properly
  var thermal = image.select('ST_B10').multiply(0.00341802).add(149.0); // Scale factor and offset

  // Convert from Kelvin to Celsius
  var lstCelsius = thermal.subtract(273.15).rename('LST_Celsius');

  return lstCelsius;
};

// Calculate LST for the selected Landsat image
var lst = calculateLST(landsat).clip(aoi);

// Add visualization parameters for LST
var lstVisParams = {
  min: 20,  // Adjust based on your data range
  max: 45,
  palette: ['blue', 'cyan', 'yellow', 'orange', 'red']
};

// Add layers to the map
Map.centerObject(aoi, 10);
Map.addLayer(lst, lstVisParams, 'LST (Celsius)');
Map.addLayer(aoi, {}, 'AOI'); 


// Export the LST raster to Google Drive
Export.image.toDrive({
  image: lst,               // The raster to export
  description: 'LST_Export', // A description for the export task
  folder: 'EarthEngine',     // Folder in Google Drive (optional)
  fileNamePrefix: 'LST_Map', // The file name prefix
  region: aoi.geometry(),    // The export region (AOI)
  scale: 30,                 // The pixel resolution (in meters)
  maxPixels: 1e13            // Increase limit if needed
});
