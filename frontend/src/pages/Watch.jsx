import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Watch() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ name: '', url: '' });
  const [fetching, setFetching] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    client.get('/watch/sources').then((r) => setSources(r.data));
    client.get('/watch/notifications').then((r) => setNotifications(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await client.post('/watch/sources', { ...form, type: 'rss' });
    setForm({ name: '', url: '' });
    load();
  };

  const removeSource = async (id) => {
    await client.delete(`/watch/sources/${id}`);
    load();
  };

  const markRead = async (id) => {
    await client.post(`/watch/notifications/${id}/read`);
    load();
  };

  const refresh = async () => {
    setFetching(true);
    setError('');
    try {
      await client.post('/watch/fetch');
      load();
    } catch {
      setError('Erreur lors de la lecture des flux.');
    } finally {
      setFetching(false);
    }
  };

  const generatePost = async (notification) => {
    setGeneratingId(notification.id);
    setError('');
    try {
      const { data } = await client.post('/ai/generate-post', {
        notification_id: notification.id,
      });
      await client.post('/posts', { content: data.content, networks: [] });
      navigate('/calendrier');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la génération du post.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Veille automatisée</h1>
        <button
          onClick={refresh}
          disabled={fetching}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
        >
          {fetching ? 'Lecture en cours…' : 'Actualiser la veille'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Ajouter une source RSS</h2>
            <input
              placeholder="Nom (ex : Préfecture de La Réunion)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3"
              required
            />
            <input
              type="url"
              placeholder="URL du flux RSS"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              required
            />
            <button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
              Ajouter
            </button>
          </form>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sources surveillées</h2>
            {sources.length === 0 && <p className="text-gray-400">Aucune source.</p>}
            {sources.map((source) => (
              <div key={source.id} className="flex justify-between items-center border-b py-2 last:border-0">
                <div>
                  <p className="font-medium">{source.name}</p>
                  <p className="text-sm text-gray-500 truncate max-w-xs">{source.url}</p>
                </div>
                <button
                  onClick={() => removeSource(source.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Alertes détectées</h2>
          {notifications.length === 0 && (
            <p className="text-gray-400">
              Aucune alerte. Ajoutez une source puis cliquez sur « Actualiser la veille ».
            </p>
          )}
          {notifications.map((n) => (
            <div key={n.id} className="border-b py-3 last:border-0">
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className={`font-medium hover:underline ${n.is_read ? 'text-gray-400' : ''}`}
              >
                {n.title}
              </a>
              <p className="text-sm text-gray-500">
                {n.source_name} — {n.detected_at && new Date(n.detected_at).toLocaleString('fr-FR')}
              </p>
              <div className="flex gap-4 mt-1">
                <button
                  onClick={() => generatePost(n)}
                  disabled={generatingId === n.id}
                  className="text-green-700 text-sm font-medium hover:underline disabled:opacity-50"
                >
                  {generatingId === n.id ? 'Génération…' : '✨ Générer un post avec l’IA'}
                </button>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-blue-700 text-sm hover:underline"
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
