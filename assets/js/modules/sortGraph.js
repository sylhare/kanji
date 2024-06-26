const defaultSize = 12;
let frequencySizeAsc = (d) => d.frequency / 60;
let frequencySizeDsc = (d) => 130 / d.frequency > 50 ? 50 : 130 / d.frequency;
let numberSizeAsc = (d) => d.number / 10;
let numberSizeDsc = (d) => (215 - d.number) / 10;
let readingSizeAsc = (d) => 10 ;
let readingSizeDsc = (d) => 10 ;
let categorySizeAsc = (d) => 10;
let categorySizeDsc = (d) => 10 ;


function size(defaultSize) {
  return function (d) {
    return defaultSize + currentSizeOrder(d);
  };
}

function updateNodeSize() {
  d3.selectAll("g").select("circle").attr("r", size(defaultSize));
}

function graphSortHandler(sortDsc, sortAsc) {
  currentSizeOrder = setOrder(currentSizeOrder, sortDsc, sortAsc);
  updateSimulation();
  updateNodeSize();
}

let currentSizeOrder = frequencySizeAsc;

frequency.addEventListener('click', () => {
  graphSortHandler(frequencySizeDsc, frequencySizeAsc)
});


number.addEventListener('click', () => {
  graphSortHandler(numberSizeDsc, numberSizeAsc)
});

category.addEventListener('click', () => {
  graphSortHandler(categorySizeAsc, categorySizeDsc)
});

reading.addEventListener('click', () => {
  graphSortHandler(readingSizeAsc, readingSizeDsc)
});
