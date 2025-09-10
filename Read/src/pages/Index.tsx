import { useState, useEffect } from 'react';
import { BookOpen, Github, Heart, Star, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-primary shrink-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-foreground truncate">
                  LibraryLite
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block truncate">
                  Free Public Domain Books
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Badge variant="outline" className="hidden lg:flex text-xs">
                <Star className="h-3 w-3 mr-1" />
                100% Free & Open Source
              </Badge>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <Github className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden lg:inline">GitHub</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/50 py-3 space-y-2">
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="self-start text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  100% Free & Open Source
                </Badge>
                <Button variant="ghost" size="sm" className="justify-start text-xs">
                  <Github className="h-3 w-3 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      {!searchPerformed && (
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10 sm:opacity-20">
            <img 
              src={heroImage} 
              alt="Digital Library" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-foreground leading-tight">
                  Discover
                  <span className="bg-gradient-hero bg-clip-text text-transparent block sm:inline">
                    {" "}Thousands
                  </span>
                  <br className="hidden sm:block" />
                  <span className="block sm:inline">of Free Books</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
                  Read classic literature, explore public domain works, and download books in multiple formats. 
                  All completely free and accessible from your browser.
                </p>
              </div>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
                <Card className="p-4 sm:p-5 lg:p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300">
                  <div className="text-center space-y-2 sm:space-y-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg">Read Online</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Beautiful reading experience with customizable settings
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4 sm:p-5 lg:p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300">
                  <div className="text-center space-y-2 sm:space-y-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg">Multiple Formats</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Download in EPUB, PDF, TXT, and HTML formats
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4 sm:p-5 lg:p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <div className="text-center space-y-2 sm:space-y-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg">Always Free</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Public domain books accessible to everyone, forever
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search Section */}
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
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
        <section className="pb-8 sm:pb-12 lg:pb-20">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            {loading && books.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-muted-foreground">Searching for books...</p>
              </div>
            ) : books.length > 0 ? (
              <>
                <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
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
                  <div className="text-center mt-8 sm:mt-10 lg:mt-12">
                    <Button
                      onClick={loadMoreBooks}
                      disabled={loading}
                      className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                    >
                      {loading ? 'Loading...' : 'Load More Books'}
                    </Button>
                  </div>
                )}
              </>
            ) : searchPerformed && (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <div className="max-w-md mx-auto space-y-3 sm:space-y-4 px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">No books found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="font-semibold text-sm sm:text-base">LibraryLite</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed px-2">
              Powered by Project Gutenberg and Open Library APIs. 
              All books are in the public domain and free to read and share.
            </p>
            <div className="flex flex-col xs:flex-row justify-center gap-2 xs:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>© 2024 LibraryLite</span>
              <span className="hidden xs:inline">•</span>
              <span>Made with ❤️ for book lovers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;