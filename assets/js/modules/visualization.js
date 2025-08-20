// ========================================
// VISUALIZATION - D3 AND GRAPH FUNCTIONALITY
// ========================================

import { formatKanjiTooltip } from './utils.js';
import { 
  toggleCategoryInFilter, 
  restoreFilteredNodes,
  defaultSize,
  frequencySizeAsc, 
  frequencySizeDsc, 
  numberSizeAsc, 
  numberSizeDsc, 
  readingSizeAsc, 
  readingSizeDsc, 
  categorySizeAsc, 
  categorySizeDsc
} from './dataUtils.js';
import { setOrder } from './utils.js';

// ========================================
// D3 GRAPH SETUP AND CONFIGURATION
// ========================================

const width = window.innerWidth || 900, height = 900;
let graph, store;
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

// ========================================
// GRAPH DATA LOADING AND INITIALIZATION
// ========================================

d3.json(jsonUrl, function(error, g) {
  if (error) throw error;

  graph = g;
  store = Object.assign({}, {}, g);
  updateSimulation();
});

// ========================================
// GRAPH RENDERING AND SIMULATION
// ========================================

export function updateSimulation() {
  node = node.data(graph.nodes, (d) => (d.id));
  node.exit().remove();

  let newNode = node.enter().append("g")
    .attr("class", "node")
    .on("mouseover", (d) => (tooltip.style("visibility", "visible").text(formatKanjiTooltip(d))))
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

export function filterGraph(category) {
  graphFilterList = toggleCategoryInFilter(category, graphFilterList);
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

// ========================================
// D3 DRAG FUNCTIONALITY
// ========================================

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

// ========================================
// SIMULATION SETUP AND PHYSICS
// ========================================

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

// ========================================
// GRAPH NODE SIZING FUNCTIONALITY
// ========================================

let currentSizeOrder = frequencySizeAsc;

function size(defaultSize) {
  return function (d) {
    return defaultSize + currentSizeOrder(d);
  };
}

export function updateNodeSize() {
  d3.selectAll("g").select("circle").attr("r", size(defaultSize));
}

export function graphSortHandler(sortDsc, sortAsc) {
  currentSizeOrder = setOrder(currentSizeOrder, sortDsc, sortAsc);
  updateSimulation();
  updateNodeSize();
}

// ========================================
// GRAPH SORTING EVENT HANDLERS
// ========================================

// Get references to sort buttons (these should be available globally)
const frequency = document.getElementById('Frequency-sort');
const number = document.getElementById('Number-sort');
const category = document.getElementById('Category-sort');
const reading = document.getElementById('Reading-sort');

if (frequency) {
  frequency.addEventListener('click', () => {
    graphSortHandler(frequencySizeDsc, frequencySizeAsc)
  });
}

if (number) {
  number.addEventListener('click', () => {
    graphSortHandler(numberSizeDsc, numberSizeAsc)
  });
}

if (category) {
  category.addEventListener('click', () => {
    graphSortHandler(categorySizeAsc, categorySizeDsc)
  });
}

if (reading) {
  reading.addEventListener('click', () => {
    graphSortHandler(readingSizeAsc, readingSizeDsc)
  });
}

// ========================================
// LAZY LOADING FUNCTIONALITY
// ========================================

import { 
  shouldLoadImage, 
  getUpdatedImageAttributes, 
  removeLoadedImage, 
  isLazyLoadingComplete,
  createThrottledFunction 
} from './utils.js';

// Lazy load implementation
document.addEventListener("DOMContentLoaded", function () {
  let lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    lazyloadFallback(lazyImages);
  }
});

function lazyloadFallback(lazyImages) {
  const lazyLoad = createThrottledFunction(() => {
    lazyImages.forEach(function (lazyImage) {
      if (shouldLoadImage(lazyImage)) {
        const { src, srcset } = getUpdatedImageAttributes(lazyImage);
        lazyImage.src = src;
        lazyImage.srcset = srcset;
        lazyImage.classList.remove("lazy");

        lazyImages = removeLoadedImage(lazyImages, lazyImage);

        if (isLazyLoadingComplete(lazyImages)) {
          document.removeEventListener("scroll", lazyLoad);
          window.removeEventListener("resize", lazyLoad);
          window.removeEventListener("orientationchange", lazyLoad);
        }
      }
    });
  }, 200);

  document.addEventListener("scroll", lazyLoad);
  window.addEventListener("resize", lazyLoad);
  window.addEventListener("orientationchange", lazyLoad);
}

// ========================================
// EXPORTS
// ========================================

export { graphFilterList, graph, store, simulation };

// Make filterGraph available globally for UI module
window.filterGraph = filterGraph;
