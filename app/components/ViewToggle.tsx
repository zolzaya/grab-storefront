import { useState, useEffect } from "react";

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
  className?: string;
}

const VIEW_ICONS = {
  grid: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  list: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
};

const VIEW_LABELS = {
  grid: 'Grid',
  list: 'List'
};

export function ViewToggle({ 
  currentView, 
  onViewChange, 
  availableViews = ['grid', 'list'],
  className = ""
}: ViewToggleProps) {
  
  // Save user's view preference
  const handleViewChange = (view: ViewMode) => {
    onViewChange(view);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-view', view);
    }
  };

  // Load user's preferred view on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-view') as ViewMode;
      if (saved && availableViews.includes(saved) && saved !== currentView) {
        onViewChange(saved);
      }
    }
  }, []);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-sm font-medium text-neutral-700 mr-2">View:</span>
      <div className="flex bg-neutral-100 rounded-xl p-1">
        {availableViews.map((view) => (
          <button
            key={view}
            onClick={() => handleViewChange(view)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              view === currentView
                ? 'bg-white text-neutral-900 shadow-soft'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
            title={`${VIEW_LABELS[view]} view`}
          >
            {VIEW_ICONS[view]}
            <span className="ml-2 hidden sm:inline">{VIEW_LABELS[view]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Hook for responsive view adjustments
export function useResponsiveView(baseView: ViewMode): ViewMode {
  const [responsiveView, setResponsiveView] = useState<ViewMode>(baseView);

  useEffect(() => {
    const updateView = () => {
      // Mobile: Convert grid to list for better mobile experience
      if (window.innerWidth < 640 && baseView === 'grid') {
        setResponsiveView('list');
      } else {
        setResponsiveView(baseView);
      }
    };

    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, [baseView]);

  return responsiveView;
}

// Grid configuration for different view modes
export const getGridClasses = (view: ViewMode, screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop') => {
  const configs = {
    grid: {
      mobile: 'grid-cols-1 sm:grid-cols-2',
      tablet: 'grid-cols-2 lg:grid-cols-3',
      desktop: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    },
    list: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-1',
      desktop: 'grid-cols-1'
    }
  };

  return `grid gap-6 ${configs[view][screenSize]}`;
};