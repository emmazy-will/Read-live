import { useState, useEffect } from 'react';
import { BookOpen, Github, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import BookSearch from '@/components/BookSearch';
import BookCard from '@/components/BookCard';
import BookReader from '@/components/BookReader';
import { BookService } from '@/services/bookService';
import heroImage from '@/assets/hero-books.jpg';

interface SearchFilters {
  language: string;
  format: string;
  sortBy: string;
}

interface Book {
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  description?: string;
  publishYear?: string;
  language?: string;
  subjects?: string[];
  formats?: { [key: string]: string };
  downloadCount?: number;
}

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentReader, setCurrentReader] = useState<Book | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setLoading(true);
    setCurrentPage(1);
    
    try {
      const result = await BookService.searchBooks(query, filters, 1);
      setBooks(result.books);
      setHasMore(result.hasMore);
      setSearchPerformed(true);
      
      toast({
        title: "Search completed",
        description: `Found ${result.books.length} books`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRead = (book: Book) => {
    setCurrentReader(book);
  };

  const handleDownload = async (book: Book, format: string) => {
    try {
      await BookService.downloadBook(book, format);
      toast({
        title: "Download started",
        description: `Downloading "${book.title}" in ${format.split('/').pop()?.toUpperCase()} format`,
      });
    } catch (error) {
      toast({
        title: "Download failed", 
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  const loadMoreBooks = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      // This would need the last search query and filters to be stored
      // For now, we'll just simulate loading more
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (currentReader) {
    return (
      <BookReader 
        book={currentReader} 
        onClose={() => setCurrentReader(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">LibraryLite</h1>
                <p className="text-sm text-muted-foreground">Free Public Domain Books</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden md:flex">
                <Star className="h-3 w-3 mr-1" />
                100% Free & Open Source
              </Badge>
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!searchPerformed && (
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={heroImage} 
              alt="Digital Library" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-bold text-foreground">
                  Discover
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Thousands</span>
                  <br />of Free Books
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Read classic literature, explore public domain works, and download books in multiple formats. 
                  All completely free and accessible from your browser.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold">Read Online</h3>
                    <p className="text-sm text-muted-foreground">Beautiful reading experience with customizable settings</p>
                  </div>
                </Card>
                
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold">Multiple Formats</h3>
                    <p className="text-sm text-muted-foreground">Download in EPUB, PDF, TXT, and HTML formats</p>
                  </div>
                </Card>
                
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Heart className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold">Always Free</h3>
                    <p className="text-sm text-muted-foreground">Public domain books accessible to everyone, forever</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <BookSearch 
            onSearch={handleSearch}
            onViewModeChange={setViewMode}
            viewMode={viewMode}
            loading={loading}
          />
        </div>
      </section>

      {/* Results Section */}
      {(searchPerformed || books.length > 0) && (
        <section className="pb-20">
          <div className="container mx-auto px-4">
            {loading && books.length === 0 ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching for books...</p>
              </div>
            ) : books.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                    : 'grid-cols-1'
                }`}>
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      viewMode={viewMode}
                      onRead={handleRead}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={loadMoreBooks}
                      disabled={loading}
                      className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                    >
                      {loading ? 'Loading...' : 'Load More Books'}
                    </Button>
                  </div>
                )}
              </>
            ) : searchPerformed && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No books found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters to find more books.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">LibraryLite</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Powered by Project Gutenberg and Open Library APIs. 
              All books are in the public domain and free to read and share.
            </p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 LibraryLite</span>
              <span>•</span>
              <span>Made with ❤️ for book lovers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
