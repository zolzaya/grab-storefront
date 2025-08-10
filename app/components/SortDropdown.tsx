import { useState, useEffect } from "react";
import { SORT_OPTIONS, SORT_CATEGORIES } from "~/lib/constants";

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (sortValue: string) => void;
  showCategories?: boolean;
  compact?: boolean;
}

export function SortDropdown({ 
  currentSort, 
  onSortChange, 
  showCategories = true,
  compact = false 
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSorts, setRecentSorts] = useState<string[]>([]);

  // Load user's recent sort preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent-sorts');
      if (saved) {
        setRecentSorts(JSON.parse(saved));
      }
    }
  }, []);

  // Save sort choice to recent sorts
  const handleSortSelect = (sortValue: string) => {
    onSortChange(sortValue);
    setIsOpen(false);

    if (typeof window !== 'undefined') {
      const newRecentSorts = [
        sortValue,
        ...recentSorts.filter(s => s !== sortValue)
      ].slice(0, 3);
      
      setRecentSorts(newRecentSorts);
      localStorage.setItem('recent-sorts', JSON.stringify(newRecentSorts));
    }
  };

  const currentOption = SORT_OPTIONS.find(option => option.value === currentSort) || SORT_OPTIONS[0];
  
  // Group options by category for organized display
  const groupedOptions = SORT_OPTIONS.reduce((acc, option) => {
    const category = option.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {} as Record<string, typeof SORT_OPTIONS>);

  // Get recent sort options for quick access
  const recentOptions = recentSorts
    .map(sortValue => SORT_OPTIONS.find(option => option.value === sortValue))
    .filter((option): option is typeof SORT_OPTIONS[0] => Boolean(option));

  if (compact) {
    return (
      <select 
        value={currentSort} 
        onChange={(e) => handleSortSelect(e.target.value)}
        className="px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-sm"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-w-[200px]"
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          <span>{currentOption.label}</span>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 w-80 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-large">
            <div className="py-2">
              {/* Recent Sorts */}
              {recentOptions.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-100">
                    Recently Used
                  </div>
                  {recentOptions.map((option) => (
                    <button
                      key={`recent-${option.value}`}
                      onClick={() => handleSortSelect(option.value)}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center justify-between ${
                        currentSort === option.value
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{option.label}</span>
                      </div>
                      {currentSort === option.value && (
                        <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                  <div className="border-b border-neutral-100 my-2" />
                </>
              )}

              {/* Categorized Sort Options */}
              {showCategories ? (
                Object.entries(groupedOptions).map(([categoryKey, options]) => (
                  <div key={categoryKey}>
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {SORT_CATEGORIES[categoryKey as keyof typeof SORT_CATEGORIES] || categoryKey}
                    </div>
                    {options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortSelect(option.value)}
                        className={`w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center justify-between ${
                          currentSort === option.value
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-neutral-700'
                        }`}
                      >
                        <span className="text-sm pl-4">{option.label}</span>
                        {currentSort === option.value && (
                          <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                // Flat list when categories are disabled
                SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className={`w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center justify-between ${
                      currentSort === option.value
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-neutral-700'
                    }`}
                  >
                    <span className="text-sm">{option.label}</span>
                    {currentSort === option.value && (
                      <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}

              {/* Custom Sort Option (Future Enhancement) */}
              <div className="border-t border-neutral-100 mt-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Custom Sort (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}