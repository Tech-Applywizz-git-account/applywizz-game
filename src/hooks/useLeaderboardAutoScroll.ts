import { useEffect, useRef } from "react";
import { isNonCareerAssociate } from "../utils/roleUtils";

interface LeaderboardAutoScrollOptions {
  enabled?: boolean;
  inactivityTimeoutMs?: number;
  scrollSpeed?: number;
  activeTab?: string;
  onAutoScrollComplete?: () => void;
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
    onAutoScrollComplete,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

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

    const animate = () => {
      if (!scrollContainerRef.current || !isScrollingRef.current) {
        return;
      }

      const container = scrollContainerRef.current;
      const currentScrollTop = container.scrollTop;
      const maxScrollTop = Math.max(
        container.scrollHeight - container.clientHeight,
        0
      );

      if (maxScrollTop <= 0) {
        stopAutoScroll();
        onAutoScrollComplete?.();
        return;
      }

      if (currentScrollTop >= maxScrollTop) {
        container.scrollTop = maxScrollTop;
        stopAutoScroll();
        onAutoScrollComplete?.();
        return;
      }

      // Smooth scroll down
      const newScrollTop = Math.min(currentScrollTop + scrollSpeed, maxScrollTop);
      container.scrollTop = newScrollTop;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Stop the automatic scrolling animation
  const stopAutoScroll = () => {
    isScrollingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
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