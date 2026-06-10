import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', commune: '', email: '', password: '' });
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await client.post('/auth/register', form);
      localStorage.setItem('kk_token', data.token);
      localStorage.setItem('kk_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <input
          placeholder="Nom"
          value={form.name}
          onChange={update('name')}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        <input
          placeholder="Commune"
          value={form.commune}
          onChange={update('commune')}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update('email')}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe (8 caractères min.)"
          value={form.password}
          onChange={update('password')}
          className="w-full border rounded-lg px-3 py-2 mb-4"
          required
          minLength={8}
        />
        <button className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800">
          S'inscrire
        </button>
        <p className="text-sm text-center mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-700 underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
