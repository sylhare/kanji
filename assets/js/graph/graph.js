var width = 900, height = 680;

var svg = d3.select("#graph-kanji")
  .attr("width", width)
  .attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);


var simulation = d3.forceSimulation()
  .force("link", d3
    .forceLink()
    .id(function(d) { return d.id; })
    .distance(frequencySize(14)))
  .force("charge", d3
    .forceManyBody()
    .strength(10)
    .distanceMin(60)
    .distanceMax(600))
  .force("collide",d3.forceCollide()
    .radius(frequencySize(14))
    .iterations(32))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("x", d3.forceX())
  .force("y", d3.forceY())
  .velocityDecay(0.4)
  .alphaTarget(0.1);

d3.json(jsonUrl, function(error, graph) {
  if (error) throw error;

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return 1; });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g");

  // Circles
  node.append("circle")
    .attr("class", function(d) { return d.group } )
    //.attr("fill", function(d) { return color(d.group); })
    //.attr("r", 5)
    .attr("r", frequencySize(12))
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Labels
  node.append("text")
//    .filter(function(d) {return d.frequency > 100 || d.connections;})
    .attr('x', -8)
    .attr('y', 6)
    .text(function(d) {return d.name;});

  node.append("title")
    .text(function(d) { return d.name; });

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);

  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
  }
});

function frequencySize(size) {
  return function (d) {
    return size + d.frequency / 60;
  };
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// https://bl.ocks.org/mbostock/3231298
// https://github.com/d3/d3-force
