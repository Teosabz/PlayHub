import { Star, Calendar, Heart, Monitor, Smartphone, Gamepad } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Game } from '../services/rawgApi';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (gameId: number) => void;
  onGameClick: (game: Game) => void;
}

export function GameCard({ game, isFavorite, onToggleFavorite, onGameClick }: GameCardProps) {
  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('pc') || name.includes('windows') || name.includes('linux') || name.includes('mac')) {
      return <Monitor className="h-3 w-3" />;
    }
    if (name.includes('mobile') || name.includes('android') || name.includes('ios')) {
      return <Smartphone className="h-3 w-3" />;
    }
    return <Gamepad className="h-3 w-3" />;
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(game.id);
  };

  return (
    <Card className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50">
      <div onClick={() => onGameClick(game)}>
        <div className="relative aspect-video overflow-hidden">
          <ImageWithFallback
            src={game.background_image || '/api/placeholder/400/225'}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </Button>

          {/* Rating Badge */}
          {game.rating > 0 && (
            <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-sm">{game.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Metacritic Score */}
          {game.metacritic && (
            <div className="absolute bottom-2 left-2">
              <Badge 
                variant="secondary" 
                className={`
                  ${game.metacritic >= 75 ? 'bg-green-600 text-white' : 
                    game.metacritic >= 50 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}
                `}
              >
                {game.metacritic}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Game Title */}
            <h3 className="line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {game.name}
            </h3>

            {/* Release Date */}
            {game.released && (
              <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(game.released)}</span>
              </div>
            )}

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="flex items-center space-x-1 text-muted-foreground">
                <div className="flex space-x-1">
                  {game.platforms.slice(0, 4).map((platform, index) => (
                    <div key={platform.platform.id} className="flex items-center">
                      {getPlatformIcon(platform.platform.name)}
                    </div>
                  ))}
                  {game.platforms.length > 4 && (
                    <span className="text-xs">+{game.platforms.length - 4}</span>
                  )}
                </div>
              </div>
            )}

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {game.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre.id} variant="outline" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
                {game.genres.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{game.genres.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}