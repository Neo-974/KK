import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    client.get('/posts').then((r) => setPosts(r.data)).catch(() => {});
    client.get('/watch/notifications').then((r) => setNotifications(r.data)).catch(() => {});
  }, []);

  const scheduled = posts.filter((p) => p.status === 'scheduled');
  const unread = notifications.filter((n) => !n.is_read);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Posts planifiés</p>
          <p className="text-4xl font-bold text-blue-700">{scheduled.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Brouillons</p>
          <p className="text-4xl font-bold text-orange-500">
            {posts.filter((p) => p.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Alertes veille non lues</p>
          <p className="text-4xl font-bold text-green-600">{unread.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Prochaines publications</h2>
          {scheduled.length === 0 && <p className="text-gray-400">Aucun post planifié.</p>}
          {scheduled.slice(0, 5).map((post) => (
            <div key={post.id} className="border-b py-2 last:border-0">
              <p className="font-medium truncate">{post.content}</p>
              <p className="text-sm text-gray-500">
                {post.scheduled_at && new Date(post.scheduled_at).toLocaleString('fr-FR')} —{' '}
                {post.networks.join(', ') || 'aucun réseau'}
              </p>
            </div>
          ))}
          <Link to="/calendrier" className="text-blue-700 text-sm underline block mt-3">
            Voir le calendrier
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dernières alertes veille</h2>
          {notifications.length === 0 && <p className="text-gray-400">Aucune alerte.</p>}
          {notifications.slice(0, 5).map((n) => (
            <div key={n.id} className="border-b py-2 last:border-0">
              <p className={`font-medium truncate ${n.is_read ? 'text-gray-400' : ''}`}>
                {n.title}
              </p>
              <p className="text-sm text-gray-500">{n.source_name}</p>
            </div>
          ))}
          <Link to="/veille" className="text-blue-700 text-sm underline block mt-3">
            Voir la veille
          </Link>
        </div>
      </div>
    </div>
  );
}
