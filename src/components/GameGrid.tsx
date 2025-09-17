import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { GameCard } from './GameCard';
import { Button } from './ui/button';
import { Game, rawgAPI } from '../services/rawgApi';
import { FilterState } from './GameFilters';

interface GameGridProps {
  searchQuery: string;
  filters: FilterState;
  favorites: number[];
  onToggleFavorite: (gameId: number) => void;
  onGameClick: (game: Game) => void;
  showFavoritesOnly: boolean;
}

export function GameGrid({ 
  searchQuery, 
  filters, 
  favorites, 
  onToggleFavorite, 
  onGameClick,
  showFavoritesOnly 
}: GameGridProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when search/filters change
  useEffect(() => {
    setGames([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    loadGames(1, true);
  }, [searchQuery, filters, showFavoritesOnly]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [games, isLoading, isLoadingMore, hasMore]);

  const loadGames = async (page: number, reset: boolean = false) => {
    if (showFavoritesOnly) {
      // For favorites, we don't need to call the API
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params: any = {
        page,
        page_size: 20,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (filters.genres.length > 0) {
        params.genres = filters.genres.join(',');
      }

      if (filters.platforms.length > 0) {
        params.platforms = filters.platforms.join(',');
      }

      if (filters.ordering) {
        params.ordering = filters.ordering;
      }

      if (filters.metacritic) {
        params.metacritic = filters.metacritic;
      }

      const response = await rawgAPI.getGames(params);
      
      if (reset) {
        setGames(response.results);
      } else {
        setGames(prev => [...prev, ...response.results]);
      }

      setHasMore(!!response.next);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Failed to load games:', err);
      setError('Failed to load games. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !showFavoritesOnly) {
      loadGames(currentPage + 1);
    }
  }, [currentPage, isLoadingMore, hasMore, showFavoritesOnly]);

  // Filter games for favorites view
  const displayGames = showFavoritesOnly 
    ? games.filter(game => favorites.includes(game.id))
    : games;

  // Show favorites from all loaded games if showing favorites only
  const favoritedGames = showFavoritesOnly && games.length === 0 
    ? [] // We'll need to load favorited games from somewhere
    : displayGames;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading games...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="mb-2">Oops! Something went wrong</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => loadGames(1, true)}>
          Try Again
        </Button>
      </div>
    );
  }

  if (showFavoritesOnly && favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">💔</div>
        <h3 className="mb-2">No favorites yet</h3>
        <p className="text-muted-foreground">
          Start exploring games and add your favorites by clicking the heart icon!
        </p>
      </div>
    );
  }

  if (displayGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="mb-2">No games found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to discover more games.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
            onGameClick={onGameClick}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading more games...</span>
          </div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {!showFavoritesOnly && hasMore && !isLoadingMore && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {/* End of Results */}
      {!showFavoritesOnly && !hasMore && displayGames.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've seen all the games! 🎉</p>
        </div>
      )}
    </div>
  );
}