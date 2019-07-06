const drop_elements = document.getElementsByClassName('droppable');

const droppables = [];

// skip the first
for (let i = 1; i < drop_elements.length; i++) {
  droppables.push(drop_elements[i]);
}

dragula([drop_elements[0]], {
  copy: true
});

dragula(droppables);

console.log('hey');
