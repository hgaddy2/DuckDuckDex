import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const Home = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background image with low opacity */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1651761292876-fcf8b98db945?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwYWJzdHJhY3QlMjBnZW9tZXRyaWMlMjBhcnR8ZW58MHx8fHwxNzc1MjE1NTc0fDA&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="max-w-4xl w-full relative z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111111] text-center mb-8">
          Dual Search
        </h1>
        
        <p className="text-base sm:text-lg text-[#525252] text-center mb-12 leading-relaxed">
          Search across Yandex & DuckDuckGo simultaneously
        </p>
        
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#525252] w-6 h-6" />
            <input
              type="text"
              data-testid="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full bg-white border-2 border-[#E5E5E5] focus:border-[#111111] rounded-full pl-16 pr-6 py-4 text-lg shadow-sm transition-all outline-none text-[#111111] placeholder:text-[#8A8A8A]"
            />
          </div>
        </form>
        
        <div className="flex justify-center gap-6 mt-12">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-[#FC3F1D]/10 text-[#FC3F1D]">
              Yandex
            </div>
            <span className="text-sm text-[#8A8A8A]">+</span>
            <div className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-[#DE5833]/10 text-[#DE5833]">
              DuckDuckGo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;