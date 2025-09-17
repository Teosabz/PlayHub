import { useState, useEffect } from 'react';
import { Search, Heart, Zap, Trophy, Gamepad, Shield, Target, Cpu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface HeaderProps {
  onSearch: (query: string) => void;
  onToggleFavorites: () => void;
  showingFavorites: boolean;
  favoritesCount: number;
  searchQuery: string;
}

export function Header({ onSearch, onToggleFavorites, showingFavorites, favoritesCount, searchQuery }: HeaderProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState('discover');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
    setActiveTab('discover');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
    if (e.target.value === '') {
      onSearch('');
    }
  };

  const handleFavoritesClick = () => {
    onToggleFavorites();
    setActiveTab('favorites');
  };

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Zap, active: activeTab === 'discover' && !showingFavorites },
    { id: 'trending', label: 'Trending', icon: Trophy, active: false },
    { id: 'favorites', label: 'Collection', icon: Heart, active: showingFavorites, count: favoritesCount },
    { id: 'platforms', label: 'Platforms', icon: Shield, active: false },
  ];

  return (
    <header className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/30">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,theme(colors.purple.600/0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.cyan.600/0.1),transparent_50%)]"></div>
      </div>
      
      {/* Glowing line effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

      <div className="relative container mx-auto px-4">
        {/* Top bar with logo and status */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo section with gaming aesthetic */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative bg-slate-900 rounded-full p-2 border border-purple-500/50">
                <Gamepad className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PLAYHUB
              </h1>
              <div className="text-xs text-purple-300/70 font-mono">
                v2.0.1 • GAMING TERMINAL
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="hidden lg:flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">ONLINE</span>
            </div>
            <div className="text-purple-300">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="flex items-center space-x-1">
              <Cpu className="h-3 w-3 text-cyan-400" />
              <span className="text-cyan-400">98%</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs with futuristic design */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 space-y-4 lg:space-y-0">
          {/* Navigation tabs */}
          <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-purple-500/30">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={item.id === 'favorites' ? handleFavoritesClick : () => setActiveTab(item.id)}
                  className={`
                    relative px-4 py-2 rounded-md transition-all duration-300 group
                    ${item.active 
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25' 
                      : 'text-purple-300 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                >
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-md blur-sm opacity-50 animate-pulse"></div>
                  )}
                  <div className="relative flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 rounded-full">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-purple-400 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Button>
              );
            })}
          </div>

          {/* Enhanced search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md lg:max-w-sm">
            <div className={`
              relative transition-all duration-300
              ${isSearchFocused 
                ? 'shadow-lg shadow-cyan-500/25 scale-105' 
                : 'shadow-md shadow-purple-500/10'
              }
            `}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg blur opacity-30"></div>
              <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-lg border border-purple-500/30">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search className={`h-4 w-4 transition-colors duration-300 ${
                    isSearchFocused ? 'text-cyan-400' : 'text-purple-400'
                  }`} />
                </div>
                <Input
                  type="search"
                  placeholder="Search the gaming universe..."
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 pr-4 py-3 bg-transparent border-none text-white placeholder-purple-300/70 focus:outline-none focus:ring-0 font-mono text-sm"
                />
                {/* Search glow effect */}
                {isSearchFocused && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Target className="h-4 w-4 text-cyan-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Mobile responsive adjustments */}
        <div className="lg:hidden">
          {/* Mobile search (always visible on small screens) */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg blur opacity-30"></div>
              <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-lg border border-purple-500/30">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                <Input
                  type="search"
                  placeholder="Search games..."
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-3 bg-transparent border-none text-white placeholder-purple-300/70 font-mono"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
      </div>
    </header>
  );
}