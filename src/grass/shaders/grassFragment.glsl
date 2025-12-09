// Fragment shader for instanced grass billboards
// Handles texture sampling, color tinting, and alpha testing

uniform sampler2D grassTexture;
uniform vec3 biomeColor;

// Varying variables from vertex shader
varying vec2 vUv;
varying vec3 vColor;
varying float vOpacity;

void main() {
  // Sample the grass texture
  vec4 texColor = texture2D(grassTexture, vUv);

  // Apply alpha test (discard fully transparent pixels)
  if (texColor.a < 0.1) {
    discard;
  }

  // Apply biome color tint
  vec3 tintedColor = texColor.rgb * biomeColor;

  // Apply per-instance color variation (for biome blending)
  vec3 finalColor = tintedColor * vColor;

  // Apply per-instance opacity
  float finalOpacity = texColor.a * vOpacity;

  gl_FragColor = vec4(finalColor, finalOpacity);
}
