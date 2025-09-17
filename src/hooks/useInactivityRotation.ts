import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isNonCareerAssociate } from "../utils/roleUtils";

interface InactivityRotationOptions {
  inactivityTimeoutMs?: number;
  enabled?: boolean;
}

/**
 * Hook to handle automatic rotation between pages for non-career associates
 * Rotates: spaces → leaderboard (team) → leaderboard (individual) → spaces
 */
export const useInactivityRotation = (
  options: InactivityRotationOptions = {}
) => {
  const { inactivityTimeoutMs = 30000, enabled = true } = options; // 30 seconds default
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentRouteIndexRef = useRef(0);
  const suppressScrollActivityRef = useRef(false);

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
  }, [location]);

  const setSuppressScrollActivity = useCallback((value: boolean) => {
    suppressScrollActivityRef.current = value;
  }, []);

  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timer for non-career associates and when enabled
    if (!enabled || !isNonCareerAssociate()) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      // Move to next route in sequence
      currentRouteIndexRef.current =
        (currentRouteIndexRef.current + 1) % rotationSequence.length;
      const nextRoute = rotationSequence[currentRouteIndexRef.current];

      console.log(`Auto-rotating to: ${nextRoute.displayName}`);

      if (nextRoute.state) {
        navigate(nextRoute.path, { state: nextRoute.state });
      } else {
        navigate(nextRoute.path);
      }
    }, inactivityTimeoutMs);
  };

  useEffect(() => {
    // Only attach listeners for non-career associates
    if (!enabled || !isNonCareerAssociate()) {
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = (event: Event) => {
      if (event.type === "scroll") {
        if (suppressScrollActivityRef.current) {
          return;
        }

        if (!event.isTrusted) {
          return;
        }
      }

      resetInactivityTimer();
    };

    // Attach event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the initial timer
    resetInactivityTimer();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, inactivityTimeoutMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    resetTimer: resetInactivityTimer,
    currentRouteIndex: currentRouteIndexRef.current,
    rotationSequence,
    setSuppressScrollActivity,
  };
};

