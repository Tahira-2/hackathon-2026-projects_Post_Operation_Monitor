/**
 * Calculates the angle between three 2D points.
 * B is the vertex.
 * 
 * @param {Object} A - First point {x, y}
 * @param {Object} B - Vertex point {x, y}
 * @param {Object} C - Second point {x, y}
 * @returns {number} The angle in degrees (0-180)
 */
export const calculateAngle = (A, B, C) => {
  if (!A || !B || !C) return 0;

  let radians = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return angle;
};
