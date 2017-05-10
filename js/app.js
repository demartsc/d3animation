var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 50, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("class","mainG").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    cg = svg.append("g").attr("class","mainCircleG").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

var i = 0;

var x = d3.scaleLinear().range([0, width]),
    x2 = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height, 0]),
    y3 = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);
    z1 = d3.scaleOrdinal(["#149E9C", "#F79608"])

var line = d3.line()
    //.curve(d3.curveBasis)
    .x(function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
    .y(function(d) { return y(d.team1_prob); });

var line2 = d3.line()
    //.curve(d3.curveBasis)
    .x(function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
    .y(function(d) { return y(d.team2_prob); });

//use d3.queue to bring in multiple data sets which we bind at different times
d3.queue()
  .defer(d3.json, "data\\gamedata.json")
  .defer(d3.json, "data\\medianData.json")
  .await(ready);

// main function to run stuff
function ready(error, data, mData) {
  if (error) throw error;

  console.log(data);
  console.log(mData);

  x.domain(d3.extent(data, function(d) { return (600-d.game_time+((d.quarter-1)*600)); }));
  x2.domain([d3.extent(mData, function(d) {return d.higherScore;})[0]-5, d3.extent(mData, function(d) {return d.higherScore;})[1]*2 - 30]);

  y.domain([0.00,1.00]);
  y2.domain([1.00,0.00]);
  y3.domain([0.00,10.00]);

  z1.domain(["womens","mens"]);

  //z.domain(cities.map(function(c) { return c.id; }));

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
      .attr("y", 6)
      .attr("dx", width-(width*.1))
      .attr("dy", "3em")
      .attr("fill", "#000")
      .text("Game Time in Seconds ->");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-4em")
      .attr("fill", "#000")
      .text("Win Probability, %");

  g.append("g")
      .attr("class","lineM")
    .append("path")
      .attr("stroke", "lightblue")
      .attr("stroke-width", 2)
      .style("opacity",0)
      .attr("d", "M " + 0 + " " + y(0) + " L " + width + " " + y(0) + " Z");


  d3.select(".lineM")
    .append("text")
     .attr("x", 0)
     .attr("y", y(0))
     .attr('text-anchor', 'left')
     .style("stroke","lightblue")
     .style("opacity",0)
     .style("font-size","smaller")
     .text("Median: " + 0);


  //the two paths draw the lines
  var path1 = g.append("path")
      .datum(data)
      .attr("class","lineChart")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

  var path2 = g.append("path")
      .datum(data)
      .attr("class","lineChart")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line2);

   //draws rects between the lines.
   g.append("g").selectAll("rect")
        .data(data)
      .enter().append("rect")
        .attr("class","bars")
        .attr("id",function(d) {return d.game_row_id;})
        .style("opacity",0)
        .style("fill","grey")
        .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
        .attr("y", function(d) { return y(d.team1_prob > d.team2_prob ? d.team1_prob : d.team2_prob); })
        .attr("width", "2.5px")
        .attr("height", function(d) { return y2(d.team1_prob > d.team2_prob ? d.team1_prob-d.team2_prob : d.team2_prob-d.team1_prob); });

   var totalLength = path1.node().getTotalLength();

   startTransition();

   function startTransition() {

      // this section will transition the line chart onto the screen and then fade it out
      d3.selectAll(".lineChart")
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
          .ease(d3.easeCircle)
          .duration(1000)
          .attr("stroke-dashoffset", 0)
        .transition()
          .delay(1000)
          .duration(1000)
          .style("opacity",0)
          .on("start",barTransition)
          .on("end",removeLineChart);
    }

    function barTransition() {
      d3.select("#approach").transition().duration(1000).style("opacity",0);

      d3.select("#approach")
        .style("opacity",0)
        .text("In order to do that, we start by calculating the difference between the two lines at each moment of data capture throughout the game.")
        .transition()
          .duration(1000)
          .style("opacity",1)
        .transition()
          .delay(1000)
          .duration(1000)
          .style("opacity",0)
        .transition()
          .duration(1000)
          .text("The we calculate the median (to try and avoid skewing) across the difference for each moment in the game to come up with a 34.3% median in this example.")
          .style("opacity",1)
        .transition()
          .delay(1000)
          .duration(1000)
          .style("opacity",0)
        .transition()
          .duration(1000)
          .text("Lastly, I felt it was hard to explain the median percentages, so I transposed them into a score I am calling the 'Close Game Index' shown below. This is simply 10 - (10*[Median Percent Difference]).")
          .style("opacity",1);

      //d3.select("#approach").transition().duration(1000).style("opacity",1);

      // this section will handle the bar transitions within the visualization after the line transitions have been executed
      d3.selectAll(".bars")
        .transition()
          .duration(1000)
          .style("opacity",.5)
        .transition()
          .delay(1000)
          .duration(1000)
          .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
          .attr("y", function(d) { return y(Math.abs(d.team2_prob - d.team1_prob)); })
          .attr("height", function(d) { return height - y(Math.abs(d.team2_prob - d.team1_prob)); })
          .on("start",updateMedian)
        .transition()
          .delay(1000)
          .duration(1000)
          .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
          .attr("y", function(d) { return y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); })
          .attr("height", function(d) { return height - y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); })
          .on("start",updateMedian2) //updateAxis
        .transition()
          .delay(1000)
          .duration(1000)
          .attr("y", function(d) { return y3(0); })
          .attr("height", function(d) { return height - y3(0); })
          .on("end",circleTransition);
    }

    function circleTransition() {
      var yMedianValue = d3.median(data, function(d) { return 10-(10*(Math.abs(d.team2_prob - d.team1_prob))); });
      var f = d3.format(".1f");
      i++;


      // we are going to bring line together and make the circle bigger while doing so
      d3.selectAll(".lineM path")
        .transition()
          .duration(1000)
          .style("opacity",0)
          .attr("d", "M " + x(1200) + " " + y3(yMedianValue) + " L " + x(1200) + " " + y3(yMedianValue) + " Z");

      d3.selectAll(".lineM text")
        .transition()
          .duration(1000)
          .style("opacity",0);

      //clean out data and remove bars
      d3.selectAll(".bars").data([]).exit().remove(); // clean out dom elements


      if (i == 1)
      {
        console.log("in if statement");
        cg.selectAll("circle")
          .data(mData)
        .enter().append("circle")
          .attr("class","circles")
          .attr("id",function(d) {return "g" + d.id;})
          .style("opacity",0)
          .style("fill","lightblue")
          .style("stroke","lightblue")
          .attr("cx", function(d) { return x(1200); })
          .attr("cy", function(d) { return y3(yMedianValue); })
          .attr("r", 0)
          .transition()
          .duration(1000)
          .attr("r",0)
          .on("start", function(d) { 
            cg.select("#g400946603")
              .transition()
                .duration(1000)
                .attr("r",15)
                .style("opacity",.8)
                .on("end", function(d) {
                  cg.selectAll("circle")
                    .transition()
                      .duration(1000)
                      .delay(1000)
                      .attr("cx", function(d) { if (d.gender == "mens") {return x2(d.higherScore);} else {return x2(d.higherScore+d3.extent(mData, function(d) {return d.higherScore;})[1]-30);}; })
                      .attr("cy", function(d) { return y3(d.closeGameIndex); })
                      .attr("r", 5)
                      .style("stroke", function(d) { return z1(d.gender); })
                      .style("fill", function(d) { return z1(d.gender); })
                      .transition()
                        .duration(1000)
                        .delay(1000)
                        .style("opacity",.5) 
                        .on("end",updateMedian3);        
              })
          })


/*
        cg.append("text")
           .attr("x", function(d) { return x(1175); })
           .attr("y", function(d) { return y3(yMedianValue); })
           .attr('text-anchor', 'left')
           .style("stroke","white")
           .style("opacity",0)
           .style("font-size","smaller")
           .text(f(yMedianValue))
          .transition()
            .duration(1000)
            .style("opacity",1);
*/
      }


    }

    function updateAxis() {
      updateMedian2();

      d3.selectAll(".axis--y")
        .transition()
          .duration(1000)
          .call(d3.axisLeft(y3));

      d3.selectAll(".axis--y text")
        .text("Close Game Index");

    }

    function updateXAxis() {
      d3.selectAll(".axis--x")
        .transition()
          .duration(1000)
          .call(d3.axisBottom(x2));

      d3.select(".axis--x text")
        .transition()
          .duration(100)
          .delay(1000)
          .text("Higher Score->");
    }

    function removeLineChart() {
      d3.selectAll(".lineChart").data([]).exit().remove();
    }

    function updateMedian() {
      var yMedianValue = d3.median(data, function(d) { return Math.abs(d.team2_prob - d.team1_prob); });

      var f = d3.format(".1f");

      d3.selectAll(".lineM path")
        .transition()
          .duration(1000)
          .style("opacity",1)
          .attr("d", "M " + 0 + " " + y(yMedianValue) + " L " + width + " " + y(yMedianValue) + " Z");

      d3.selectAll(".lineM text")
        .transition()
          .duration(1000)
          .style("opacity",1)
          .attr("x", 10)
          .attr("y", y(yMedianValue+.02))
          .text("Median: " + f(yMedianValue*100) + "%");
    }

    function updateMedian2() {
      var yMedianValue = d3.median(data, function(d) { return 10-(10*(Math.abs(d.team2_prob - d.team1_prob))); });

      var f = d3.format(".1f");

      d3.selectAll(".lineM path")
        .transition()
          .duration(1000)
          .attr("d", "M " + 0 + " " + y3(yMedianValue) + " L " + width + " " + y3(yMedianValue) + " Z");

      d3.selectAll(".lineM text")
        .transition()
          .duration(1000) 
          .attr("x", x(1100))
          .attr("y", y3(yMedianValue+.1))
          .text("Median: " + f(yMedianValue));
    }

    function updateMedian3() {
      var yMedianValue = d3.median(mData, function(d) {return d.closeGameIndex; });
      var f = d3.format(".1f");

      d3.selectAll(".lineM path")
        .transition()
          .duration(1000)
          .style("opacity",1)
          .attr("d", "M " + 0 + " " + y3(yMedianValue) + " L " + width + " " + y3(yMedianValue) + " Z");

      d3.selectAll(".lineM text")
        .transition()
          .duration(1000) 
          .attr("x", x(1100))
          .attr("y", y3(yMedianValue+.1))
          .style("opacity",1)
          .text("Median: " + f(yMedianValue));
    }
