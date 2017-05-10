var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 50, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("class","mainG").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    cg = svg.append("g").attr("class","mainCircleG").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

var tranTime = 1000;

var i = 0;
var m2 = 0; 
var m3 = 0;
var m4 = 0;

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
      .attr("id", "xLabel")
      .attr("y", 6)
      .attr("dx", width-(width*.1))
      .attr("dy", "3em")
      .attr("fill", "#000")
      .text("Game Time in Seconds ->");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("id", "yLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-4em")
      .attr("fill", "#000")
      .text("Win Probability, %");

  g.select(".axis--x")
    .append("text")
      .attr("id", "xLabel2")
      .attr("y", 6)
      .attr("dx", width-(width*.1))
      .attr("dy", "3em")
      .attr("fill", "#000")
      .text("Game Time in Seconds ->");

  g.append("g")
      .attr("class","lineM")
    .append("path")
      .attr("id","lineM1")
      .attr("stroke", function() { return z1("womens")})
      .attr("stroke-width", 2)
      .style("opacity",0)
      .attr("d", "M " + 0 + " " + y(0) + " L " + width + " " + y(0) + " Z");

  g.select(".lineM")
    .append("path")
      .attr("id","lineM2")
      .attr("stroke", function() { return z1("mens")})
      .attr("stroke-width", 2)
      .style("opacity",0)
      .attr("d", "M " + 0 + " " + y(0) + " L " + width + " " + y(0) + " Z");

  d3.select(".lineM")
    .append("text")
     .attr("id","lineMtext1")
     .attr("x", 0)
     .attr("y", y(0))
     .attr('text-anchor', 'left')
     .style("stroke", function() { return z1("womens")})
     .style("opacity",0)
     .style("font-size","smaller")
     .text("Median: " + 0)

  g.select(".lineM")
    .append("text")
     .attr("id","lineMtext2")
     .attr("x", 0)
     .attr("y", y(0))
     .attr('text-anchor', 'left')
     .style("stroke", function() { return z1("mens")})
     .style("opacity",0)
     .style("font-size","smaller")
     .text("Median: " + 0);


  //the two paths draw the lines
  var path1 = g.append("path")
      .datum(data)
      .attr("class","lineChart")
      .attr("fill", "none")
      .attr("stroke", "#767F8B")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

  var path2 = g.append("path")
      .datum(data)
      .attr("class","lineChart")
      .attr("fill", "none")
      .attr("stroke", "#D3D3D3")
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
          .duration(tranTime/2)
          .attr("stroke-dashoffset", 0)
        .transition()
          .delay(tranTime)
          .duration(tranTime)
          .style("opacity",0)
          .on("start",barTransition)
          .on("end",removeLineChart);
    }

    function barTransition() {
      d3.select("#approachHead")
        .transition()
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("Calculate Difference")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("Baseline and Calculate Median")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("Simplify Comparison Metric")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("Game Median")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("Plot Close Game Index")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("And Winning Score")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("Include All Games")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("The Result")
          .style("opacity",1);


      d3.select("#approach")
        .transition()
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("In order to do that, we start by calculating the difference between the two lines at each moment of data capture throughout the game.")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("The we calculate the median (to try and avoid skewing) across the difference for each moment in the game to come up with a 34.3% median in this example.")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("I felt it was hard to explain the median percentages, so I transposed them into a score I am calling the 'Close Game Index' shown below. This is simply 10 - (10*[Median Percent Difference]).")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("We take the median for this game")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("And plot it by close game index on the y-axis") 
          .style("opacity",1)          
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("And winning game score on the x-axis. We can now focus on the results with the simple thought of; the higher the close game index, the closer the game, the lower the close game index, the more lopsided the game was.")
          .style("opacity",1)
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("We do the same process for all tournament games in the past two years.") 
          .style("opacity",1)          
        .transition()
          .delay(tranTime)
          .duration(tranTime/2)
          .style("opacity",0)
        .transition()
          .duration(tranTime/2)
          .text("Overall, in the scatter plots, we see far more games with the close game index near 0 in the women's plot vs the men's plot. This brings the median below 1.5 vs the 2.9 median index we see for the men's games.")
          .style("opacity",1);

      //d3.select("#approach").transition().duration(tranTime).style("opacity",1);

      // this section will handle the bar transitions within the visualization after the line transitions have been executed
      d3.selectAll(".bars")
        .transition()
          .duration(tranTime)
          .style("opacity",.5)
        .transition()
          .delay(tranTime)
          .duration(tranTime)
          .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
          .attr("y", function(d) { return y(Math.abs(d.team2_prob - d.team1_prob)); })
          .attr("height", function(d) { return height - y(Math.abs(d.team2_prob - d.team1_prob)); })
          .on("start",updateMedian)
        .transition()
          .delay(tranTime)
          .duration(tranTime)
          .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
          .attr("y", function(d) { return y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); })
          .attr("height", function(d) { return height - y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); })
          .on("start",updateMedian2) //updateAxis
        .transition()
          .delay(tranTime)
          .duration(tranTime)
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
          .delay(tranTime)
          .duration(tranTime)
          .style("opacity",0)
          .attr("d", "M " + x(1200) + " " + y3(yMedianValue) + " L " + x(1200) + " " + y3(yMedianValue) + " Z");

      d3.selectAll(".lineM text")
        .transition()
          .delay(tranTime)
          .duration(tranTime)
          .style("opacity",0);

      //clean out data and remove bars
      d3.selectAll(".bars").data([]).exit().remove(); // clean out dom elements


      //left off here, we have some more work around the axis updates (which were taking long time) and splitting the median line into two 
      if (i == 1)
      {
        console.log("in if statement");
        cg.selectAll("circle")
          .data(mData)
        .enter().append("circle")
          .attr("class","circles")
          .attr("id",function(d) {return "g" + d.id;})
          .style("opacity",0)
          .style("stroke", function(d) { return z1(d.gender); })
          .style("fill", function(d) { return z1(d.gender); })
          .attr("cx", function(d) { return x(1200); })
          .attr("cy", function(d) { return y3(yMedianValue); })
          .attr("r", 0)
          .transition()
          .duration(tranTime)
          .attr("r",0)
          .on("start", function(d) { 
            cg.select("#g400946603")
              .transition()
                .delay(tranTime)
                .duration(tranTime)
                .attr("r",15)
                .style("opacity",.75)
                .on("end", function(d) {
                  cg.selectAll("circle")
                    .transition()
                      .delay(tranTime)
                      .duration(tranTime)
                      .delay(tranTime)
                      .attr("cx", function(d) { if (d.gender == "mens") {return x2(d.higherScore);} else {return x2(d.higherScore+d3.extent(mData, function(d) {return d.higherScore;})[1]-30);}; })
                      .attr("cy", function(d) { return y3(d.closeGameIndex); })
                      .attr("r", 5)
                      .style("stroke", function(d) { return z1(d.gender); })
                      .style("fill", function(d) { return z1(d.gender); })
                      .on("start", updateXAxis)
                      .transition()
                        .delay(tranTime)
                        .duration(tranTime*2)
                        .style("opacity",.5) 
                        .on("end",updateMedian3);        
              })
          })
      }


    }

    function updateAxis() {
      d3.selectAll(".axis--y")
        .transition()
          .duration(tranTime)
          .call(d3.axisLeft(y3));

      d3.select("#yLabel")
        .text("Close Game Index");
    }

    function updateXAxis() {
      m4++;
      if (m4==1) {
        d3.selectAll(".axis--x .tick")
          .transition()
            .duration(tranTime)
            .style("opacity",0)
            .on("start",function() {
              d3.select("#xLabel")
                .transition()
                  .duration(tranTime)
                  .attr("dx", x(600))
                  .attr("dy", "1em")
                  .text("Higher Winning Score->")
                  .style("opacity",1)
                  .on("start",function(){
                    d3.select("#xLabel2")
                      .transition()
                        .duration(tranTime)
                        .attr("dx", x(1800))
                        .attr("dy", "1em")
                        .text("Higher Winning Score->")
                        .style("opacity",1);
                })
            })
            //.call(d3.axisBottom(x2));
      }
    }

    function removeLineChart() {
      d3.selectAll(".lineChart").data([]).exit().remove();
    }

    function updateMedian() {
      var yMedianValue = d3.median(data, function(d) { return Math.abs(d.team2_prob - d.team1_prob); });

      var f = d3.format(".1f");

      d3.selectAll(".lineM #lineM1")
        .transition()
          .duration(tranTime)
          .style("opacity",.75)
          .attr("d", "M " + 0 + " " + y(yMedianValue) + " L " + width + " " + y(yMedianValue) + " Z");

      d3.selectAll(".lineM #lineMtext1")
        .transition()
          .duration(tranTime)
          .style("opacity",.75)
          .attr("x", 10)
          .attr("y", y(yMedianValue+.02))
          .text("Median: " + f(yMedianValue*100) + "%");
    }

    function updateMedian2() {
      var yMedianValue = d3.median(data, function(d) { return 10-(10*(Math.abs(d.team2_prob - d.team1_prob))); });

      var f = d3.format(".1f");
      m2++;

      if (m2 == 1) {
        updateAxis();        

        d3.selectAll(".lineM #lineM1")
          .transition()
            .duration(tranTime)
            .attr("d", "M " + 0 + " " + y3(yMedianValue) + " L " + width + " " + y3(yMedianValue) + " Z");

        d3.selectAll(".lineM #lineMtext1")
          .transition()
            .duration(tranTime) 
            .attr("x", x(1100))
            .attr("y", y3(yMedianValue+.1))
            .text("Median: " + f(yMedianValue));
      }
    }

    function updateMedian3() {
      m3++;
      if (m3 == 1) {

        var yMedianValueM = d3.median(mData, function(d) { if (d.gender == "mens") {return d.closeGameIndex}; });
        var yMedianValueW = d3.median(mData, function(d) { if (d.gender == "womens") {return d.closeGameIndex}; });
        var f = d3.format(".1f");

        d3.select(".lineM #lineM2").attr("d", "M " + width/2 + " " + y3(yMedianValueM) + " L " + width/2 + " " + y3(yMedianValueM) + " Z");
        d3.select(".lineM #lineM1").attr("d", "M " + width + " " + y3(yMedianValueW) + " L " + width + " " + y3(yMedianValueW) + " Z");

        d3.select(".lineM #lineM2")
          .transition()
            .duration(tranTime)
            .style("opacity",.75)
            .attr("d", "M " + 0 + " " + y3(yMedianValueM) + " L " + ((width/2)-20) + " " + y3(yMedianValueM) + " Z")
            .on("start",function(d) {
              d3.select(".lineM #lineM1")
                .transition()
                  .duration(tranTime)
                  .style("opacity",.75)
                  .attr("d", "M " + ((width/2)+20) + " " + y3(yMedianValueW) + " L " + width + " " + y3(yMedianValueW) + " Z");
            })


        d3.selectAll(".lineM #lineMtext2")
          .attr("x", x(950))
          .attr("y", y3(yMedianValueM+.1))
          .transition()
            .duration(tranTime) 
            .style("opacity",.75)
            .text("Mens: " + f(yMedianValueM));

        d3.selectAll(".lineM #lineMtext1")
          .attr("x", x(2150))
          .attr("y", y3(yMedianValueW+.1))
          .transition()
            .duration(tranTime) 
            .style("opacity",.75)
            .text("Womens: " + f(yMedianValueW));
      }
    }

};
