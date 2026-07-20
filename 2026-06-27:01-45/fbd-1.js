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
const l = 1.2
const x_off = 1.35
const vs = 0.25
//:::CONSTANTS:::

//===LEFT BLOCK===
view.array({
  width: 5,
  channels: 2,
  data: square(x_off, l/2, l)
})
view.line({
  color: '#cb4b16',
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
  color: '#268bd2',
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
  data: [[x_off, l/2], [x_off + l/2 + vs, l/2]]
})
view.vector({
  color: '#268bd2',
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
  color: '#cb4b16',
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
    emit(el('latex', { color: '#cb4b16', fontSize: '1.1em' }, 'kx_1'));
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
  data: [x_off + l/2 + vs, l/2],
  live: false,
})
.html({
  width: 1,
  expr: function(emit, el) {
    emit(el('latex', { color: '#cb4b16', fontSize: '1.1em' }, '-k(x_1 - x_2)'));
  },
})
.dom({
  size: 20,
  offset: [0, 40],
  depth: 0,
  zoom: 1,
});


function spring(begin, end, divide, height) {
  let [delx, dely] = [end.x - begin.x, end.y - begin.y]

  let r = Math.sqrt(delx ** 2 + dely ** 2)
  let spacing = r / divide

  let dir = [delx/r, dely/r]
  let norm = [-dely/r, delx/r]

  let base = []
  let result = []

  result.push([begin.x, begin.y])
  for (let i = 1; i < divide; ++i) {
    let osc = Math.round(Math.sin(Math.PI * i / 2))

    base = [dir[0]*i*spacing, dir[1]*i*spacing]
    result.push([
      begin.x + base[0]+norm[0]*height*osc,
      begin.y + base[1]+norm[1]*height*osc
    ])
  }
  result.pop()
  result.push([end.x, end.y])
  return result
}

function square(x, y, r) {
  return [
    [x + r/2, y + r/2],
    [x - r/2, y + r/2],
    [x - r/2, y - r/2],
    [x + r/2, y - r/2],
    [x + r/2, y + r/2],
  ]
}
