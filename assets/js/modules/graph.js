const width = window.innerWidth || 900, height = 900;
let graph, store;
let defaultSize = 12;
let graphFilterList = [];

let svg = d3.select("#graph-kanji")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let tooltip = d3.select("#graph-kanji")
  .append("div")
  .attr("class", "tooltip")
  .text("default text to be overridden");

let color = d3.scaleOrdinal(d3.schemeCategory20);

let node = svg.append("g")
  .attr("class", "nodes")
  .selectAll("g");

let simulation = d3.forceSimulation();

d3.json(jsonUrl, function(error, g) {
  if (error) throw error;

  graph = g;
  store = Object.assign({}, {}, g);
  updateSimulation();
});

function updateSimulation() {

  node = node.data(graph.nodes, (d) => (d.id));
  node.exit().remove();

  let newNode = node.enter().append("g")
    .attr("class", "node")
    .on("mouseover", (d) => (tooltip.style("visibility", "visible").text(kanjiLabel(d))))
    .on("mousemove", () => (tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px")))
    .on("mouseout", () => (tooltip.style("visibility", "hidden")));

  let circles = newNode.append("circle")
    .attr("class", function(d) { return d.group } )
    .attr("r", size(defaultSize))
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  let nodeName = newNode.append("text")
    .attr("class", "kanji")
    .attr('x', -8)
    .attr('y', 6)
    .text((d) => (d.name));

  let titles = newNode.append("title")
    .text((d) => (d.name));

  node = node.merge(newNode);

  setupSimulation();
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

function filterSimulation() {
  store.nodes.forEach(function(n) {
    // Add back filtered items to the graph
    if (n.isFilteredOut && !graphFilterList.includes(n.group)) {
      n.isFilteredOut = false;
      graph.nodes.push(Object.assign({}, {}, n));
    }
    // mark filtered items
    n.isFilteredOut = graphFilterList.includes(n.group);
  });

  graph.nodes = store.nodes.filter((n) => !n.isFilteredOut);
}

function size(defaultSize) {
  return function (d) {
    return defaultSize + currentSizeOrder(d);
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

function setupSimulation() {
  simulation
    .nodes(graph.nodes)
    .force("center", d3.forceCenter().x(width / 2).y(height / 2))
    .force("link", d3.forceLink()) // Acts on the link of the graph
    .force("charge", d3.forceManyBodyReuse() // Acts on the node of the graph (attraction of nodes)
      .strength(0.001))
    .force("collide", d3.forceCollide()
      .strength(1)
      .radius(size(defaultSize + 1)) // Acts on the node of the graph (avoid collapsing)
      .iterations(8))
    .force("x", d3.forceX().strength(width < 700 ? .2 * height / width : 0.05)) // Acts as gravity on nodes (display in canvas)
    .force("y", d3.forceY().strength(width < 700 ? .16 * width / height : 0.05))
    .on("tick", () => ticked(node));
}

function ticked(node) {
  node
    .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
}
