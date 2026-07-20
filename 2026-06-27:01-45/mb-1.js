mathbox.camera({ proxy: true, position: [0.8, 0.1, 2] });
if (mathbox.three.controls) {
  mathbox.three.controls.target.set(0.8, 0.1, 0);
  mathbox.three.controls.update();
}
const view = mathbox.cartesian({
  range: [[0, 1.5], [0, 1.5]],
  scale: [1, 1],
});

//===WALLS===
view.array({
  width: 2,
  channels: 2,
  data: [[0, 0], [2.7, 0]],
})
view.line({
  color: 'gray',
  width: 5,
});

view.array({
  width: 2,
  channels: 2,
  data: [[0, 0], [0, 4]],
})
view.line({
  color: 'gray',
  width: 5,
});

view.array({
  width: 2,
  channels: 2,
  data: [[2.7, 0], [2.7, 4]],
})
view.line({
  color: 'gray',
  width: 5,
});
//:::WALLS:::

//===CONSTANTS===
const l = .6
const x_off = .75
//:::CONSTANTS:::

//===LEFT BLOCK===
view.array({
  width: 5,
  channels: 2,
  expr: function (emit, i, time) {
    dx = 0.1*Math.sin(2*Math.PI*time)
    let verts = square(x_off + dx, l/2, l)
    emit(verts[i][0], verts[i][1])
  }
})
view.line({
  color: '#cb4b16',
  stroke: 'solid',
  width: 5,
  join: 'round',
});
//:::LEFT BLOCK:::

//===RIGHT BLOCK===
view.array({
  width: 5,
  channels: 2,
  expr: function (emit, i, time) {
    dx = 0.1*Math.sin(2*Math.PI*time)
    let verts = square(2.7 - x_off - dx, l/2, l)
    emit(verts[i][0], verts[i][1])
  }
})
view.line({
  color: '#cb4b16',
  stroke: 'solid',
  width: 5,
  join: 'round',
});
//:::RIGHT BLOCK:::

//===LEFT SPRING===
view.array({
  width: 21,
  channels: 2,
  expr: function (emit, i, time) {
    dx = 0.1*Math.sin(2*Math.PI*time)
    let verts = spring({x: 0, y: l/2}, {x: x_off-l/2+dx, y: l/2}, 21, 0.08)
    emit(verts[i][0], verts[i][1])
  }
})
view.line({
  color: '#268bd2',
  stroke: 'solid',
  width: 5,
});
//:::LEFT SPRING:::

//===RIGHT SPRING===
view.array({
  width: 21,
  channels: 2,
  expr: function (emit, i, time) {
    dx = 0.1*Math.sin(2*Math.PI*time)
    let verts = spring({x: 2.7, y: l/2}, {x: 2.7-x_off+l/2-dx, y: l/2}, 21, 0.08)
    emit(verts[i][0], verts[i][1])
  }
})
view.line({
  color: '#268bd2',
  stroke: 'solid',
  width: 5,
});
//:::RIGHT SPRING:::

//===CENTRE SPRING===
view.array({
  width: 21,
  channels: 2,
  expr: function (emit, i, time) {
    dx = 0.1*Math.sin(2*Math.PI*time)
    let verts = spring({x: x_off+l/2+dx, y: l/2}, {x: 2.7-x_off-l/2-dx, y: l/2}, 21, 0.08)
    emit(verts[i][0], verts[i][1])
  }
})
view.line({
  color: '#268bd2',
  stroke: 'solid',
  width: 5,
});
//:::CENTRE SPRING:::



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