/*
          .tween("lines",function () {
            return function (t) {
                // run lines across the screen
                d3.selectAll("path").attr("stroke-dashoffset", totalLength*(1-t));
            }
          }).each("end", function () {
            d3.transition()
              .duration(1000)
              .tween("hideLines",function () {
                return function (t) {
                  d3.selectAll("path").style("opacity",1-t);
                }
              })
          });
*/
/*

    path2
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);


    d3.selectAll("path")
      .transition()
        .duration(1000)
        .delay(10000)
        .style("opacity",0);



    d3.selectAll("path")
      .transition()
        .duration(1000)
        .delay(10000)
        .style("opacity",0);

    d3.selectAll(".bars")
      .transition()
        .duration(3000)
        .delay(10000)
        .style("opacity",.60);

    //LEFT OFF HERE LEFT OFF HERE
    //working on using the existing bars and resizing the 
    // for bars to bars we need to be useing 
    d3.selectAll(".bars")
      .transition()
        .duration(3000)
        .delay(11000)
        .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
        .attr("y", function(d) { return y(Math.abs(d.team2_prob - d.team1_prob)); })
        .attr("width", "4px")
        .attr("height", function(d) { return height - y(Math.abs(d.team2_prob - d.team1_prob)); });


    d3.selectAll(".bars")
      .transition()
        .duration(3000)
        .delay(10000)
        .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
        .attr("y", function(d) { return y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); })
        .attr("width", "4px")
        .attr("height", function(d) { return height - y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); });

    d3.selectAll(".axis--y")
      .transition()
        .duration(3000)
        .delay(10000)
        .call(d3.axisLeft(y3));

*/

