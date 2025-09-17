import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Game, rawgAPI } from '../services/rawgApi';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TrendingSectionProps {
  onGameClick: (game: Game) => void;
}

export function TrendingSection({ onGameClick }: TrendingSectionProps) {
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [currentUpcomingIndex, setCurrentUpcomingIndex] = useState(0);

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    try {
      const [trending, upcoming] = await Promise.all([
        rawgAPI.getTrendingGames(),
        rawgAPI.getUpcomingGames(),
      ]);

      setTrendingGames(trending.results.slice(0, 10));
      setUpcomingGames(upcoming.results.slice(0, 10));
    } catch (error) {
      console.error('Failed to load trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const nextTrending = () => {
    setCurrentTrendingIndex((prev) => 
      prev + 1 >= trendingGames.length - 2 ? 0 : prev + 1
    );
  };

  const prevTrending = () => {
    setCurrentTrendingIndex((prev) => 
      prev === 0 ? Math.max(0, trendingGames.length - 3) : prev - 1
    );
  };

  const nextUpcoming = () => {
    setCurrentUpcomingIndex((prev) => 
      prev + 1 >= upcomingGames.length - 2 ? 0 : prev + 1
    );
  };

  const prevUpcoming = () => {
    setCurrentUpcomingIndex((prev) => 
      prev === 0 ? Math.max(0, upcomingGames.length - 3) : prev - 1
    );
  };

  const renderGameCarousel = (
    games: Game[], 
    currentIndex: number, 
    onPrev: () => void, 
    onNext: () => void,
    icon: React.ReactNode,
    title: string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <h2>{title}</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / 3)}%)`,
            width: `${(games.length * 100) / 3}%`
          }}
        >
          {games.map((game) => (
            <div key={game.id} className="w-1/3 flex-shrink-0 px-2">
              <Card 
                className="cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                onClick={() => onGameClick(game)}
              >
                <div className="relative aspect-video">
                  <ImageWithFallback
                    src={game.background_image || '/api/placeholder/400/225'}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {game.rating > 0 && (
                    <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-xs">{game.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {game.metacritic && (
                    <div className="absolute bottom-2 left-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          game.metacritic >= 75 ? 'bg-green-600 text-white' : 
                          game.metacritic >= 50 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {game.metacritic}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <h4 className="line-clamp-1 mb-1">{game.name}</h4>
                  {game.released && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(game.released)}
                    </p>
                  )}
                  {game.genres && game.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {game.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre.id} variant="outline" className="text-xs">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Trending Games */}
      {trendingGames.length > 0 && renderGameCarousel(
        trendingGames,
        currentTrendingIndex,
        prevTrending,
        nextTrending,
        <TrendingUp className="h-6 w-6 text-primary" />,
        "Trending Now"
      )}

      {/* Upcoming Games */}
      {upcomingGames.length > 0 && renderGameCarousel(
        upcomingGames,
        currentUpcomingIndex,
        prevUpcoming,
        nextUpcoming,
        <Clock className="h-6 w-6 text-primary" />,
        "Coming Soon"
      )}
    </div>
  );
}