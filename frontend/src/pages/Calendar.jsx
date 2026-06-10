import { useEffect, useState } from 'react';
import client from '../api/client';

const NETWORKS = ['facebook', 'instagram', 'tiktok'];

export default function Calendar() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ content: '', scheduled_at: '', networks: [] });

  const load = () => client.get('/posts').then((r) => setPosts(r.data));

  useEffect(() => {
    load();
  }, []);

  const toggleNetwork = (network) => {
    setForm((f) => ({
      ...f,
      networks: f.networks.includes(network)
        ? f.networks.filter((n) => n !== network)
        : [...f.networks, network],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    await client.post('/posts', form);
    setForm({ content: '', scheduled_at: '', networks: [] });
    load();
  };

  const remove = async (id) => {
    await client.delete(`/posts/${id}`);
    load();
  };

  const statusLabel = { draft: 'Brouillon', scheduled: 'Planifié', published: 'Publié' };
  const statusColor = {
    draft: 'bg-gray-200 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Calendrier des publications</h1>

      <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Nouveau post</h2>
        <textarea
          placeholder="Contenu du post…"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          rows={3}
          required
        />
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          {NETWORKS.map((network) => (
            <label key={network} className="flex items-center gap-2 capitalize">
              <input
                type="checkbox"
                checked={form.networks.includes(network)}
                onChange={() => toggleNetwork(network)}
              />
              {network}
            </label>
          ))}
        </div>
        <button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
          Créer le post
        </button>
      </form>

      <div className="space-y-3">
        {posts.length === 0 && <p className="text-gray-400">Aucun post pour le moment.</p>}
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
            <div>
              <span className={`text-xs px-2 py-1 rounded ${statusColor[post.status]}`}>
                {statusLabel[post.status]}
              </span>
              <p className="mt-2">{post.content}</p>
              <p className="text-sm text-gray-500 mt-1">
                {post.scheduled_at
                  ? new Date(post.scheduled_at).toLocaleString('fr-FR')
                  : 'Non planifié'}{' '}
                — {post.networks.join(', ') || 'aucun réseau'}
              </p>
            </div>
            <button onClick={() => remove(post.id)} className="text-red-500 text-sm hover:underline">
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
