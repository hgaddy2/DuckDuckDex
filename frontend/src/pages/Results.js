import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Search, Bookmark, BookmarkCheck, Filter, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedUrls, setBookmarkedUrls] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [safeSearch, setSafeSearch] = useState(true);
  const [region, setRegion] = useState("us-en");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (query) {
      performSearch(query);
      loadBookmarks();
    }
  }, [query]);

  const loadBookmarks = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks`);
      const urls = new Set(response.data.map(b => b.url));
      setBookmarkedUrls(urls);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const performSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/search`, {
        query: searchTerm,
        date_filter: dateFilter || null,
        region: region,
        safe_search: safeSearch
      });
      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleBookmark = async (result) => {
    try {
      if (bookmarkedUrls.has(result.url)) {
        // Remove bookmark
        const response = await axios.get(`${API}/bookmarks`);
        const bookmark = response.data.find(b => b.url === result.url);
        if (bookmark) {
          await axios.delete(`${API}/bookmarks/${bookmark.id}`);
          const newBookmarks = new Set(bookmarkedUrls);
          newBookmarks.delete(result.url);
          setBookmarkedUrls(newBookmarks);
          toast.success("Bookmark removed");
        }
      } else {
        // Add bookmark
        await axios.post(`${API}/bookmarks`, {
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          source: result.source
        });
        setBookmarkedUrls(new Set([...bookmarkedUrls, result.url]));
        toast.success("Bookmark added");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto py-4 px-6 md:px-12">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-xl font-black tracking-tight text-[#111111] hover:text-[#525252] transition-colors"
            >
              Dual Search
            </Link>
            
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252] w-5 h-5" />
                <input
                  type="text"
                  data-testid="search-input-header"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-white border-2 border-[#E5E5E5] focus:border-[#111111] rounded-full pl-12 pr-4 py-2.5 text-base shadow-sm transition-all outline-none text-[#111111] placeholder:text-[#8A8A8A]"
                />
              </div>
            </form>
            
            <button
              data-testid="filter-toggle-button"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 rounded-full hover:bg-[#F9F9F9] text-[#525252] hover:text-[#111111] transition-all border border-[#E5E5E5]"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <Link
              to="/bookmarks"
              data-testid="bookmarks-link"
              className="p-2.5 rounded-full hover:bg-[#F9F9F9] text-[#525252] hover:text-[#111111] transition-all border border-[#E5E5E5]"
            >
              <BookmarkCheck className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E5E5E5] mt-4" data-testid="filters-panel">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Region:</label>
                <select
                  data-testid="region-select"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#111111] focus:border-[#111111] outline-none transition-colors"
                >
                  <option value="us-en">United States</option>
                  <option value="uk-en">United Kingdom</option>
                  <option value="ca-en">Canada</option>
                  <option value="au-en">Australia</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Date:</label>
                <select
                  data-testid="date-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#111111] focus:border-[#111111] outline-none transition-colors"
                >
                  <option value="">Any time</option>
                  <option value="day">Past 24 hours</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                  <option value="year">Past year</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  data-testid="safe-search-checkbox"
                  id="safeSearch"
                  checked={safeSearch}
                  onChange={(e) => setSafeSearch(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E5E5E5] text-[#111111] focus:ring-2 focus:ring-[#111111]/20"
                />
                <label htmlFor="safeSearch" className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A] cursor-pointer">
                  Safe Search
                </label>
              </div>
              
              <button
                data-testid="apply-filters-button"
                onClick={() => performSearch(query)}
                className="ml-auto px-4 py-1.5 bg-[#111111] text-white text-sm font-medium rounded-full hover:bg-[#333333] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Results */}
      <main className="max-w-4xl mx-auto py-8 px-6 md:px-12">
        {loading ? (
          <div className="flex items-center justify-center py-20" data-testid="loading-indicator">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#111111] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#8A8A8A]">Searching...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20" data-testid="no-results">
            <p className="text-lg text-[#525252]">No results found</p>
            <p className="text-sm text-[#8A8A8A] mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2" data-testid="results-list">
            {results.map((result, index) => (
              <div
                key={index}
                data-testid={`result-item-${index}`}
                className="group relative flex flex-col gap-2 p-6 rounded-2xl hover:bg-[#F9F9F9] transition-all duration-300 ease-out border border-transparent hover:border-[#E5E5E5]"
              >
                {/* Source Badge */}
                <div className="flex items-center gap-2">
                  <span
                    data-testid={`result-badge-${result.source}`}
                    className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                      result.source === 'yandex'
                        ? 'bg-[#FC3F1D]/10 text-[#FC3F1D]'
                        : 'bg-[#DE5833]/10 text-[#DE5833]'
                    }`}
                  >
                    {result.source === 'yandex' ? 'Yandex' : 'DuckDuckGo'}
                  </span>
                </div>
                
                {/* Title */}
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`result-title-${index}`}
                  className="text-xl font-bold tracking-tight text-[#111111] hover:text-[#525252] transition-colors"
                >
                  {result.title}
                </a>
                
                {/* URL */}
                <p className="text-xs text-[#8A8A8A] break-all" data-testid={`result-url-${index}`}>
                  {result.url}
                </p>
                
                {/* Snippet */}
                {result.snippet && (
                  <p className="text-base leading-relaxed text-[#525252]" data-testid={`result-snippet-${index}`}>
                    {result.snippet}
                  </p>
                )}
                
                {/* Bookmark Button */}
                <button
                  data-testid={`bookmark-button-${index}`}
                  onClick={() => handleBookmark(result)}
                  className={`absolute right-6 top-6 p-2 rounded-full hover:bg-[#E5E5E5] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${
                    bookmarkedUrls.has(result.url)
                      ? 'text-[#111111] opacity-100 bg-[#E5E5E5]'
                      : 'text-[#8A8A8A] hover:text-[#111111]'
                  }`}
                >
                  {bookmarkedUrls.has(result.url) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Results;