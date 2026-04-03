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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-black">
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
        <div className="flex justify-center mb-8">
          <img 
            src="https://static.prod-images.emergentagent.com/jobs/9fa2035f-4651-4eaf-80e3-43f25667125a/images/69f2aefbf21d071c5793e03df39803d40d674c6749900143e91ce216698d49d4.png" 
            alt="Duck Duck Dex Logo" 
            className="w-full max-w-2xl h-auto"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white text-center mb-8">
          | Duck • Duck • Dex |
        </h1>
        
        <p className="text-base sm:text-lg text-gray-300 text-center mb-12 leading-relaxed">
          Search across Yandex & DuckDuckGo simultaneously
        </p>
        
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              data-testid="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full bg-neutral-900 border-2 border-neutral-700 focus:border-white rounded-full pl-16 pr-6 py-4 text-lg shadow-sm transition-all outline-none text-white placeholder:text-gray-500"
            />
          </div>
        </form>
        
        <div className="flex justify-center gap-6 mt-12">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-[#FC3F1D]/10 text-[#FC3F1D]">
              Yandex
            </div>
            <span className="text-sm text-gray-500">+</span>
            <div className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-[#DE5833]/10 text-[#DE5833]">
              DuckDuckGo
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer link */}
      <div className="absolute bottom-6 w-full text-center">
        <a 
          href="https://my.bio/theycallmegaddy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors"
        >
          gad_E
        </a>
      </div>
    </div>
  );
};

export default Home;