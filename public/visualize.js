/*
 * Create a scatterplot based on a datafile.
 * */


function genScatterPlot(svg, inputFile) {
  // set the ranges
  var x = d3.scaleLinear().range([0, width]); // miles per hr
  var y = d3.scaleLinear().range([height, 0]); // slope

  d3.json(inputFile, function(error, data) {
    if (error) throw error;

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.mph; }));
    // y.domain([-30, 30]);
    y.domain(d3.extent(data, function(d) { return d.slopePct; }));

    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 2)
        .attr("cx", function(d) { return x(d.mph); })
        .attr("cy", function(d) { return y(d.slopePct); });

    svg.append("line")
      .attr("class", "zeroline")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", width)
      .attr("y2", y(0))
      .attr("shape-rendering", "crispEdges");

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 8) + ")")
        .style("text-anchor", "middle")
        .text("Speed (Miles Per Hour)")
        .attr("class", "labeltext");

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Slope (Percent)")
        .attr("class", "labeltext");

  });

}

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var output = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Get the data
genScatterPlot(output, "./processed_data/morning_ride_15.json");
