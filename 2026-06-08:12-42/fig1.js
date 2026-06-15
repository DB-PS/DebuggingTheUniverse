// Setup 2D view
mathbox.camera({ proxy: true, position: [0, 0, 2] });
const view = mathbox.cartesian({
  range: [[-1.3, 1.3], [-1.3, 1.3]],
  scale: [1, 1],
});

// Draw axes and grid
view.axis({ axis: 1, width: 2, color: 'gray' });
view.axis({ axis: 2, width: 2, color: 'gray' });
view.grid({ width: 1, divideX: 6, divideY: 6, opacity: 0.3 });

// Reusable smooth rotation function
// Holds for a duration, then smoothly transitions over a set time.
function getSmoothAngle(time) {
  const cycleDuration = 3.0; // Total time per cycle
  const animDuration = 0.8;  // Time spent actively rotating
  const piOver2 = Math.PI / 2;
  
  // Current cycle number (0, 1, 2...)
  const cycle = Math.floor(time / cycleDuration);
  // Time within the current cycle
  const localTime = time % cycleDuration;
  
  // Base angle for the current cycle
  let angle = cycle * piOver2;
  
  // If we are in the active animation window at the end of the cycle
  const holdDuration = cycleDuration - animDuration;
  if (localTime > holdDuration) {
    // Normalize time within the animation window (0.0 to 1.0)
    let t = (localTime - holdDuration) / animDuration;
    // Smooth step easing (ease-in-out)
    t = t * t * (3 - 2 * t);
    // Add the interpolated rotation
    angle += t * piOver2;
  }
  
  return angle;
}

// Dynamic calculation for the square edges
view.array({
  width: 5,
  channels: 2,
  expr: function (emit, i, time) {
    const pts = [
      [1, 1], [-1, 1], [-1, -1], [1, -1], [1, 1]
    ];
    const angle = getSmoothAngle(time);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const px = pts[i][0];
    const py = pts[i][1];

    const nx = px * cosA - py * sinA;
    const ny = px * sinA + py * cosA;

    emit(nx, ny);
  }
});

// Draw edges
view.line({
  color: '#268bd2',
  width: 5,
  join: 'round',
});

// Draw nodes (points) using the same array data
view.point({
  color: '#cb4b16',
  size: 15,
});

// Dynamic calculation for the labels
view.array({
  width: 4,
  channels: 2,
  expr: function (emit, i, time) {
    const lbls = [
      [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1]
    ];
    const angle = getSmoothAngle(time);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const px = lbls[i][0];
    const py = lbls[i][1];

    const nx = px * cosA - py * sinA;
    const ny = px * sinA + py * cosA;

    emit(nx, ny);
  }
});

view.text({
  data: ['A', 'B', 'C', 'D'],
});

view.label({
  color: '#cb4b16',
  size: 36,
  offset: [0, 0],
  outline: 0,
  background: 'transparent',
});
