mathbox.camera({ proxy: true, position: [0.8, 0.1, 2] });
if (mathbox.three.controls) {
  mathbox.three.controls.target.set(0.8, 0.1, 0);
  mathbox.three.controls.update();
}
const view = mathbox.cartesian({
  range: [[0, 1.5], [0, 1.5]],
  scale: [1, 1],
});

//===CONSTANTS===
const l = .6
const x_off = .75
const vs = 0.2
//:::CONSTANTS:::

//===LEFT BLOCK===
view.array({
  width: 5,
  channels: 2,
  data: square(x_off, l/2, l)
})
view.line({
  color: ORANGE,
  stroke: 'solid',
  width: 5,
  join: 'round',
});
//:::LEFT BLOCK:::

//===SPRING 1 FORCE===
view.array({
  items: 2,
  channels: 2,
  data: [[x_off, l/2], [x_off - l/2 - 1.5*vs, l/2]]
})
view.vector({
  color: BLUE,
  width: 5,
  start: false,
  end: true,
  size: 4
});
//:::SPRING 1 FORCE:::

//===SPRING 2 FORCE===
view.array({
  items: 2,
  channels: 2,
  data: [[x_off, l/2], [x_off - l/2 - vs, l/2]]
})
view.vector({
  color: GREEN,
  width: 5,
  start: false,
  end: true,
  size: 4
});
//:::SPRING 2 FORCE:::

view.array({
  items: 1,
  channels: 2,
  data: [x_off, l/2]
})
view.point({
  color: ORANGE,
  size: 15,
});

view.array({
  width: 1,
  channels: 2,
  data: [x_off - l/2 - vs, l/2],
  live: false,
})
.html({
  width: 1,
  expr: function(emit, el) {
    emit(el('latex', { color: BLUE, fontSize: '1.1em' }, 'kx_1'));
  },
})
.dom({
  size: 20,
  offset: [0, 40],
  depth: 0,
  zoom: 1,
});

view.array({
  width: 1,
  channels: 2,
  data: [x_off - l/2 - vs, l/2],
  live: false,
})
.html({
  width: 1,
  expr: function(emit, el) {
    emit(el('latex', { color: GREEN, fontSize: '1.1em' }, 'k(x_1 - x_2)'));
  },
})
.dom({
  size: 20,
  offset: [0, -40],
  depth: 0,
  zoom: 1,
});

//===RIGHT BLOCK===
view.array({
  width: 5,
  channels: 2,
  data: square(2.7 - x_off, l/2, l)
})
view.line({
  color: ORANGE,
  stroke: 'solid',
  width: 5,
  join: 'round',
});
//:::RIGHT BLOCK:::

//===SPRING 2 FORCE===
view.array({
  items: 2,
  channels: 2,
  data: [[2.7 - x_off, l/2], [2.7 - x_off - l/2 - 1.5*vs, l/2]]
})
view.vector({
  color: BLUE,
  width: 5,
  start: false,
  end: true,
  size: 4
});
//:::SPRING 2 FORCE:::

//===SPRING 3 FORCE===
view.array({
  items: 2,
  channels: 2,
  data: [[2.7 - x_off, l/2], [2.7 - x_off + l/2 + vs, l/2]]
})
view.vector({
  color: GREEN,
  width: 5,
  start: false,
  end: true,
  size: 4
});
//:::SPRING 3 FORCE:::

view.array({
  items: 1,
  channels: 2,
  data: [2.7 - x_off, l/2]
})
view.point({
  color: ORANGE,
  size: 15,
});

view.array({
  width: 1,
  channels: 2,
  data: [2.7 - x_off + l/2 + vs, l/2],
  live: false,
})
.html({
  width: 1,
  expr: function(emit, el) {
    emit(el('latex', { color: GREEN, fontSize: '1.1em' }, 'k(x_1 - x_2)'));
  },
})
.dom({
  size: 20,
  offset: [10, 40],
  depth: 0,
  zoom: 1,
});

view.array({
  width: 1,
  channels: 2,
  data: [2.7 - x_off - l/2 - vs, l/2],
  live: false,
})
.html({
  width: 1,
  expr: function(emit, el) {
    emit(el('latex', { color: BLUE, fontSize: '1.1em' }, 'kx_2'));
  },
})
.dom({
  size: 20,
  offset: [0, -40],
  depth: 0,
  zoom: 1,
});

