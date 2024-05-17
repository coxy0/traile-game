export const dist = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export const closestPoints = (
  points1: number[][],
  points2: number[][]
): number[] => {
  let minDistance = Number.MAX_VALUE;
  let closestPoints: number[] = [];

  for (let i = 0; i < points1.length; i++) {
    const [x1, y1] = points1[i];

    for (let j = 0; j < points2.length; j++) {
      const [x2, y2] = points2[j];

      const distance = dist(x1, y1, x2, y2);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoints = [x1, y1, x2, y2];
      }
    }
  }

  return closestPoints;
};

export const touching = (points1: number[][], points2: number[][]): boolean => {
  const [x1, y1, x2, y2] = closestPoints(points1, points2);
  return dist(x1, y1, x2, y2) === 0;
};
