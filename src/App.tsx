import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TrendingSection } from './components/TrendingSection';
import { GameFilters, FilterState } from './components/GameFilters';
import { GameGrid } from './components/GameGrid';
import { GameDetailsModal } from './components/GameDetailsModal';
import { Game } from './services/rawgApi';
import { Separator } from './components/ui/separator';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showingFavorites, setShowingFavorites] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    platforms: [],
    ordering: '',
    metacritic: '',
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('playhub-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse saved favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('playhub-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Show filters when search is active or filters are applied
  useEffect(() => {
    const hasActiveSearch = searchQuery.trim().length > 0;
    const hasActiveFilters = filters.genres.length > 0 || 
                            filters.platforms.length > 0 || 
                            filters.ordering !== '' || 
                            filters.metacritic !== '';
    
    setShowFilters(hasActiveSearch || hasActiveFilters || showingFavorites);
  }, [searchQuery, filters, showingFavorites]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowingFavorites(false);
  };

  const handleToggleFavorites = () => {
    setShowingFavorites(!showingFavorites);
    if (!showingFavorites) {
      setSearchQuery('');
      setFilters({
        genres: [],
        platforms: [],
        ordering: '',
        metacritic: '',
      });
    }
  };

  const handleToggleFavorite = (gameId: number) => {
    setFavorites(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setShowingFavorites(false);
  };

  const clearAllFilters = () => {
    setFilters({
      genres: [],
      platforms: [],
      ordering: '',
      metacritic: '',
    });
    setSearchQuery('');
  };

  const shouldShowTrending = !searchQuery.trim() && 
                            !showingFavorites && 
                            filters.genres.length === 0 && 
                            filters.platforms.length === 0 && 
                            filters.ordering === '' && 
                            filters.metacritic === '';

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onToggleFavorites={handleToggleFavorites}
        showingFavorites={showingFavorites}
        favoritesCount={favorites.length}
        searchQuery={searchQuery}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Trending Section - Only show when no search/filters active */}
        {shouldShowTrending && (
          <>
            <TrendingSection onGameClick={handleGameClick} />
            <Separator />
          </>
        )}

        {/* Search Results Header */}
        {(searchQuery.trim() || showingFavorites) && (
          <div className="space-y-2">
            <h2>
              {showingFavorites 
                ? `Your Favorites (${favorites.length})`
                : `Search Results for "${searchQuery}"`
              }
            </h2>
            {!showingFavorites && searchQuery.trim() && (
              <p className="text-muted-foreground">
                Discover games matching your search criteria
              </p>
            )}
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <GameFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearAllFilters}
          />
        )}

        {/* Games Grid */}
        <GameGrid
          searchQuery={searchQuery}
          filters={filters}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onGameClick={handleGameClick}
          showFavoritesOnly={showingFavorites}
        />

        {/* Game Details Modal */}
        <GameDetailsModal
          game={selectedGame}
          isOpen={!!selectedGame}
          onClose={handleCloseModal}
          isFavorite={selectedGame ? favorites.includes(selectedGame.id) : false}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>
    </div>
  );
}