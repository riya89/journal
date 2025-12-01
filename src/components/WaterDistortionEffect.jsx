import { useEffect, useRef } from "react";

/**
 * WaterDistortionEffect - Creates a realistic water ripple/distortion effect
 * Like looking through water with ripples and distortion
 */
export default function WaterDistortionEffect({ 
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
  intensity = 0.5,
  className = "" 
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const ripples = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    let isLoaded = false;

    img.onload = () => {
      isLoaded = true;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      imageRef.current = img;
      animate();
    };

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Add ripple on mouse move
    const handleMouseMove = (e) => {
      ripples.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 150,
        speed: 3,
        strength: intensity * 50,
      });

      // Limit number of ripples
      if (ripples.current.length > 10) {
        ripples.current.shift();
      }
    };

    // Add random ripples
    const addRandomRipple = () => {
      if (ripples.current.length < 5) {
        ripples.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          maxRadius: 100 + Math.random() * 100,
          speed: 2 + Math.random() * 2,
          strength: intensity * 30,
        });
      }
    };

    const rippleInterval = setInterval(addRandomRipple, 2000);
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      if (!isLoaded || !imageRef.current) return;

      // Draw the base image
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Get image data for distortion
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(canvas, 0, 0);
      const originalData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply ripple distortion
      ripples.current.forEach((ripple) => {
        ripple.radius += ripple.speed;

        if (ripple.radius < ripple.maxRadius) {
          for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
              const dx = x - ripple.x;
              const dy = y - ripple.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < ripple.radius && distance > ripple.radius - 20) {
                const wave = Math.sin((distance - ripple.radius) * 0.5) * ripple.strength;
                const angle = Math.atan2(dy, dx);
                
                const offsetX = Math.cos(angle) * wave;
                const offsetY = Math.sin(angle) * wave;

                const sourceX = Math.floor(x + offsetX);
                const sourceY = Math.floor(y + offsetY);

                if (
                  sourceX >= 0 &&
                  sourceX < canvas.width &&
                  sourceY >= 0 &&
                  sourceY < canvas.height
                ) {
                  const targetIndex = (y * canvas.width + x) * 4;
                  const sourceIndex = (sourceY * canvas.width + sourceX) * 4;

                  pixels[targetIndex] = originalData.data[sourceIndex];
                  pixels[targetIndex + 1] = originalData.data[sourceIndex + 1];
                  pixels[targetIndex + 2] = originalData.data[sourceIndex + 2];
                  pixels[targetIndex + 3] = originalData.data[sourceIndex + 3];
                }
              }
            }
          }
        }
      });

      // Remove finished ripples
      ripples.current = ripples.current.filter(
        (ripple) => ripple.radius < ripple.maxRadius
      );

      ctx.putImageData(imageData, 0, 0);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(rippleInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [imageUrl, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}
