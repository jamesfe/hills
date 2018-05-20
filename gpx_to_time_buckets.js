/*
 * We read the GPX file and bucket it by time.  For each set of times, we can get a speed in meters/sec and convert that to whatever
 * Between each set of times we can also do a delta on the altitude difference, convert that to whatever we want.
 * */



var turf = require('@turf/turf');
var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

function dateStringToEpochSeconds(inStr) {
  return Math.floor(new Date(inStr).getTime() / 1000);
}


function rideToScatterPlotData(inputFile, timeInterval) {
  var gpx = new DOMParser().parseFromString(fs.readFileSync(inputFile, 'utf8'));
  var data = tj.gpx(gpx);

  var thisTime = 0; // the time we are currently looking at
  var targetTime =  -1; // the time we are targeting (some seconds after our current time)
  var targetTime = dateStringToEpochSeconds(data.features[0].properties.coordTimes[0]) + timeInterval;
  var segments = new Array();
  var tempCoords = new Array();

  for (var i = 0; i < data.features[0].geometry.coordinates.length; i++) {
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
        var slopeSegs = tempCoords.slice(0, tempCoords.length - 1).map((x, i) => {
          let tinyFeature = turf.lineString([x.coord.slice(0, 2), tempCoords[i + 1].coord.slice(0, 2)]);
          let tinyLength = turf.length(tinyFeature, {units: 'meters'});
          if (tinyLength === 0) {
            tinyLength = 0.00001;
          }
          let percentage = tinyLength / metersLength;
          let rise = x.coord[2] - tempCoords[i + 1].coord[2];
          let slopePct = 100 * (rise / tinyLength);
          return (percentage * slopePct);
        });
        let totalSlopePct = slopeSegs.reduce((x, a) => x + a, 0);
        let speedMph = (3600 * milesLength) / (tempCoords[tempCoords.length - 1].time - tempCoords[0].time);
        segments.push({mph: speedMph, slopePct: totalSlopePct});
      }
      let firstCoord = tempCoords[tempCoords.length - 1];
      tempCoords = new Array();
      tempCoords.push(firstCoord); // this is the first point of the next segment.
      targetTime += timeInterval;
    }
  }
  return (segments);
}

let dFile = process.argv[2];
let seconds = parseInt(process.argv[3]);
if (seconds === undefined) {
  seconds = 60;
}

let segs = rideToScatterPlotData(dFile, seconds);
console.log("%j", segs);
