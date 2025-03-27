import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MonitorCheck, 
  PlusCircle, 
  Wrench, 
  CalendarRange, 
  CheckCircle2,
  MessageSquareMore, 
  PenSquare, 
  Archive,
  Laptop
} from 'lucide-react';

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    if (location.pathname.startsWith('/reservations')) {
      return [
        { title: 'Alle Reserveringen', path: '/reservations', icon: CalendarRange },
        { title: 'Goedgekeurd/Afgewezen', path: '/reservations/status', icon: CheckCircle2 },
        { title: 'Laptops Toewijzen', path: '/reservations/assign', icon: Laptop },
      ];
    }
    if (location.pathname.startsWith('/laptops')) {
      return [
        { title: 'Overzicht Laptops', path: '/laptops', icon: MonitorCheck },
        { title: 'Laptop Toevoegen', path: '/laptops/create', icon: PlusCircle },
        { title: 'Reparatie Nodig', path: '/laptops/repairs', icon: Wrench },
      ];
    }
    if (location.pathname.startsWith('/advice')) {
      return [
        { title: 'Voorgestelde Adviezen', path: '/advice/overview', icon: MessageSquareMore },
        { title: 'Advies Noteren', path: '/advice/new', icon: PenSquare },
        { title: 'Verwerkte Adviezen', path: '/advice/processed', icon: Archive },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  if (navItems.length === 0) return null;

  return (
    <nav className="bg-[#E4C76B] text-[#07114d] fixed left-0 top-[3.5rem] md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-16 p-2">
      <ul className="space-y-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors gap-1
                  ${location.pathname === item.path
                    ? 'bg-[#07114d] text-[#E4C76B]'
                    : 'hover:bg-[#07114d] hover:text-[#E4C76B] text-[#07114d]'
                  }`}
                title={item.title}
              >
                <Icon size={24} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}