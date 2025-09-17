import { useEffect, useRef } from "react";
import { isNonCareerAssociate } from "../utils/roleUtils";

interface LeaderboardAutoScrollOptions {
  enabled?: boolean;
  inactivityTimeoutMs?: number;
  scrollSpeed?: number;
  activeTab?: string;
  onAutoScrollStateChange?: (isAutoScrolling: boolean) => void;
}

/**
 * Hook to handle automatic scrolling for the leaderboard card component
 * Only applies to non-CA users and individual users after 5 seconds of inactivity
 */
export const useLeaderboardAutoScroll = (
  options: LeaderboardAutoScrollOptions = {}
) => {
  const {
    enabled = true,
    inactivityTimeoutMs = 5000, // 5 seconds as specified
    scrollSpeed = 1, // pixels per frame
    activeTab = "team",
    onAutoScrollStateChange,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const lastScrollPositionRef = useRef(0);

  // Reset the inactivity timer
  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Stop any ongoing auto-scroll
    stopAutoScroll();

    // Check if auto-scroll should be enabled
    const shouldEnable = enabled && 
      isNonCareerAssociate() && 
      activeTab === "individual";

    if (!shouldEnable) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      startAutoScroll();
    }, inactivityTimeoutMs);
  };

  // Start the automatic scrolling animation
  const startAutoScroll = () => {
    if (!scrollContainerRef.current || isScrollingRef.current) {
      return;
    }

    isScrollingRef.current = true;
    onAutoScrollStateChange?.(true);
    
    const animate = () => {
      if (!scrollContainerRef.current || !isScrollingRef.current) {
        return;
      }

      const container = scrollContainerRef.current;
      const currentScrollTop = container.scrollTop;
      const maxScrollTop = container.scrollHeight - container.clientHeight;

      // If we've reached the bottom, loop back to top
      if (currentScrollTop >= maxScrollTop) {
        container.scrollTop = 0;
        lastScrollPositionRef.current = 0;
      } else {
        // Smooth scroll down
        const newScrollTop = currentScrollTop + scrollSpeed;
        container.scrollTop = newScrollTop;
        lastScrollPositionRef.current = newScrollTop;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Stop the automatic scrolling animation
  const stopAutoScroll = () => {
    isScrollingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onAutoScrollStateChange?.(false);
  };

  // Handle user activity to reset timer
  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  // Handle manual scroll to detect user interaction
  const handleScroll = () => {
    if (!isScrollingRef.current) {
      // User manually scrolled, reset timer
      resetInactivityTimer();
    }
  };

  useEffect(() => {
    // Check if auto-scroll should be enabled
    const shouldEnable = enabled && 
      isNonCareerAssociate() && 
      activeTab === "individual";

    if (!shouldEnable) {
      return;
    }

    const events = [
      "mousedown",
      "mousemove", 
      "keypress",
      "keydown",
      "touchstart",
      "click",
    ];

    // Attach event listeners for user activity
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Start the initial timer
    resetInactivityTimer();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      stopAutoScroll();
    };
  }, [enabled, inactivityTimeoutMs, activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopAutoScroll();
    };
  }, []);

  return {
    scrollContainerRef,
    handleScroll,
    resetTimer: resetInactivityTimer,
    isAutoScrolling: isScrollingRef.current,
  };
};