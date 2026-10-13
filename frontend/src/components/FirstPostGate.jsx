// frontend/src/components/FirstPostGate.jsx
//
// Blocks the dashboard with a "Create your first post" step for any signed-in
// user who has no offer and no request yet. Frontend-only: it asks the
// existing list endpoints whether the user owns a post. Nothing is cached in
// the browser, so the answer always reflects the backend being used. The gate
// mounts once per page load (it lives in DashboardLayout), so this is two
// small calls per load, not per navigation.
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { postsAPI } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from './CreatePostModal';

// Paginated envelope is { pagination: { count }, results }.
const countOf = (res) => res?.data?.pagination?.count ?? res?.data?.results?.length ?? 0;

const ADMIN_ROLES = ['manager', 'admin', 'superuser'];

export default function FirstPostGate() {
  const { user, logout } = useAuth();
  const [needsPost, setNeedsPost] = useState(false);

  const userId = user?.id;
  const isExempt =
    user?.roles?.some((r) => ADMIN_ROLES.includes(r)) || user?.is_staff || user?.is_superuser;

  useEffect(() => {
    setNeedsPost(false);
    if (!userId || isExempt) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const [offers, requests] = await Promise.all([
          postsAPI.getOffers({ user_id: userId, page_size: 1 }),
          postsAPI.getRequests({ user_id: userId, page_size: 1 }),
        ]);
        if (cancelled) return;
        setNeedsPost(countOf(offers) + countOf(requests) === 0);
      } catch (err) {
        // Fail open: a network/API error must never lock a user out of the app.
        console.error('[FirstPostGate] Could not check for existing posts:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isExempt]);

  const handleCreated = () => setNeedsPost(false);

  return (
    <AnimatePresence>
      {needsPost && (
        <CreatePostModal required onLogout={logout} onClose={() => {}} onCreated={handleCreated} />
      )}
    </AnimatePresence>
  );
}
