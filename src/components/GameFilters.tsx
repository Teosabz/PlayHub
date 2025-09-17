import { useState, useEffect } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { rawgAPI, Platform, Genre } from '../services/rawgApi';

export interface FilterState {
  genres: string[];
  platforms: string[];
  ordering: string;
  metacritic: string;
}

interface GameFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function GameFilters({ filters, onFiltersChange, onClearFilters }: GameFiltersProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [platformsData, genresData] = await Promise.all([
          rawgAPI.getPlatforms(),
          rawgAPI.getGenres()
        ]);
        setPlatforms(platformsData.results);
        setGenres(genresData.results);
      } catch (error) {
        console.error('Failed to load filter data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterData();
  }, []);

  const orderingOptions = [
    { value: '', label: 'Relevance' },
    { value: '-rating', label: 'Highest Rated' },
    { value: '-released', label: 'Newest' },
    { value: 'released', label: 'Oldest' },
    { value: '-added', label: 'Recently Added' },
    { value: 'name', label: 'Name A-Z' },
    { value: '-name', label: 'Name Z-A' },
    { value: '-metacritic', label: 'Metacritic Score' },
  ];

  const metacriticOptions = [
    { value: '', label: 'Any Score' },
    { value: '80,100', label: '80+ Universal Acclaim' },
    { value: '70,79', label: '70-79 Good' },
    { value: '60,69', label: '60-69 Mixed' },
    { value: '50,59', label: '50-59 Poor' },
  ];

  const handleGenreToggle = (genreId: string) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const handlePlatformToggle = (platformId: string) => {
    const newPlatforms = filters.platforms.includes(platformId)
      ? filters.platforms.filter(id => id !== platformId)
      : [...filters.platforms, platformId];
    
    onFiltersChange({ ...filters, platforms: newPlatforms });
  };

  const getSelectedGenreNames = () => {
    return genres
      .filter(genre => filters.genres.includes(genre.id.toString()))
      .map(genre => genre.name);
  };

  const getSelectedPlatformNames = () => {
    return platforms
      .filter(platform => filters.platforms.includes(platform.id.toString()))
      .map(platform => platform.name);
  };

  const hasActiveFilters = filters.genres.length > 0 || filters.platforms.length > 0 || 
                          filters.ordering !== '' || filters.metacritic !== '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={filters.ordering} onValueChange={(value) => 
            onFiltersChange({ ...filters, ordering: value })
          }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Relevance" />
            </SelectTrigger>
            <SelectContent>
              {orderingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Metacritic Score */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Score:</span>
          <Select value={filters.metacritic} onValueChange={(value) => 
            onFiltersChange({ ...filters, metacritic: value })
          }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Any Score" />
            </SelectTrigger>
            <SelectContent>
              {metacriticOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Genres Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Genres
              <ChevronDown className="h-4 w-4 ml-2" />
              {filters.genres.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {filters.genres.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              <h4 className="font-medium">Select Genres</h4>
              <div className="grid grid-cols-2 gap-2">
                {genres.map((genre) => (
                  <div key={genre.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre.id}`}
                      checked={filters.genres.includes(genre.id.toString())}
                      onCheckedChange={() => handleGenreToggle(genre.id.toString())}
                    />
                    <label 
                      htmlFor={`genre-${genre.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {genre.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Platforms Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Platforms
              <ChevronDown className="h-4 w-4 ml-2" />
              {filters.platforms.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {filters.platforms.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              <h4 className="font-medium">Select Platforms</h4>
              <div className="space-y-2">
                {platforms.slice(0, 20).map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`platform-${platform.id}`}
                      checked={filters.platforms.includes(platform.id.toString())}
                      onCheckedChange={() => handlePlatformToggle(platform.id.toString())}
                    />
                    <label 
                      htmlFor={`platform-${platform.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {platform.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(getSelectedGenreNames().length > 0 || getSelectedPlatformNames().length > 0) && (
        <div className="flex flex-wrap gap-2">
          {getSelectedGenreNames().map((name) => (
            <Badge key={name} variant="secondary" className="gap-1">
              {name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const genre = genres.find(g => g.name === name);
                  if (genre) handleGenreToggle(genre.id.toString());
                }}
              />
            </Badge>
          ))}
          {getSelectedPlatformNames().map((name) => (
            <Badge key={name} variant="secondary" className="gap-1">
              {name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const platform = platforms.find(p => p.name === name);
                  if (platform) handlePlatformToggle(platform.id.toString());
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}