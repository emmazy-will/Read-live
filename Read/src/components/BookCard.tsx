import { useState } from 'react';
import { Download, Eye, User, Calendar, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface BookCardProps {
  book: Book;
  viewMode: 'grid' | 'list';
  onRead: (book: Book) => void;
  onDownload: (book: Book, format: string) => void;
}

const BookCard = ({ book, viewMode, onRead, onDownload }: BookCardProps) => {
  const [imageError, setImageError] = useState(false);

  const formatDownloadCount = (count: number | undefined) => {
    if (!count) return 'N/A';
    if (count > 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count > 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const getAvailableFormats = () => {
    if (!book.formats) return [];
    return Object.keys(book.formats).filter(format => 
      ['epub', 'txt', 'html', 'pdf'].some(ext => format.toLowerCase().includes(ext))
    );
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (viewMode === 'list') {
    return (
      <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300 group">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              {!imageError && book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  onError={handleImageError}
                  className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg shadow-book"
                />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-32 bg-gradient-warm rounded-lg flex items-center justify-center shadow-book">
                  <span className="text-primary font-semibold text-center px-2 text-xs sm:text-sm">
                    {book.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2 sm:space-y-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {truncateText(book.title, window.innerWidth < 640 ? 50 : 80)}
                </h3>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-muted-foreground mt-1 text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{book.authors.join(', ')}</span>
                  {book.publishYear && (
                    <>
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                      <span>{book.publishYear}</span>
                    </>
                  )}
                  {book.language && (
                    <>
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                      <span>{book.language.toUpperCase()}</span>
                    </>
                  )}
                </div>
              </div>

              {book.description && (
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed hidden sm:block">
                  {truncateText(book.description, window.innerWidth < 768 ? 120 : 200)}
                </p>
              )}

              <div className="flex flex-wrap gap-1 sm:gap-2">
                {book.subjects?.slice(0, 3).map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {truncateText(subject, 15)}
                  </Badge>
                ))}
                {book.downloadCount && (
                  <Badge variant="outline" className="text-xs">
                    {formatDownloadCount(book.downloadCount)} downloads
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1 sm:gap-2 pt-1 sm:pt-2">
                {getAvailableFormats().length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {getAvailableFormats().slice(0, 3).map((format) => (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(book, format)}
                        className="text-xs border-primary/20 hover:bg-primary/10 h-8"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {format.split('.').pop()?.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300 group overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-[3/4] relative overflow-hidden">
          {!imageError && book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-warm flex items-center justify-center p-2">
              <span className="text-primary font-bold text-center text-sm sm:text-base">
                {truncateText(book.title, window.innerWidth < 640 ? 40 : 60)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-center">
              {getAvailableFormats().length > 0 && (
                <Button
                  size={window.innerWidth < 640 ? "sm" : "lg"}
                  variant="outline"
                  onClick={() => onDownload(book, getAvailableFormats()[0])}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-200 w-full sm:w-auto"
                >
                  <span className="text-sm sm:text-base font-semibold">Read</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-xs sm:text-sm leading-tight">
            {truncateText(book.title, window.innerWidth < 640 ? 40 : 60)}
          </h3>
          <p className="text-muted-foreground text-xs">
            {truncateText(book.authors.join(', '), window.innerWidth < 640 ? 30 : 50)}
          </p>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            {book.publishYear && <span>{book.publishYear}</span>}
            {book.downloadCount && (
              <Badge variant="outline" className="text-xs">
                {formatDownloadCount(book.downloadCount)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;