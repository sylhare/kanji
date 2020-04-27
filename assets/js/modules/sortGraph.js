const defaultSize = 12;
let frequencySizeAsc = (d) => d.frequency / 60;
let frequencySizeDsc = (d) => 5;
let numberSizeAsc = (d) => d.number;
let numberSizeDsc = (d) => 1 / d.number;


function size(defaultSize) {
  return function (d) {
    return defaultSize + currentSizeOrder(d);
  };
}

function updateNodeSize() {
  d3.selectAll("g").select("circle").attr("r", size(defaultSize));
}

let currentSizeOrder = frequencySizeAsc;


frequency.addEventListener('click', () => {
  currentSizeOrder = setOrder(currentSizeOrder, frequencySizeDsc, frequencySizeAsc);
  updateSimulation();
  updateNodeSize();
});
