/*
 * We read the GPX file and bucket it by time.  For each set of times, we can get a speed in meters/sec and convert that to whatever
 * Between each set of times we can also do a delta on the altitude difference, convert that to whatever we want.
 * */


let timeInterval = 60; // minimum five seconds between each point

var turf = require('@turf/turf');
var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

// let dFile = './data/test_data.gpx'
let dFile = './data/four_countries_century.gpx'

var gpx = new DOMParser().parseFromString(fs.readFileSync(dFile, 'utf8'));

var data = tj.gpx(gpx);

var distance = 0;
var time = 0

function dateStringToEpochSeconds(inStr) {
  return Math.floor(new Date(inStr).getTime() / 1000);
}
var thisTime = 0; // the time we are currently looking at
var targetTime =  -1; // the time we are targeting (some seconds after our current time)
var targetTime = dateStringToEpochSeconds(data.features[0].properties.coordTimes[0]) + timeInterval;
var segments = new Array();
var tempCoords = new Array();


for (var i = 0; i < data.features[0].geometry.coordinates.length; i++) {
  /* Keep adding points and distance to our line until time difference is 5 seconds. */
  thisTime = dateStringToEpochSeconds(data.features[0].properties.coordTimes[i]);
  if (thisTime < targetTime) {
    tempCoords.push({
      time: thisTime,
      coord: data.features[0].geometry.coordinates[i]
    });
  }
  if (thisTime >= targetTime) {
    if (tempCoords.length > 1) {
      let feature = turf.lineString(tempCoords.map(x => x.coord.slice(0, 2)));
      let milesLength = turf.length(feature, {units: 'miles'});
      let metersLength = turf.length(feature, {units: 'meters'});
      // console.log('-----------new feature---------------');
      // console.log(milesLength, metersLength);
      var slopeSegs = tempCoords.slice(0, tempCoords.length - 1).map((x, i) => {
        let tinyFeature = turf.lineString([x.coord.slice(0, 2), tempCoords[i + 1].coord.slice(0, 2)]);
        let tinyLength = turf.length(tinyFeature, {units: 'meters'});
        if (tinyLength === 0) {
          tinyLength = 0.00001;
        }
        let percentage = tinyLength / metersLength;
        let rise = x.coord[2] - tempCoords[i + 1].coord[2];
        let slopePct = 100 * (rise / tinyLength);
        // console.log(percentage, slopePct, x.coord[1] + "," + x.coord[0], x.coord[2], tempCoords[i + 1].coord[2], 'run', tinyLength);
        return (percentage * slopePct);
      });
      let totalSlopePct = slopeSegs.reduce((x, a) => x + a, 0);
      console.log('mi: ', milesLength, 'm: ', metersLength, 'pct%: ', totalSlopePct);


      segments.push(tempCoords);
    }
    let firstCoord = tempCoords[tempCoords.length - 1];
    tempCoords = new Array();
    tempCoords.push(firstCoord); // this is the first point of the next segment.
    targetTime += timeInterval;
    // TODO: Mash the data: how long in km is each segment, what's the deal with the slope
  }
}
console.log(segments.length);
/*
console.log(segments[0]);
console.log(segments[1]);
console.log(segments[2]);
*/

/*
 * Some code here to turn each segment into a geoJSON feature or something
 * calculate the length of each segment
 * calculate the slope
 */
