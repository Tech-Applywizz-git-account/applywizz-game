import React, { createContext, useContext, useState, useEffect } from "react";
import { useBackendQuery, useCoinsXP } from "../hooks/hooks";

interface GameState {
  coins: number;
  xp: number;
  hp: number;
  totalHp: number;
  leaderboardData: LeaderboardEntry[];
  gameStatus: 'loading' | 'ready' | 'error';
  lastUpdated: Date | null;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar?: string;
}

interface GameStateContextProps {
  gameState: GameState;
  refreshGameState: () => void;
  updateCoins: (coins: number) => void;
  updateXP: (xp: number) => void;
  isLoading: boolean;
  error: string | null;
}

const GameStateContext = createContext<GameStateContextProps | null>(null);

interface GameStateProviderProps {
  children: React.ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    xp: 0,
    hp: 750,
    totalHp: 1000,
    leaderboardData: [],
    gameStatus: 'loading',
    lastUpdated: null
  });

  const [error, setError] = useState<string | null>(null);

  // Fetch coins and XP with fallback
  const { data: coinsXPData, isLoading: coinsLoading, error: coinsError } = useCoinsXP();
  
  // Fetch HP data
  const { data: hpData, isLoading: hpLoading, error: hpError } = useBackendQuery("team-hp", "/team-hp");
  
  // Fetch top 20 leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading, error: leaderboardError } = useBackendQuery(
    "top-twenty-leaderboard", 
    "/leaderboard?data=today&type=individual&limit=20"
  );

  const isLoading = coinsLoading || hpLoading || leaderboardLoading;

  // Update game state when backend data changes
  useEffect(() => {
    const newGameState: GameState = {
      // Fallback to 0 for coins and XP as required
      coins: coinsXPData?.coins ?? 0,
      xp: coinsXPData?.xp ?? 0,
      // Fallback HP values
      hp: hpData?.hp ?? 750,
      totalHp: hpData?.total_hp ?? 1000,
      // Process leaderboard data
      leaderboardData: processLeaderboardData(leaderboardData),
      gameStatus: determineGameStatus(),
      lastUpdated: new Date()
    };

    setGameState(newGameState);

    // Handle errors
    if (coinsError || hpError || leaderboardError) {
      const errorMessages = [
        coinsError && "Coins/XP data unavailable",
        hpError && "HP data unavailable", 
        leaderboardError && "Leaderboard data unavailable"
      ].filter(Boolean).join(", ");
      
      setError(errorMessages);
    } else {
      setError(null);
    }
  }, [coinsXPData, hpData, leaderboardData, coinsError, hpError, leaderboardError]);

  const processLeaderboardData = (data: any): LeaderboardEntry[] => {
    if (!data || !data.individuals) {
      return [];
    }

    return data.individuals.slice(0, 20).map((entry: any, index: number) => ({
      rank: index + 1,
      name: entry.name || entry.username || `Player ${index + 1}`,
      score: entry.score || entry.user_score || 0,
      avatar: entry.avatar
    }));
  };

  const determineGameStatus = (): 'loading' | 'ready' | 'error' => {
    if (isLoading) return 'loading';
    if (coinsError && hpError && leaderboardError) return 'error';
    return 'ready';
  };

  const refreshGameState = () => {
    // Trigger refetch by updating the last updated time
    setGameState(prev => ({
      ...prev,
      lastUpdated: new Date()
    }));
  };

  const updateCoins = (coins: number) => {
    setGameState(prev => ({
      ...prev,
      coins,
      lastUpdated: new Date()
    }));
  };

  const updateXP = (xp: number) => {
    setGameState(prev => ({
      ...prev,
      xp,
      lastUpdated: new Date()
    }));
  };

  return (
    <GameStateContext.Provider 
      value={{
        gameState,
        refreshGameState,
        updateCoins,
        updateXP,
        isLoading,
        error
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};

export type { GameState, LeaderboardEntry };