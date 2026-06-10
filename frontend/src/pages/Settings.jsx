export default function Settings() {
  const user = JSON.parse(localStorage.getItem('kk_user') || '{}');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Mon compte</h2>
        <p>
          <span className="text-gray-500">Nom :</span> {user.name || '—'}
        </p>
        <p>
          <span className="text-gray-500">Commune :</span> {user.commune || '—'}
        </p>
        <p>
          <span className="text-gray-500">Email :</span> {user.email}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Réseaux sociaux</h2>
        <p className="text-gray-400">
          La connexion Facebook, Instagram et TikTok arrive en v0.4.
        </p>
      </div>
    </div>
  );
}
