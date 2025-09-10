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

export class BookService {
  private static readonly GUTENBERG_API = 'https://gutendex.com/books';
  private static readonly OPENLIBRARY_API = 'https://openlibrary.org';
  private static readonly OPENLIBRARY_COVERS = 'https://covers.openlibrary.org/b';
  private static readonly CORS_PROXY = 'https://api.allorigins.win/get?url=';

  static async searchBooks(query: string, filters: SearchFilters, page: number = 1): Promise<{
    books: Book[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      // Try Gutenberg first for public domain books
      const gutenbergBooks = await this.searchGutenberg(query, filters, page);
      
      // If we don't have enough results, supplement with Open Library
      if (gutenbergBooks.books.length < 10) {
        const openLibraryBooks = await this.searchOpenLibrary(query, filters, page);
        
        // Combine and deduplicate
        const allBooks = [...gutenbergBooks.books, ...openLibraryBooks.books];
        const uniqueBooks = this.deduplicateBooks(allBooks);
        
        return {
          books: uniqueBooks.slice(0, 20),
          totalCount: gutenbergBooks.totalCount + openLibraryBooks.totalCount,
          hasMore: uniqueBooks.length >= 20
        };
      }
      
      return gutenbergBooks;
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books. Please try again.');
    }
  }

  private static async searchGutenberg(query: string, filters: SearchFilters, page: number): Promise<{
    books: Book[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams({
      search: query,
      page: page.toString(),
    });

    if (filters.language !== 'all') {
      params.append('languages', filters.language);
    }

    if (filters.format !== 'all') {
      params.append('mime_type', this.getMimeType(filters.format));
    }

    switch (filters.sortBy) {
      case 'downloads':
        params.append('sort', 'download_count');
        break;
      case 'title':
        params.append('sort', 'title');
        break;
      case 'author':
        params.append('sort', 'author');
        break;
    }

    const response = await fetch(`${this.GUTENBERG_API}?${params}`);
    
    if (!response.ok) {
      console.error('Gutenberg API failed, status:', response.status);
      throw new Error('Gutenberg API request failed');
    }

    const data = await response.json();
    
    const books: Book[] = data.results.map((item: any) => ({
      id: `gutenberg-${item.id}`,
      title: item.title,
      authors: item.authors.map((author: any) => author.name),
      coverUrl: this.findBestCover(item.formats),
      description: item.subjects.join(', '),
      publishYear: item.download_count > 1000 ? 'Classic' : undefined,
      language: item.languages[0]?.toUpperCase(),
      subjects: item.subjects.slice(0, 5),
      formats: item.formats,
      downloadCount: item.download_count
    }));

    return {
      books,
      totalCount: data.count,
      hasMore: data.next !== null
    };
  }

  private static async searchOpenLibrary(query: string, filters: SearchFilters, page: number): Promise<{
    books: Book[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: '10'
    });

    if (filters.language !== 'all') {
      params.append('language', filters.language);
    }

    const response = await fetch(`${this.OPENLIBRARY_API}/search.json?${params}`);
    
    if (!response.ok) {
      console.error('Open Library API failed, status:', response.status);
      throw new Error('Open Library API request failed');
    }

    const data = await response.json();
    
    const books: Book[] = data.docs.slice(0, 10).map((item: any) => ({
      id: `openlibrary-${item.key?.replace('/works/', '')}`,
      title: item.title,
      authors: item.author_name || ['Unknown Author'],
      coverUrl: item.cover_i ? `${this.OPENLIBRARY_COVERS}/id/${item.cover_i}-M.jpg` : undefined,
      description: item.first_sentence ? item.first_sentence.join(' ') : undefined,
      publishYear: item.first_publish_year?.toString(),
      language: item.language?.[0]?.toUpperCase(),
      subjects: item.subject?.slice(0, 5),
      formats: this.createOpenLibraryFormats(item),
      downloadCount: item.want_to_read_count || 0
    }));

    return {
      books,
      totalCount: data.numFound,
      hasMore: data.docs.length >= 10
    };
  }

  private static findBestCover(formats: any): string | undefined {
    // Look for image formats in Gutenberg
    const imageFormats = ['image/jpeg', 'image/png', 'image/gif'];
    
    for (const format of imageFormats) {
      if (formats[format]) {
        return formats[format];
      }
    }
    
    return undefined;
  }

  private static getMimeType(format: string): string {
    switch (format.toLowerCase()) {
      case 'epub':
        return 'application/epub+zip';
      case 'txt':
        return 'text/plain';
      case 'html':
        return 'text/html';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'text/plain';
    }
  }

  private static createOpenLibraryFormats(item: any): { [key: string]: string } {
    const formats: { [key: string]: string } = {};
    
    if (item.key) {
      const workId = item.key.replace('/works/', '');
      // Note: Open Library doesn't directly provide downloadable content
      // This would need to be supplemented with actual download links
      formats['text/html'] = `${this.OPENLIBRARY_API}${item.key}`;
    }
    
    return formats;
  }

  private static deduplicateBooks(books: Book[]): Book[] {
    const seen = new Set<string>();
    return books.filter(book => {
      const key = `${book.title.toLowerCase()}-${book.authors[0]?.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  static async downloadBook(book: Book, format: string): Promise<void> {
    if (!book.formats || !book.formats[format]) {
      throw new Error('Format not available for download');
    }

    const url = book.formats[format];
    const filename = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format.split('/').pop()}`;
    
    try {
      // For Gutenberg books, try direct download first
      if (url.includes('gutenberg.org')) {
        // Create a direct link for Gutenberg downloads
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // For other sources, try fetch with CORS proxy
      const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const responseData = await response.json();
      const blob = new Blob([responseData.contents], { type: 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download book - try the direct link instead');
    }
  }

  static async getBookDetails(bookId: string): Promise<Book | null> {
    try {
      if (bookId.startsWith('gutenberg-')) {
        const id = bookId.replace('gutenberg-', '');
        const response = await fetch(`${this.GUTENBERG_API}/${id}`);
        
        if (!response.ok) {
          throw new Error('Book not found');
        }
        
        const item = await response.json();
        
        return {
          id: bookId,
          title: item.title,
          authors: item.authors.map((author: any) => author.name),
          coverUrl: this.findBestCover(item.formats),
          description: item.subjects.join(', '),
          publishYear: item.download_count > 1000 ? 'Classic' : undefined,
          language: item.languages[0]?.toUpperCase(),
          subjects: item.subjects,
          formats: item.formats,
          downloadCount: item.download_count
        };
      }
      
      // Handle Open Library books here if needed
      return null;
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  }

  static getReadingProgress(bookId: string): { page: number; isBookmarked: boolean } | null {
    const progress = localStorage.getItem(`reading-progress-${bookId}`);
    return progress ? JSON.parse(progress) : null;
  }

  static saveReadingProgress(bookId: string, page: number, isBookmarked: boolean): void {
    localStorage.setItem(`reading-progress-${bookId}`, JSON.stringify({
      page,
      isBookmarked,
      lastRead: new Date().toISOString()
    }));
  }
}