/*

    var median = svg.append("line")
       .attr("x1", 0)
       .attr("y1", y(threshold))
       .attr("x2", width)
       .attr("y2", y(threshold))
       .attr("stroke-width", 2)
       .attr("stroke", "black");



   //draws rects against the axis
   g.append("g").selectAll("rect")
        .data(data)
      .enter().append("rect")
        .attr("class","bar1")
        .attr("class",d.game_row_id)
        .style("opacity",0)
        .style("fill","grey")
        .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
        .attr("y", function(d) { return y(Math.abs(d.team2_prob - d.team1_prob)); })
        .attr("width", "4px")
        .attr("height", function(d) { return height - y(Math.abs(d.team2_prob - d.team1_prob)); });

   //draws rects with new scale
   g.append("g").selectAll("rect")
        .data(data)
      .enter().append("rect")
        .attr("class","bar1")
        .style("opacity",.5)
        .style("fill","grey")
        .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
        .attr("y", function(d) { return y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); })
        .attr("width", "4px")
        .attr("height", function(d) { return height - y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); });
*/

/*

  team.append("path")
      .attr("id", d.team1_team_id + "|" + d.game_row_id)
      .attr("class", "line")
      .attr("d", function(d) { return line(d.team1_prob); })
      .style("stroke", "blue");

  city.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });
*/

};

/*
function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}
*/
