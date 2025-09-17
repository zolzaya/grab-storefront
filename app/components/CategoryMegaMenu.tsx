import { Link } from '@remix-run/react'
import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'

interface CategoryMegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

const categories = [
  {
    id: 'audio-video',
    name: 'ЗУРАГТ, АУДИО',
    icon: '📺',
    subcategories: [
      {
        name: 'Зурагт',
        items: [
          '43 хүртэл инч',
          '44-50 инч',
          '51-55 инч',
          '56-75 инч',
          '76-с дээш инч'
        ]
      },
      {
        name: 'Аудио, видео техоборомж',
        items: [
          'Шуут намхууллын техоборомж',
          'Тайван / Студийн чанга яригч',
          'Дууны холигийн систем, интерфейс',
          'Студийн микрофон, A4V',
          'Чихний мониторн систем'
        ]
      }
    ]
  },
  {
    id: 'kitchen-appliances',
    name: 'ГАЛ ТОГООНЫ ЦАХИЛГААН БАРАА',
    icon: '🏠',
    subcategories: [
      {
        name: 'Тогооны хэрэгсэл',
        items: [
          'Цахилгаан зуух',
          'Микроволн зуух',
          'Халаагч',
          'Кофе машин',
          'Блендер'
        ]
      }
    ]
  },
  {
    id: 'home-appliances',
    name: 'ГЭР АХУЙН ЦАХИЛГААН БАРАА',
    icon: '🏡',
    subcategories: [
      {
        name: 'Цэвэрлэгээний хэрэгсэл',
        items: [
          'Тоос сорогч',
          'Угаалгын машин',
          'Хатаагч',
          'Индүү машин',
          'Утаа сорогч'
        ]
      }
    ]
  },
  {
    id: 'computers',
    name: 'КОМПЬЮТЕР, ПРИНТЕР',
    icon: '💻',
    subcategories: [
      {
        name: 'Компьютер',
        items: [
          'Десктоп компьютер',
          'Ноутбук',
          'Таблет',
          'Мониторы',
          'Хэвлэгч'
        ]
      }
    ]
  },
  {
    id: 'mobile-devices',
    name: 'ГАР УТАС, ТАБЛЕТ',
    icon: '📱',
    subcategories: [
      {
        name: 'Гар утас',
        items: [
          'Ухаалаг утас',
          'Хамгаалалтын бүрээс',
          'Цэнэглэгч',
          'Чихэвч',
          'Дэлгэцийн хуурай'
        ]
      }
    ]
  },
  {
    id: 'smart-tech',
    name: 'УХААЛАГ ТЕХНОЛОГИ',
    icon: '🔌',
    subcategories: [
      {
        name: 'Ухаалаг гэр',
        items: [
          'Ухаалаг гэрэл',
          'Хариулагч',
          'Камер систем',
          'Хаалгны цоож',
          'Температур хянагч'
        ]
      }
    ]
  },
  {
    id: 'health-beauty',
    name: 'ЭРҮҮЛ МЭНД, ГОО САЙХАН',
    icon: '💄',
    subcategories: [
      {
        name: 'Гоо сайханы хэрэгсэл',
        items: [
          'Үс засах хэрэгсэл',
          'Арьс арчлах',
          'Гэгээрүүлэгч',
          'Массажийн хэрэгсэл',
          'Эрүүл мэндийн хэмжигч'
        ]
      }
    ]
  },
  {
    id: 'kitchen-tools',
    name: 'ГАЛ ТОГОО, ГЭР АХУЙН ХЭРЭГСЭЛ',
    icon: '🍳',
    subcategories: [
      {
        name: 'Тогооны хэрэгсэл',
        items: [
          'Хутга',
          'Таваг',
          'Тогоо',
          'Хайчлага хэрэгсэл',
          'Хадгалах сав'
        ]
      }
    ]
  },
  {
    id: 'furniture',
    name: 'ТАВИЛГА',
    icon: '🪑',
    subcategories: [
      {
        name: 'Гэрийн тавилга',
        items: [
          'Суудал',
          'Ширээ',
          'Орон',
          'Хувцасны шүүгээ',
          'Тавиур'
        ]
      }
    ]
  },
  {
    id: 'accessories',
    name: 'НЭМЭЛТ ҮЙЛЧИЛГЭЭ, ДАГАЛДАХ ХЭРЭГСЭЛ',
    icon: '🔧',
    subcategories: [
      {
        name: 'Дагалдах хэрэгсэл',
        items: [
          'Кабель',
          'Адаптер',
          'Батарей',
          'Хадгалах хэрэгсэл',
          'Засварын хэрэгсэл'
        ]
      }
    ]
  }
]

export function CategoryMegaMenu({ isOpen, onClose }: CategoryMegaMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10 sm:pr-16">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-2xl transform transition duration-500 ease-in-out data-[closed]:-translate-x-full sm:duration-700"
            >
              <TransitionChild>
                <div className="absolute right-0 top-0 -mr-12 flex pl-2 pt-6 duration-500 ease-in-out data-[closed]:opacity-0 sm:-mr-14 sm:pl-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="relative rounded-full bg-gray-600 text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white p-2 shadow-lg"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </TransitionChild>
              <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
                <div className="px-4 sm:px-6">
                  <DialogTitle className="text-base font-semibold leading-6 text-gray-900 flex items-center">
                    <span className="text-xl mr-3">☰</span>
                    Бүх ангилал
                  </DialogTitle>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  {/* Drawer Content */}
                  <div className="flex h-full">
                    {/* Categories List */}
                    <div className="w-80 bg-gray-50 border-r overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onMouseEnter={() => setSelectedCategory(category)}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-4 py-4 flex items-center transition-all duration-200 border-l-4 ${
                            selectedCategory.id === category.id
                              ? 'bg-red-50 border-red-500 text-red-700'
                              : 'border-transparent text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-lg mr-3">{category.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm leading-tight">
                              {category.name}
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>

                    {/* Subcategories Panel */}
                    <div className="flex-1 overflow-y-auto bg-white">
                      <div className="p-6">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {selectedCategory.name}
                          </h3>
                          <div className="h-0.5 w-16 bg-red-500"></div>
                        </div>

                        <div className="space-y-8">
                          {selectedCategory.subcategories.map((subcategory, index) => (
                            <div key={index}>
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                {subcategory.name}
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                {subcategory.items.map((item, itemIndex) => (
                                  <Link
                                    key={itemIndex}
                                    to={`/products?category=${selectedCategory.id}&subcategory=${item}`}
                                    onClick={onClose}
                                    className="text-gray-600 hover:text-red-600 transition-colors py-1 px-2 rounded hover:bg-red-50"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                              <div className="mt-4">
                                <Link
                                  to={`/collections/${selectedCategory.id}`}
                                  onClick={onClose}
                                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm"
                                >
                                  Бүгдийг үзэх
                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}