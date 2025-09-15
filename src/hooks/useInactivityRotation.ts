import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { inactivityTimeoutMs = 30000, enabled = true } = options;
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const [navIndex, setNavIndex] = useState(0);

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

  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!enabled || !isNonCareerAssociate()) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      // Increment navIndex and wrap around using % 3
      setNavIndex((prev) => {
        const nextIndex = (prev + 1) % rotationSequence.length;
        const nextRoute = rotationSequence[nextIndex];

        console.log(`Auto-rotating to: ${nextRoute.displayName}`);

        if (nextRoute.state) {
          navigate(nextRoute.path, { state: nextRoute.state });
        } else {
          navigate(nextRoute.path);
        }

        return nextIndex;
      });
    }, inactivityTimeoutMs);
  };

  useEffect(() => {
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

    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // Only depend on enabled/inactivityTimeoutMs
  }, [enabled, inactivityTimeoutMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    resetTimer: resetInactivityTimer,
    navIndex,
    rotationSequence,
  };
};

