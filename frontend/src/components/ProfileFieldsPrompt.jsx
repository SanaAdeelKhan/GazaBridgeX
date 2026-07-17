// frontend/src/components/ProfileFieldsPrompt.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import colors from '../theme/colors';

const FORMAT_LABELS = { '1_on_1': '1-on-1', group: 'Group', either: 'Either' };
const PLATFORM_LABELS = {
  zoom: 'Zoom', google_meet: 'Google Meet', whatsapp_call: 'WhatsApp call',
  in_app_chat_only: 'In-app chat only', no_preference: 'No preference',
};
const COMMITMENT_LABELS = { one_time: 'One-time sessions', ongoing_weekly: 'Ongoing (weekly)', flexible: 'Flexible' };
const URGENCY_LABELS = { asap: 'ASAP', within_a_month: 'Within a month', flexible: 'Flexible' };

const SESSION_KEY = 'profileFieldsPromptDismissed';

const selectStyle = {
  borderColor: colors.inputBorder,
  color: colors.inputText,
  backgroundColor: colors.inputBg,
};

export default function ProfileFieldsPrompt() {
  const { profile, updateProfile } = useUser();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isVolunteer = profile?.roles?.some(r => r.name === 'volunteer');
  const isSeeker = profile?.roles?.some(r => r.name === 'seeker');

  const [formData, setFormData] = useState({
    volunteer_teaching_format: 'either',
    volunteer_preferred_platform: 'no_preference',
    volunteer_commitment: 'flexible',
    seeker_preferred_format: 'either',
    seeker_preferred_platform: 'no_preference',
    seeker_urgency: 'flexible',
  });

  const shouldShow = profile && profile.profile_fields_completed === false && (isVolunteer || isSeeker) && !dismissed;

  if (!shouldShow) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRemindLater = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setDismissed(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = { profile_fields_completed: true };
    if (isVolunteer) {
      payload.volunteer_teaching_format = formData.volunteer_teaching_format;
      payload.volunteer_preferred_platform = formData.volunteer_preferred_platform;
      payload.volunteer_commitment = formData.volunteer_commitment;
    }
    if (isSeeker) {
      payload.seeker_preferred_format = formData.seeker_preferred_format;
      payload.seeker_preferred_platform = formData.seeker_preferred_platform;
      payload.seeker_urgency = formData.seeker_urgency;
    }

    const result = await updateProfile(payload);
    if (!result.success) {
      setError(result.error || 'Failed to save. Please try again.');
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          className="w-full max-w-lg rounded-3xl shadow-lg p-8 border max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}
        >
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.headingDark }}>
            Help us match you better
          </h2>
          <p className="text-sm mb-6" style={{ color: colors.muted }}>
            A few quick preferences help us connect you with the right people. Takes under a minute — or skip for now and we'll ask again next time.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl border text-sm" style={{ backgroundColor: colors.errorBg, borderColor: colors.error, color: colors.error }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isVolunteer && (
              <div className="space-y-5">
                <p className="text-sm font-semibold" style={{ color: colors.headingDark }}>As a volunteer</p>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Teaching format</label>
                  <select name="volunteer_teaching_format" value={formData.volunteer_teaching_format} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={selectStyle}>
                    {Object.entries(FORMAT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Preferred platform</label>
                  <select name="volunteer_preferred_platform" value={formData.volunteer_preferred_platform} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={selectStyle}>
                    {Object.entries(PLATFORM_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Commitment</label>
                  <select name="volunteer_commitment" value={formData.volunteer_commitment} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={selectStyle}>
                    {Object.entries(COMMITMENT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>
            )}
            {isSeeker && (
              <div className="space-y-5 pt-2 border-t" style={{ borderColor: colors.divider }}>
                <p className="text-sm font-semibold pt-2" style={{ color: colors.headingDark }}>As a seeker</p>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Preferred format</label>
                  <select name="seeker_preferred_format" value={formData.seeker_preferred_format} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={selectStyle}>
                    {Object.entries(FORMAT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Preferred platform</label>
                  <select name="seeker_preferred_platform" value={formData.seeker_preferred_platform} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={selectStyle}>
                    {Object.entries(PLATFORM_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Urgency</label>
                  <select name="seeker_urgency" value={formData.seeker_urgency} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={selectStyle}>
                    {Object.entries(URGENCY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:brightness-95 disabled:opacity-50 transition-all"
                style={{ backgroundColor: colors.gold }}
              >
                {saving ? 'Saving...' : 'Save preferences'}
              </motion.button>
              <button
                type="button"
                onClick={handleRemindLater}
                className="px-6 py-3 border font-semibold rounded-xl transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.body }}
              >
                Remind me later
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
