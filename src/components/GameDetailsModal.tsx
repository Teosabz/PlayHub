import { useState, useEffect } from 'react';
import { X, Star, Calendar, Globe, ExternalLink, Heart, Play, Monitor, Smartphone, Gamepad } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Game, GameDetails, rawgAPI } from '../services/rawgApi';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GameDetailsModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: number) => void;
}

export function GameDetailsModal({ game, isOpen, onClose, isFavorite, onToggleFavorite }: GameDetailsModalProps) {
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [screenshots, setScreenshots] = useState<Array<{ id: number; image: string }>>([]);
  const [trailers, setTrailers] = useState<Array<{ id: number; name: string; preview: string; data: { [key: string]: string } }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (game && isOpen) {
      loadGameDetails();
    }
  }, [game, isOpen]);

  const loadGameDetails = async () => {
    if (!game) return;

    setIsLoading(true);
    try {
      const [details, screenshotsData, trailersData] = await Promise.all([
        rawgAPI.getGame(game.id),
        rawgAPI.getGameScreenshots(game.id),
        rawgAPI.getGameTrailers(game.id),
      ]);

      setGameDetails(details);
      setScreenshots(screenshotsData.results || []);
      setTrailers(trailersData.results || []);
    } catch (error) {
      console.error('Failed to load game details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('pc') || name.includes('windows') || name.includes('linux') || name.includes('mac')) {
      return <Monitor className="h-4 w-4" />;
    }
    if (name.includes('mobile') || name.includes('android') || name.includes('ios')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Gamepad className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="h-full">
          <div className="relative">
            {/* Header Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <ImageWithFallback
                src={game.background_image || '/api/placeholder/800/400'}
                alt={game.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40"
                onClick={onClose}
              >
                <X className="h-4 w-4 text-white" />
              </Button>

              {/* Game Title and Basic Info */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl md:text-3xl text-white mb-2">
                    {game.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {game.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{game.rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {game.metacritic && (
                    <Badge 
                      className={`
                        ${game.metacritic >= 75 ? 'bg-green-600' : 
                          game.metacritic >= 50 ? 'bg-yellow-600' : 'bg-red-600'} text-white
                      `}
                    >
                      Metacritic: {game.metacritic}
                    </Badge>
                  )}
                  
                  {game.released && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(game.released)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  onClick={() => onToggleFavorite(game.id)}
                  className="flex items-center space-x-2"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </Button>

                {gameDetails?.website && (
                  <Button variant="outline" asChild>
                    <a href={gameDetails.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}

                {gameDetails?.metacritic_url && (
                  <Button variant="outline" asChild>
                    <a href={gameDetails.metacritic_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Metacritic
                    </a>
                  </Button>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}

              {/* Description */}
              {gameDetails && (
                <div className="space-y-4">
                  <h3>About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {gameDetails.description_raw ? 
                      stripHtmlTags(gameDetails.description_raw) : 
                      'No description available.'
                    }
                  </p>
                </div>
              )}

              <Separator />

              {/* Game Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platforms */}
                {game.platforms && game.platforms.length > 0 && (
                  <div className="space-y-2">
                    <h4>Platforms</h4>
                    <div className="space-y-2">
                      {game.platforms.map((platform) => (
                        <div key={platform.platform.id} className="flex items-center space-x-2 text-muted-foreground">
                          {getPlatformIcon(platform.platform.name)}
                          <span>{platform.platform.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genres */}
                {game.genres && game.genres.length > 0 && (
                  <div className="space-y-2">
                    <h4>Genres</h4>
                    <div className="flex flex-wrap gap-1">
                      {game.genres.map((genre) => (
                        <Badge key={genre.id} variant="outline">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Developers */}
                {gameDetails?.developers && gameDetails.developers.length > 0 && (
                  <div className="space-y-2">
                    <h4>Developers</h4>
                    <p className="text-muted-foreground">
                      {gameDetails.developers.map(dev => dev.name).join(', ')}
                    </p>
                  </div>
                )}

                {/* Publishers */}
                {gameDetails?.publishers && gameDetails.publishers.length > 0 && (
                  <div className="space-y-2">
                    <h4>Publishers</h4>
                    <p className="text-muted-foreground">
                      {gameDetails.publishers.map(pub => pub.name).join(', ')}
                    </p>
                  </div>
                )}

                {/* ESRB Rating */}
                {gameDetails?.esrb_rating && (
                  <div className="space-y-2">
                    <h4>ESRB Rating</h4>
                    <Badge variant="outline">
                      {gameDetails.esrb_rating.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Trailers */}
              {trailers.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3>Trailers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trailers.slice(0, 4).map((trailer) => (
                      <div key={trailer.id} className="space-y-2">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={trailer.preview}
                            alt={trailer.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button size="sm" className="rounded-full">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{trailer.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {screenshots.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3>Screenshots</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {screenshots.slice(0, 8).map((screenshot) => (
                      <div 
                        key={screenshot.id} 
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedScreenshot(screenshot.image)}
                      >
                        <ImageWithFallback
                          src={screenshot.image}
                          alt="Game screenshot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Screenshot Modal */}
        {selectedScreenshot && (
          <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
            <DialogContent className="max-w-4xl p-0">
              <div className="relative">
                <ImageWithFallback
                  src={selectedScreenshot}
                  alt="Game screenshot"
                  className="w-full h-auto"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40"
                  onClick={() => setSelectedScreenshot(null)}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}