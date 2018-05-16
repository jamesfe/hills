/*
 * We read the GPX file and bucket it by time.  For each set of times, we can get a speed in meters/sec and convert that to whatever
 * Between each set of times we can also do a delta on the altitude difference, convert that to whatever we want.
 * */


let timeInterval = 15; // minimum five seconds between each point

var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

var gpx = new DOMParser().parseFromString(fs.readFileSync('./data/test_data.gpx', 'utf8'));

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
    segments.push(tempCoords);
    let firstCoord = tempCoords[tempCoords.length - 1];
    tempCoords = new Array();
    tempCoords.push(firstCoord); // this is the first point of the next segment.
    targetTime += timeInterval;
    // TODO: Mash the data: how long in km is each segment, what's the deal with the slope
  }
}
/*
console.log(segments);
console.log(segments[0]);
*/

/*
 * Some code here to turn each segment into a geoJSON feature or something
 * calculate the length of each segment
 * calculate the slope
 */
