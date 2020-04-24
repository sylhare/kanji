let frequencySizeAsc = (d) => d.frequency / 60;
let frequencySizeDsc = (d) => 60 / d.frequency;
let numberSizeAsc = (d) => d.number;
let numberSizeDsc = (d) => 1 / d.number;


let currentSizeOrder = frequencySizeAsc;
