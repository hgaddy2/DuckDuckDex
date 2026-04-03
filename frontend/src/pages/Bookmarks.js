import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookmarkCheck, Trash2, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/bookmarks`);
      setBookmarks(response.data);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookmarkId) => {
    try {
      await axios.delete(`${API}/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      toast.success("Bookmark deleted");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("Failed to delete bookmark");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto py-4 px-6 md:px-12">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              data-testid="back-home-link"
              className="p-2 rounded-full hover:bg-[#F9F9F9] text-[#525252] hover:text-[#111111] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">
              Bookmarks
            </h1>
            
            <div className="ml-auto flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-[#525252]" />
              <span className="text-sm text-[#8A8A8A]">{bookmarks.length} saved</span>
            </div>
          </div>
        </div>
      </header>

      {/* Bookmarks List */}
      <main className="max-w-4xl mx-auto py-8 px-6 md:px-12">
        {loading ? (
          <div className="flex items-center justify-center py-20" data-testid="loading-indicator">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#111111] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#8A8A8A]">Loading bookmarks...</p>
            </div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20" data-testid="no-bookmarks">
            <BookmarkCheck className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <p className="text-lg text-[#525252]">No bookmarks yet</p>
            <p className="text-sm text-[#8A8A8A] mt-2">Start searching and save your favorite results</p>
            <Link
              to="/"
              className="inline-block mt-6 px-6 py-3 bg-[#111111] text-white font-medium rounded-full hover:bg-[#333333] transition-colors"
            >
              Start Searching
            </Link>
          </div>
        ) : (
          <div className="flex flex-col space-y-2" data-testid="bookmarks-list">
            {bookmarks.map((bookmark, index) => (
              <div
                key={bookmark.id}
                data-testid={`bookmark-item-${index}`}
                className="group relative flex flex-col gap-2 p-6 rounded-2xl hover:bg-[#F9F9F9] transition-all duration-300 ease-out border border-transparent hover:border-[#E5E5E5]"
              >
                {/* Source Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                      bookmark.source === 'yandex'
                        ? 'bg-[#FC3F1D]/10 text-[#FC3F1D]'
                        : 'bg-[#DE5833]/10 text-[#DE5833]'
                    }`}
                  >
                    {bookmark.source === 'yandex' ? 'Yandex' : 'DuckDuckGo'}
                  </span>
                </div>
                
                {/* Title */}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`bookmark-title-${index}`}
                  className="text-xl font-bold tracking-tight text-[#111111] hover:text-[#525252] transition-colors"
                >
                  {bookmark.title}
                </a>
                
                {/* URL */}
                <p className="text-xs text-[#8A8A8A] break-all">
                  {bookmark.url}
                </p>
                
                {/* Snippet */}
                {bookmark.snippet && (
                  <p className="text-base leading-relaxed text-[#525252]">
                    {bookmark.snippet}
                  </p>
                )}
                
                {/* Delete Button */}
                <button
                  data-testid={`delete-bookmark-${index}`}
                  onClick={() => handleDelete(bookmark.id)}
                  className="absolute right-6 top-6 p-2 rounded-full hover:bg-red-50 text-[#8A8A8A] hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookmarks;