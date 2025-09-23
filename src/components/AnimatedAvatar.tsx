import React, { useEffect, useRef } from 'react';

interface AnimatedAvatarProps {
  selectedSprite?: string;
  size?: number;
  style?: React.CSSProperties;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  selectedSprite, 
  size = 120,
  style = {} 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the sprite name, fallback to Fighter if nil
    const spriteName = selectedSprite || 'Fighter';
    const imageUrl = `/assets/avatars/${spriteName}/Idle.png`;

    const image = new Image();
    image.onload = () => {
      // Sprite sheet configuration (128x128 frames)
      const frameWidth = 128;
      const frameHeight = 128;
      const totalFrames = Math.floor(image.width / frameWidth);
      
      let currentFrame = 0;
      let lastTime = 0;
      const frameRate = 8; // frames per second
      const frameInterval = 1000 / frameRate;

      const animate = (currentTime: number) => {
        if (currentTime - lastTime >= frameInterval) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculate source position in sprite sheet
          const sourceX = currentFrame * frameWidth;
          const sourceY = 0;
          
          // Draw the current frame scaled to canvas size
          ctx.drawImage(
            image,
            sourceX, sourceY, frameWidth, frameHeight,
            0, 0, canvas.width, canvas.height
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
      // If image fails to load, display a fallback
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Avatar', canvas.width / 2, canvas.height / 2);
    };

    image.src = imageUrl;

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedSprite]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        borderRadius: '8px',
        imageRendering: 'pixelated', // For crisp pixel art
        ...style
      }}
    />
  );
};

export default AnimatedAvatar;