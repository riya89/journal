import { useEffect, useRef } from "react";

/**
 * WaterRippleEffect - Optimized water ripple effect using WebGL
 * Creates realistic water droplet/ripple distortions
 * @param {boolean} mouseOnly - If true, only create ripples on mouse movement (no auto-ripples)
 * @param {string} theme - 'light' or 'dark' theme
 */
export default function WaterRippleEffect({ 
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
  mouseOnly = false,
  theme = "light",
  className = "" 
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const textureRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      console.warn("WebGL not supported, falling back to simple effect");
      return;
    }

    glRef.current = gl;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment shader with water ripple effect - simplified
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_mouseOnly;
      uniform float u_isDark;
      
      void main() {
        vec2 uv = v_texCoord;
        vec2 distortion = vec2(0.0);
        
        // Mouse ripple - creates concentric circular ripples
        vec2 mousePos = u_mouse;
        float mouseDist = length(uv - mousePos);
        
        // Create expanding concentric rings from mouse
        float mouseRipple = 0.0;
        for(float i = 0.0; i < 5.0; i++) {
          float ringRadius = mod(u_time * 0.4 + i * 0.12, 1.5);
          float ringDist = abs(mouseDist - ringRadius);
          float ring = smoothstep(0.03, 0.0, ringDist);
          float fade = exp(-mouseDist * 2.0) * (1.0 - ringRadius / 1.5);
          mouseRipple += ring * fade * 0.025;
        }
        
        // Calculate distortion direction (radial from mouse)
        if (mouseDist > 0.001) {
          vec2 mouseDir = normalize(uv - mousePos);
          distortion += mouseDir * mouseRipple;
        }
        
        // Animated ripples - only if mouseOnly is false
        if (u_mouseOnly < 0.5) {
          for(float i = 0.0; i < 2.0; i++) {
            vec2 center = vec2(
              0.5 + sin(u_time * 0.3 + i * 3.14) * 0.3,
              0.5 + cos(u_time * 0.4 + i * 3.14) * 0.3
            );
            float d = length(uv - center);
            
            // Create concentric rings
            float autoRipple = 0.0;
            for(float j = 0.0; j < 3.0; j++) {
              float ringRadius = mod(u_time * 0.3 + j * 0.15, 1.2);
              float ringDist = abs(d - ringRadius);
              float ring = smoothstep(0.04, 0.0, ringDist);
              float fade = exp(-d * 2.5) * (1.0 - ringRadius / 1.2);
              autoRipple += ring * fade * 0.012;
            }
            
            if (d > 0.001) {
              vec2 dir = normalize(uv - center);
              distortion += dir * autoRipple;
            }
          }
        }
        
        // Apply distortion
        vec2 distortedUV = uv + distortion;
        
        // Sample texture with distortion
        vec4 color = texture2D(u_image, distortedUV);
        
        // Theme-based color adjustments
        if (u_isDark > 0.5) {
          // Dark theme: Add darker tones, reduce brightness
          color.rgb *= 0.7; // Darken overall
          color.rgb = mix(color.rgb, vec3(0.2, 0.25, 0.35), 0.15); // Add dark blue-gray tint
          
          // Add subtle vignette
          float vignette = 1.0 - length(uv - 0.5) * 0.8;
          color.rgb *= vignette;
        } else {
          // Light theme: Brighten, add warmth
          color.rgb *= 1.1; // Slightly brighten
          color.rgb = mix(color.rgb, vec3(1.0, 0.95, 0.9), 0.08); // Add warm tint
        }
        
        // Subtle water color enhancement
        vec3 waterTint = u_isDark > 0.5 ? vec3(0.3, 0.4, 0.6) : vec3(0.5, 0.7, 1.0);
        color.rgb = mix(color.rgb, waterTint, 0.03);
        
        gl_FragColor = color;
      }
    `;

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    // Set up geometry (full screen quad)
    const positions = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1,
    ]);

    const texCoords = new Float32Array([
      0, 1,  1, 1,  0, 0,
      0, 0,  1, 1,  1, 0,
    ]);

    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Texture coordinate buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Load image
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;

    image.onload = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureRef.current = texture;
    };

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const mouseOnlyLocation = gl.getUniformLocation(program, "u_mouseOnly");
    const isDarkLocation = gl.getUniformLocation(program, "u_isDark");

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let startTime = Date.now();
    let animationId;

    const animate = () => {
      if (!textureRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const time = (Date.now() - startTime) / 1000;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(mouseOnlyLocation, mouseOnly ? 1.0 : 0.0);
      gl.uniform1f(isDarkLocation, theme === "dark" ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (textureRef.current) {
          gl.deleteTexture(textureRef.current);
        }
      }
    };
  }, [imageUrl, mouseOnly, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}
