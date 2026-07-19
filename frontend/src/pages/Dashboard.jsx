import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
import client from '../api/client';

// Compteur qui s'anime de 0 jusqu'à la valeur.
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);
  return <>{display}</>;
}

// Variantes d'animation (apparition en cascade).
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    client.get('/posts').then((r) => setPosts(r.data)).catch(() => {});
    client.get('/watch/notifications').then((r) => setNotifications(r.data)).catch(() => {});
  }, []);

  const scheduled = posts.filter((p) => p.status === 'scheduled');
  const drafts = posts.filter((p) => p.status === 'draft');
  const unread = notifications.filter((n) => !n.is_read);

  const stats = [
    { label: 'Posts planifiés', value: scheduled.length, color: 'text-blue-700' },
    { label: 'Brouillons', value: drafts.length, color: 'text-orange-500' },
    { label: 'Alertes veille non lues', value: unread.length, color: 'text-green-600' },
  ];

  return (
    <div>
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Tableau de bord
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl shadow p-6"
            variants={item}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <p className="text-gray-500">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.color}`}>
              <AnimatedNumber value={stat.value} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Prochaines publications</h2>
          {scheduled.length === 0 && <p className="text-gray-400">Aucun post planifié.</p>}
          <motion.div variants={container} initial="hidden" animate="show">
            {scheduled.slice(0, 5).map((post) => (
              <motion.div key={post.id} className="border-b py-2 last:border-0" variants={item}>
                <p className="font-medium truncate">{post.content}</p>
                <p className="text-sm text-gray-500">
                  {post.scheduled_at && new Date(post.scheduled_at).toLocaleString('fr-FR')} —{' '}
                  {post.networks.join(', ') || 'aucun réseau'}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <Link to="/calendrier" className="text-blue-700 text-sm underline block mt-3">
            Voir le calendrier
          </Link>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Dernières alertes veille</h2>
          {notifications.length === 0 && <p className="text-gray-400">Aucune alerte.</p>}
          <motion.div variants={container} initial="hidden" animate="show">
            {notifications.slice(0, 5).map((n) => (
              <motion.div key={n.id} className="border-b py-2 last:border-0" variants={item}>
                <p className={`font-medium truncate ${n.is_read ? 'text-gray-400' : ''}`}>
                  {n.title}
                </p>
                <p className="text-sm text-gray-500">{n.source_name}</p>
              </motion.div>
            ))}
          </motion.div>
          <Link to="/veille" className="text-blue-700 text-sm underline block mt-3">
            Voir la veille
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
