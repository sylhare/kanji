let frequencySizeAsc = (d) => d.frequency / 60;
let frequencySizeDsc = (d) => 5;
let numberSizeAsc = (d) => d.number;
let numberSizeDsc = (d) => 1 / d.number;


let currentSizeOrder = frequencySizeAsc;


frequency.addEventListener('click', () => {
  currentSizeOrder = setOrder(currentSizeOrder, frequencySizeDsc, frequencySizeAsc);
  updateSimulation();
});
