import { useEffect, useState } from 'react';
import client from '../api/client';

const CATEGORIES = [
  { value: 'event', label: 'Événement', color: 'blue' },
  { value: 'proximity', label: 'Proximité', color: 'green' },
  { value: 'crisis', label: 'Crise', color: 'orange' },
];

const colorClasses = {
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  orange: 'bg-orange-100 border-orange-300',
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category: 'event' });

  const load = () => client.get('/templates').then((r) => setTemplates(r.data));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const category = CATEGORIES.find((c) => c.value === form.category);
    await client.post('/templates', { ...form, color: category.color });
    setForm({ title: '', content: '', category: 'event' });
    load();
  };

  const remove = async (id) => {
    await client.delete(`/templates/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Templates</h1>

      <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Nouveau template</h2>
        <input
          placeholder="Titre (ex : Marché nocturne)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          required
        />
        <textarea
          placeholder="Contenu — utilisez [Date], [Lieu] comme champs dynamiques"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          rows={3}
          required
        />
        <div className="flex items-center gap-4 mb-4">
          {CATEGORIES.map((cat) => (
            <label key={cat.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={form.category === cat.value}
                onChange={() => setForm({ ...form, category: cat.value })}
              />
              {cat.label}
            </label>
          ))}
        </div>
        <button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
          Créer le template
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 && <p className="text-gray-400">Aucun template pour le moment.</p>}
        {templates.map((template) => (
          <div
            key={template.id}
            className={`rounded-xl border-2 p-4 ${colorClasses[template.color] || colorClasses.blue}`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold">{template.title}</h3>
              <button
                onClick={() => remove(template.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Supprimer
              </button>
            </div>
            <p className="text-sm mt-2 whitespace-pre-wrap">{template.content}</p>
            <span className="inline-block mt-3 text-xs bg-white px-2 py-1 rounded">
              {CATEGORIES.find((c) => c.value === template.category)?.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
