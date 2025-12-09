// Vertex shader for instanced grass billboards
// Implements camera-facing rotation with Y-axis locking
// Note: cameraPosition is provided by THREE.js automatically

// Per-instance attributes
attribute vec3 instanceColor;
attribute float instanceOpacity;
attribute float instanceScale;

// Varying variables to pass to fragment shader
varying vec2 vUv;
varying vec3 vColor;
varying float vOpacity;

void main() {
  vUv = uv;
  vColor = instanceColor;
  vOpacity = instanceOpacity;

  // Get instance position from instance matrix
  vec3 instancePos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

  // Calculate billboard rotation (Y-axis locked to keep grass upright)
  vec3 toCamera = normalize(cameraPosition - instancePos);

  // Lock Y-axis: grass blades always point up
  toCamera.y = 0.0;
  toCamera = normalize(toCamera);

  // Calculate right and up vectors for billboard
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 right = normalize(cross(up, toCamera));

  // Rebuild the billboard matrix
  mat3 billboardMat = mat3(
    right,
    up,
    toCamera
  );

  // Apply billboard transformation to vertex position
  vec3 billboardPos = billboardMat * (position * instanceScale);

  // Transform to world space using instance matrix (translation only)
  vec4 worldPos = instanceMatrix * vec4(billboardPos, 1.0);

  // Final transformation to clip space
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
