var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 50, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height, 0]),
    y3 = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    //.curve(d3.curveBasis)
    .x(function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
    .y(function(d) { return y(d.team1_prob); });

var line2 = d3.line()
    //.curve(d3.curveBasis)
    .x(function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
    .y(function(d) { return y(d.team2_prob); });


d3.json("data\\gamedata.json", function(error, data) {
  if (error) throw error;

  console.log(data);

  x.domain(d3.extent(data, function(d) { return (600-d.game_time+((d.quarter-1)*600)); }));

  y.domain([0.00,1.00]);
  y2.domain([1.00,0.00]);
  y3.domain([0.00,10.00]);

  //z.domain(cities.map(function(c) { return c.id; }));

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
      .attr("y", 6)
      .attr("dx", width-(width*.05))
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

  //the two paths draw the lines
  var path1 = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

  var path2 = g.append("path")
      .datum(data)
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
        .attr("width", "4px")
        .attr("height", function(d) { return y2(d.team1_prob > d.team2_prob ? d.team1_prob-d.team2_prob : d.team2_prob-d.team1_prob); });

   var totalLength = path1.node().getTotalLength();

    d3.selectAll("path")
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)
        .tween("lines",function () {
          return function (t) {
              // run lines across the screen
              d3.selectAll("path").attr("stroke-dashoffset", totalLength*(1-t));
          }
        }).each("end", function () {
          d3.transition()
            .duration(2000)
            .tween("hideLines",function () {
              return function (t) {
                d3.selectAll("path").style("opacity",1-t);
              }
            })
        });
/*

    path2
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0);


    d3.selectAll("path")
      .transition()
        .duration(2000)
        .delay(10000)
        .style("opacity",0);



    d3.selectAll("path")
      .transition()
        .duration(2000)
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
        .delay(15000)
        .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
        .attr("y", function(d) { return y(Math.abs(d.team2_prob - d.team1_prob)); })
        .attr("width", "4px")
        .attr("height", function(d) { return height - y(Math.abs(d.team2_prob - d.team1_prob)); });


    d3.selectAll(".bars")
      .transition()
        .duration(3000)
        .delay(20000)
        .attr("x", function(d) { return x((600-d.game_time+((d.quarter-1)*600))); })
        .attr("y", function(d) { return y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); })
        .attr("width", "4px")
        .attr("height", function(d) { return height - y3(10-(10*(Math.abs(d.team2_prob - d.team1_prob)))); });

    d3.selectAll(".axis--y")
      .transition()
        .duration(3000)
        .delay(20000)
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

});

/*
function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}
*/
