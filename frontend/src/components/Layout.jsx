import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'Tableau de bord', end: true },
  { to: '/calendrier', label: 'Calendrier' },
  { to: '/templates', label: 'Templates' },
  { to: '/veille', label: 'Veille' },
  { to: '/parametres', label: 'Paramètres' },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('kk_user') || '{}');

  const logout = () => {
    localStorage.removeItem('kk_token');
    localStorage.removeItem('kk_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold">KK</div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <p className="text-sm truncate">{user.name || user.email}</p>
          <button onClick={logout} className="mt-2 text-sm text-blue-300 hover:text-white">
            Se déconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
