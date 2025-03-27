import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarRange, MonitorCheck, MessageSquareMore } from 'lucide-react';

export default function AppBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { title: 'Overzicht Reserveringen', path: '/reservations', icon: CalendarRange },
    { title: 'Overzicht Laptops', path: '/laptops', icon: MonitorCheck },
    { title: 'Overzicht Voorgestelde Adviezen', path: '/advice/overview', icon: MessageSquareMore },
  ];

  return (
    <header className="bg-[#07114d] text-white p-2 sm:p-4 fixed top-0 w-full z-50 h-14 md:h-16">
      <nav className="max-w-7xl mx-auto">
        <ul className="flex flex-wrap items-center gap-2 sm:gap-4">
          <li>
            <div className="flex items-center gap-3">
              <img 
                src="/src/oase logo.png" 
                alt="Logo" 
                className="w-10 h-10" 
              />
              <span className="text-lg font-semibold">Stichting Asha</span>
            </div>
          </li>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path.split('/')[1]);
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-sm sm:text-base
                    ${isActive
                      ? 'bg-[#2e376f] text-[#ffd700]'
                      : 'hover:bg-[#2e376f] text-white'
                    }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}