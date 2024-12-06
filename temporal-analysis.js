// To create a temporal analysis chart for Land Surface Temperature (LST) over time, you can calculate the average LST for each image in the Landsat 8 ImageCollection within your AOI and then plot it. Here's how to do it in Google Earth Engine:

// Define the AOI using your shapefile link
var aoi = ee.FeatureCollection('projects/ee-mominul58/assets/sust_area');

// Load the Landsat 8 ImageCollection
var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(aoi)
    .filterDate('2024-01-01', '2024-12-31') // Specify the desired date range
    .filter(ee.Filter.lt('CLOUD_COVER', 10));

// Function to calculate LST for each image
var calculateLST = function(image) {
  var thermal = image.select('ST_B10').multiply(0.00341802).add(149.0); // Scale factor and offset
  var lstCelsius = thermal.subtract(273.15).rename('LST_Celsius');
  return image.addBands(lstCelsius);
};

// Apply the LST calculation to the ImageCollection
var lstCollection = landsat.map(calculateLST);

// Reduce the LST to an average value over the AOI for each image
var lstTimeSeries = lstCollection.map(function(image) {
  var meanLST = image.select('LST_Celsius').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
  }).set('system:time_start', image.get('system:time_start')); // Add timestamp for chart
  return ee.Feature(null, meanLST);
});

// Convert the results to a FeatureCollection for charting
var lstChartData = ee.FeatureCollection(lstTimeSeries);

// Create a chart of LST over time
var chart = ui.Chart.feature.byFeature(lstChartData, 'system:time_start', 'LST_Celsius')
  .setChartType('LineChart')
  .setOptions({
    title: 'Temporal Analysis of LST',
    hAxis: {title: 'Date', format: 'YYYY-MM-dd'},
    vAxis: {title: 'LST (°C)'},
    lineWidth: 2,
    pointSize: 4
  });

// Print the chart
print(chart);
