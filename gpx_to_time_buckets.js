/*
 * We read the GPX file and bucket it by time.  For each set of times, we can get a speed in meters/sec and convert that to whatever
 * Between each set of times we can also do a delta on the altitude difference, convert that to whatever we want.
 * */


let minTime = 5; // minimum five seconds between each point

var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

var gpx = new DOMParser().parseFromString(fs.readFileSync('./data/cold_fingers.gpx', 'utf8'));

var data = tj.gpx(gpx);

var distance = 0;
var time = 0

for (var i = 0; i < data.features[0].geometry.coordinates.length; i++) {
  /* Keep adding points and distance to our line until time difference is 5 seconds. */
  if (time === 0) {
    startTime = 
  }
  distance = 

}

/*
var blah = Array();
.forEach( (x, i) => {
  blah.push(i);
});

console.log('done');
console.log(blah);
*/
