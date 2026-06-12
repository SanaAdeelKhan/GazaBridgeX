// frontend/src/pages/admin/AdminDashboard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const quickActions = [
  { emoji: '📚', title: 'Resources', desc: 'Create and manage learning resources', to: '/admin/resources', label: 'Manage Resources' },
  { emoji: '🎓', title: 'Courses', desc: 'Manage all courses and content', to: '/admin/courses', label: 'Manage Courses' },
  { emoji: '🙌', title: 'Offers', desc: 'Manage community offers and posts', to: '/admin/posts?tab=offers', label: 'Manage Offers' },
  { emoji: '🌟', title: 'Requests', desc: 'Manage community requests', to: '/admin/posts?tab=requests', label: 'Manage Requests' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[#3d4a00] mb-1">Admin Dashboard</h1>
        <p className="text-[#5a6600]">Manage resources, posts, and community content</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((item, i) => (
          <motion.div key={item.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}
            className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-2xl shadow-md p-6 flex flex-col">
            <div className="text-4xl mb-4">{item.emoji}</div>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-1">{item.title}</h3>
            <p className="text-sm text-[#5a6600] mb-5 flex-1">{item.desc}</p>
            <Link to={item.to}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
              {item.label}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
