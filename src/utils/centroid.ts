export const polygonCentroid = (points: number[][]): number[] => {
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < points.length; i++) {
    const xi = points[i][0];
    const yi = points[i][1];
    const xiplus1 = points[(i + 1) % points.length][0];
    const yiplus1 = points[(i + 1) % points.length][1];
    const term = xi * yiplus1 - xiplus1 * yi;
    area += term;
    cx += (xi + xiplus1) * term;
    cy += (yi + yiplus1) * term;
  }

  area *= 0.5;
  cx = cx / (6 * area);
  cy = cy / (6 * area);

  return [cx, cy];
};
