import { Link } from "@remix-run/react";

interface CategoryIconProps {
  name: string;
  slug: string;
  icon: React.ReactNode;
}

export function CategoryIcon({ name, slug, icon }: CategoryIconProps) {
  return (
    <Link to={`/collections/${slug}`} className="group">
      <div className="flex flex-col items-center text-center space-y-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
            {icon}
          </div>
        </div>
        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {name}
        </span>
      </div>
    </Link>
  );
}

// Predefined category icons
export const categoryIcons = {
  tv: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  vacuum: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  washingMachine: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
      <circle cx="12" cy="13" r="4" />
      <circle cx="7" cy="8" r="1" />
      <circle cx="11" cy="8" r="1" />
    </svg>
  ),
  mattress: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M3 14h18M5 10V8a2 2 0 012-2h10a2 2 0 012 2v2M5 14v2a2 2 0 002 2h10a2 2 0 002-2v-2" />
    </svg>
  ),
  refrigerator: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 12h12" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 6v2m0 8v2" />
    </svg>
  ),
  cooktop: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12h18m-9 4.5V19m-8-7v5a2 2 0 002 2h12a2 2 0 002-2v-5M5 12V7a2 2 0 012-2h10a2 2 0 012 2v5" />
      <circle cx="8" cy="9" r="1" />
      <circle cx="16" cy="9" r="1" />
    </svg>
  ),
  phone: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
    </svg>
  ),
  computer: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  furniture: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
};

// Categories data with Mongolian names
export const featuredCategories = [
  { name: "Ухаалаг зурагт", slug: "tv-monitors", icon: categoryIcons.tv },
  { name: "Тоос сорогч", slug: "vacuum-cleaners", icon: categoryIcons.vacuum },
  { name: "Угаалгын машин", slug: "washing-machines", icon: categoryIcons.washingMachine },
  { name: "Матрас", slug: "mattresses", icon: categoryIcons.mattress },
  { name: "Хөргөгч", slug: "refrigerators", icon: categoryIcons.refrigerator },
  { name: "Тавцан плита", slug: "cooktops", icon: categoryIcons.cooktop },
  { name: "Гар утас", slug: "phones", icon: categoryIcons.phone },
  { name: "Компьютер", slug: "computers", icon: categoryIcons.computer },
  { name: "Ширээ, сандал", slug: "furniture", icon: categoryIcons.furniture }
];