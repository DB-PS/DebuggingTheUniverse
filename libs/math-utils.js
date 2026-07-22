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
