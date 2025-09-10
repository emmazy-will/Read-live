import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  language: string;
  format: string;
  sortBy: string;
}

interface BookSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  loading?: boolean;
}

const BookSearch = ({ onSearch, onViewModeChange, viewMode, loading }: BookSearchProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    language: 'all',
    format: 'all',
    sortBy: 'relevance'
  });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    'Search for "Pride and Prejudice"...',
    'Find books by "Charles Dickens"...',
    'Explore "science fiction"...',
    'Discover "classic literature"...',
    'Search for "programming books"...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query.trim(), newFilters);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="pl-12 pr-32 h-14 text-lg bg-card/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 focus:bg-card/80 transition-all duration-300 placeholder:text-muted-foreground/70"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="hover:bg-primary/10"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={loading}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-book"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full p-2 rounded-md border border-border bg-background text-foreground"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Format</label>
              <select
                value={filters.format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="w-full p-2 rounded-md border border-border bg-background text-foreground"
              >
                <option value="all">All Formats</option>
                <option value="epub">EPUB</option>
                <option value="txt">Text</option>
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-2 rounded-md border border-border bg-background text-foreground"
              >
                <option value="relevance">Relevance</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="downloads">Popularity</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-gradient-warm">
            Free Public Domain Books
          </Badge>
          <Badge variant="outline">
            Powered by Project Gutenberg & Open Library
          </Badge>
        </div>
        <div className="flex rounded-lg border border-border bg-card p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={viewMode === 'grid' ? 'bg-gradient-primary text-primary-foreground' : ''}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={viewMode === 'list' ? 'bg-gradient-primary text-primary-foreground' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookSearch;