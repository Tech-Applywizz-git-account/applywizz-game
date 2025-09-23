import React, { useEffect, useRef } from 'react';

interface AnimatedAvatarProps {
  sprite: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AnimatedAvatar component that displays the idle animation for a given sprite
 * Uses CSS sprite animation to cycle through frames from the Idle.png spritesheet
 */
const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  sprite, 
  size = 64, 
  className = '',
  style = {} 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;

    // Load the idle sprite sheet
    const image = new Image();
    imageRef.current = image;

    image.onload = () => {
      // Sprite sheet configuration (128x128 frames)
      const frameWidth = 128;
      const frameHeight = 128;
      const totalFrames = Math.floor(image.width / frameWidth);
      
      let currentFrame = 0;
      let lastTime = 0;
      const frameRate = 8; // frames per second
      const frameDuration = 1000 / frameRate;

      const animate = (currentTime: number) => {
        if (currentTime - lastTime >= frameDuration) {
          // Clear canvas
          ctx.clearRect(0, 0, size, size);
          
          // Calculate source position on sprite sheet
          const srcX = currentFrame * frameWidth;
          const srcY = 0;
          
          // Draw the current frame scaled to canvas size
          ctx.drawImage(
            image,
            srcX, srcY, frameWidth, frameHeight,
            0, 0, size, size
          );
          
          // Move to next frame
          currentFrame = (currentFrame + 1) % totalFrames;
          lastTime = currentTime;
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };

      // Start animation
      animationRef.current = requestAnimationFrame(animate);
    };

    image.onerror = () => {
      console.error(`Failed to load sprite: /assets/avatars/${sprite}/Idle.png`);
      // Draw a placeholder
      ctx.fillStyle = '#666';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Avatar', size / 2, size / 2);
    };

    image.src = `/assets/avatars/${sprite}/Idle.png`;

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sprite, size]);

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'transparent',
    ...style
  };

  return (
    <div className={className} style={containerStyle}>
      <canvas 
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated', // Preserve pixel art quality
        }}
      />
    </div>
  );
};

export default AnimatedAvatar;