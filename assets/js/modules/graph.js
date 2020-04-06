var width = window.innerWidth|| 900, height = 700;
var graph, store;
var graphFilterList = [];

var svg = d3.select("#graph-kanji")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);


var simulation = d3.forceSimulation()
  .force("link", d3.forceLink() // Acts on the link of the graph
    .id(function(d) { return d.id; })
    .distance(14))
  .force("charge", d3.forceManyBody()
    .strength(10)
    .distanceMin(60)
    .distanceMax(600))
  .force("collide",d3.forceCollide() // Acts on the node of the graph
    .radius(frequencySize(13))
    .iterations(32))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("x", d3.forceX())
  .force("y", d3.forceY());

d3.json(jsonUrl, function(error, g) {
  if (error) throw error;

  graph = g;
  store = Object.assign({}, {}, g);
  updateSimulation();

});

function frequencySize(size) {
  return function (d) {
    return size + d.frequency / 60;
  };
}

function kanjiLabel(d) {
  return d.name.concat(" - ", d.reading, " - ", d.meaning);
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

function ticked(link, node) {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
}


function updateSimulation() {

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
    .enter().append("g")
    .attr("class", "node")
    .on("mouseover", function(d) {return tooltip.style("visibility", "visible").text(kanjiLabel(d))})
    .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  var circles = node.append("circle")
    .attr("class", function(d) { return d.group } )
    .attr("r", frequencySize(12))
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  var tooltip = d3.select("#graph-kanji")
    .append("div")
    .attr("class", "tooltip")
    .text("default text to be overridden");

  var nodeName = node.append("text")
    .attr("class", "kanji")
    .attr('x', -8)
    .attr('y', 6)
    .text(function(d) {return d.name;});

  var titles = node.append("title")
    .text(function (d) { return d.name });

  simulation
    .nodes(graph.nodes)
    .on("tick", function() {return ticked(link, node);});

  simulation.force("link")
    .links(graph.links);

  simulation.alpha(0.3).alphaTarget(0).restart();
}

function filterGraph(category) {
  if (graphFilterList.includes(category)) {
    graphFilterList.splice(graphFilterList.indexOf(category), 1)
  } else {
    graphFilterList.push(category)
  }
  filterSimulation();
  updateSimulation();
}

//	filter function
function filterSimulation() {
  //	add and remove nodes from data based on type filters
  store.nodes.forEach(function(n) {
    if (!graphFilterList.includes(n.group) && n.filtered) {
      n.filtered = false;
      graph.nodes.push(Object.assign({}, {}, n));
    } else if (graphFilterList.includes(n.group) && !n.filtered) {
      n.filtered = true;
      graph.nodes.forEach(function(d, i) {
        if (n.id === d.id) {
          console.log("id: ".concat(i, "--", n.id, "-", n.name, " ", d.id, "-", d.name));
          graph.nodes.splice(i + 1, 1);
        }
      });
    }
  });
}
