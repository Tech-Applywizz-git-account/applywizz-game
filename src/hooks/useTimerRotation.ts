import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isNonCareerAssociate } from "../utils/roleUtils";

interface TimerRotationOptions {
  timerIntervalMs?: number;
  enabled?: boolean;
}

/**
 * Hook to handle automatic rotation between pages for non-career associates using fixed timers
 * Rotates: spaces → leaderboard (team) → leaderboard (individual) → spaces
 * Unlike inactivity-based rotation, this advances automatically on fixed intervals
 * Manual navigation resets the timer to allow user interaction flexibility
 */
export const useTimerRotation = (
  options: TimerRotationOptions = {}
) => {
  const { timerIntervalMs = 30000, enabled = true } = options; // 30 seconds default
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentRouteIndexRef = useRef(0);
  const lastNavigationTimeRef = useRef<number>(Date.now());

  // Define the rotation sequence for non-CA users
  const rotationSequence = [
    { path: "/spaces", displayName: "Spaces" },
    {
      path: "/leaderboard",
      state: { activeTab: "team" },
      displayName: "Leaderboard Team",
    },
    {
      path: "/leaderboard",
      state: { activeTab: "individual" },
      displayName: "Leaderboard Individual",
    },
  ];

  // Update current route index when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const currentState = location.state as any;

    if (currentPath === "/spaces") {
      currentRouteIndexRef.current = 0;
    } else if (currentPath === "/leaderboard") {
      if (currentState?.activeTab === "individual") {
        currentRouteIndexRef.current = 2;
      } else {
        currentRouteIndexRef.current = 1; // default to team
      }
    }

    // Reset timer when user manually navigates
    lastNavigationTimeRef.current = Date.now();
    resetTimer();
  }, [location]);

  const startTimerRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set timer for non-career associates and when enabled
    if (!enabled || !isNonCareerAssociate()) {
      return;
    }

    intervalRef.current = setInterval(() => {
      // Move to next route in sequence
      currentRouteIndexRef.current =
        (currentRouteIndexRef.current + 1) % rotationSequence.length;
      const nextRoute = rotationSequence[currentRouteIndexRef.current];

      console.log(`Timer-rotating to: ${nextRoute.displayName}`);

      if (nextRoute.state) {
        navigate(nextRoute.path, { state: nextRoute.state });
      } else {
        navigate(nextRoute.path);
      }
    }, timerIntervalMs);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startTimerRotation();
  };

  useEffect(() => {
    // Start the timer rotation when the hook is initialized
    if (enabled && isNonCareerAssociate()) {
      startTimerRotation();
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, timerIntervalMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    resetTimer,
    currentRouteIndex: currentRouteIndexRef.current,
    rotationSequence,
  };
};