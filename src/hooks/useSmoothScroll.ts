import { useEffect, useRef, useState, useCallback } from "react";

interface SmoothScrollOptions {
  enabled?: boolean;
  smoothness?: number; // 0-1, higher = smoother but more performance intensive
  damping?: number; // 0-1, higher = more damping
}

interface SmoothScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement>;
  isScrolling: boolean;
}

/**
 * Custom hook for smooth scrolling with CSS transforms
 * Provides smooth scrollY functionality using transform for better performance
 */
export const useSmoothScroll = (
  options: SmoothScrollOptions = {}
): SmoothScrollReturn => {
  const {
    enabled = true,
    smoothness = 0.1,
    damping = 0.8,
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);
  const rafId = useRef<number>();
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const updateTransform = useCallback(() => {
    if (!scrollRef.current || !enabled) return;

    const diff = targetScrollY.current - currentScrollY.current;
    
    if (Math.abs(diff) < 0.5) {
      currentScrollY.current = targetScrollY.current;
      setIsScrolling(false);
      return;
    }

    currentScrollY.current += diff * smoothness;
    
    // Apply transform to the content container
    const contentContainer = scrollRef.current.firstElementChild as HTMLElement;
    if (contentContainer) {
      contentContainer.style.transform = `translateY(${-currentScrollY.current}px)`;
    }

    rafId.current = requestAnimationFrame(updateTransform);
  }, [enabled, smoothness]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!scrollRef.current || !enabled) return;

    e.preventDefault();
    
    const container = scrollRef.current;
    const content = container.firstElementChild as HTMLElement;
    
    if (!content) return;

    const containerHeight = container.clientHeight;
    const contentHeight = content.scrollHeight;
    const maxScroll = Math.max(0, contentHeight - containerHeight);

    // Update target scroll position
    const scrollSpeed = 1;
    targetScrollY.current = Math.max(
      0,
      Math.min(maxScroll, targetScrollY.current + e.deltaY * scrollSpeed)
    );

    setIsScrolling(true);

    // Clear existing timeout and set a new one to detect when scrolling stops
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateTransform);
    }
  }, [enabled, updateTransform]);

  const handleTouchStart = useRef<{ y: number; time: number } | null>(null);
  const touchVelocity = useRef(0);

  const handleTouchStartEvent = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    handleTouchStart.current = {
      y: touch.clientY,
      time: Date.now(),
    };
    touchVelocity.current = 0;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!scrollRef.current || !enabled || !handleTouchStart.current) return;

    e.preventDefault();
    
    const touch = e.touches[0];
    const container = scrollRef.current;
    const content = container.firstElementChild as HTMLElement;
    
    if (!content) return;

    const containerHeight = container.clientHeight;
    const contentHeight = content.scrollHeight;
    const maxScroll = Math.max(0, contentHeight - containerHeight);

    const deltaY = handleTouchStart.current.y - touch.clientY;
    const deltaTime = Date.now() - handleTouchStart.current.time;
    
    // Calculate velocity for momentum
    touchVelocity.current = deltaTime > 0 ? deltaY / deltaTime : 0;

    targetScrollY.current = Math.max(
      0,
      Math.min(maxScroll, targetScrollY.current + deltaY)
    );

    // Update touch start position for next move
    handleTouchStart.current = {
      y: touch.clientY,
      time: Date.now(),
    };

    setIsScrolling(true);

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateTransform);
    }
  }, [enabled, updateTransform]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !handleTouchStart.current) return;

    // Add momentum scrolling
    const momentum = touchVelocity.current * damping * 100;
    
    if (Math.abs(momentum) > 10) {
      const container = scrollRef.current;
      const content = container?.firstElementChild as HTMLElement;
      
      if (container && content) {
        const containerHeight = container.clientHeight;
        const contentHeight = content.scrollHeight;
        const maxScroll = Math.max(0, contentHeight - containerHeight);

        targetScrollY.current = Math.max(
          0,
          Math.min(maxScroll, targetScrollY.current + momentum)
        );
      }
    }

    handleTouchStart.current = null;
    touchVelocity.current = 0;

    // Clear scrolling state after a delay
    setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  }, [enabled, damping]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !enabled) return;

    // Set up the container styles
    element.style.overflow = 'hidden';
    element.style.height = '100%';
    element.style.position = 'relative';

    // Set up the content container
    const content = element.firstElementChild as HTMLElement;
    if (content) {
      content.style.willChange = 'transform';
      content.style.transition = 'none';
    }

    // Add event listeners
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('touchstart', handleTouchStartEvent, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStartEvent);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      // Reset transform
      if (content) {
        content.style.transform = '';
        content.style.willChange = '';
      }
    };
  }, [enabled, handleWheel, handleTouchStartEvent, handleTouchMove, handleTouchEnd]);

  // Reset scroll position when enabled state changes
  useEffect(() => {
    if (!enabled && scrollRef.current) {
      targetScrollY.current = 0;
      currentScrollY.current = 0;
      const content = scrollRef.current.firstElementChild as HTMLElement;
      if (content) {
        content.style.transform = '';
      }
    }
  }, [enabled]);

  return {
    scrollRef,
    isScrolling,
  };
};