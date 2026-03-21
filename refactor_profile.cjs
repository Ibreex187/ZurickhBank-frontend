const fs = require('fs');

// ==========================================
// 1. REFACTOR NOTIFICATIONS.JSX
// ==========================================
let notifCode = fs.readFileSync('src/pages/Notifications.jsx', 'utf8');

// Remove extra imports
notifCode = notifCode.replace(/\s*getNotificationPreferences,\s*updateNotificationPreferences,/g, '');

// Remove states (Lines 61-68 approx)
const statesRegex = /const \[preferencesLoading[\s\S]*?security: true,\s*\}\);\s*/;
notifCode = notifCode.replace(statesRegex, '');

// Remove fetchPreferences (Lines 132-149)
const fetchRegex = /const fetchPreferences = useCallback\(async \(\) => \{[\s\S]*?\}, \[\]\);\s*/;
notifCode = notifCode.replace(fetchRegex, '');

// Remove useEffect for fetchPreferences (Line 155-157)
const effRegex = /useEffect\(\(\) => \{\s*fetchPreferences\(\);\s*\}, \[fetchPreferences\]\);\s*/;
notifCode = notifCode.replace(effRegex, '');

// Remove handlePreferenceToggle (Lines 199-224)
const toggleRegex = /const handlePreferenceToggle = async \(category, enabled\) => \{[\s\S]*?setPreferencesSavingKey\(''\);\s*\}\s*\};\s*/;
notifCode = notifCode.replace(toggleRegex, '');

// Remove JSX Block (Lines 436-464)
const jsxRegex = /<div className="transactions-section">\s*<div className="section-header">\s*<h3>Email Preferences<\/h3>\s*<\/div>\s*\{preferencesLoading \? \([\s\S]*?<\/div>\s*\)\}\s*<\/div>/;
notifCode = notifCode.replace(jsxRegex, '');

fs.writeFileSync('src/pages/Notifications.jsx', notifCode);

// ==========================================
// 2. REFACTOR PROFILE.JSX
// ==========================================
let profCode = fs.readFileSync('src/pages/Profile.jsx', 'utf8');

// Add Imports
if (!profCode.includes('getNotificationPreferences')) {
  profCode = profCode.replace(
    /import \{ getUserProfile, changeUserPassword, requestProfileUpdateOtp, updateUserProfile \} from '\.\.\/services\/userService';/,
    `import { getUserProfile, changeUserPassword, requestProfileUpdateOtp, updateUserProfile } from '../services/userService';\nimport { getNotificationPreferences, updateNotificationPreferences } from '../services/notificationService';`
  );
}

// Remove Security Button
profCode = profCode.replace(
  /,\s*\{\s*key: 'security',\s*label: 'Security',\s*onClick: \(\) => setActiveTab\('security'\),\s*backgroundColor: 'rgba\(255,255,255,0\.1\)',\s*textColor: '#ffffff',\s*borderColor: 'rgba\(255,255,255,0\.2\)'\s*\}/,
  ''
);

// Add Hooks & State below loading state
const profStateHook = `
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesSavingKey, setPreferencesSavingKey] = useState('');
  const [preferences, setPreferences] = useState({
    debit: true,
    credit: true,
    transfer: true,
    security: true,
  });

  const fetchPreferences = useCallback(async () => {
    setPreferencesLoading(true);
    try {
      const response = await getNotificationPreferences();
      if (response?.success) {
        const mappedPreferences = response?.data?.emailByCategory;
        if (mappedPreferences) {
          setPreferences((prev) => ({
            ...prev,
            ...mappedPreferences,
          }));
        }
      }
    } catch (fetchError) {
      console.error(fetchError?.response?.data?.message || 'Failed to load notification preferences');
    } finally {
      setPreferencesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchPreferences();
    }
  }, [fetchPreferences, activeTab]);

  const handlePreferenceToggle = async (category, enabled) => {
    setPreferencesSavingKey(category);
    const nextPreferences = { ...preferences, [category]: enabled };
    setPreferences(nextPreferences);
    try {
      const response = await updateNotificationPreferences(nextPreferences);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update preferences');
      }
      setMessage({ type: 'success', text: 'Email preferences updated successfully' });
    } catch (preferenceError) {
      setPreferences((prev) => ({ ...prev, [category]: !enabled }));
      setMessage({ type: 'error', text: preferenceError?.response?.data?.message || 'Failed to update preferences' });
    } finally {
      setPreferencesSavingKey('');
    }
  };
`;

if (!profCode.includes('fetchPreferences')) {
  profCode = profCode.replace(
    /const \[loading, setLoading\] = useState\(true\);/,
    `const [loading, setLoading] = useState(true);${profStateHook}`
  );
}

// Add JSX to Security Tab explicitly after the Password & Security profile-card
const profJsx = `

                  <div className="profile-card premium-stat-card mt-4">
                    <div className="card-header">
                      <h3>Email Preferences</h3>
                    </div>
                    <div className="card-body">
                      {preferencesLoading ? (
                        <LoadingWatch label="Loading preferences..." minHeight="100px" />
                      ) : (
                        <div className="preferences-grid">
                          {Object.keys(preferences).map((categoryKey) => (
                            <div className="preference-item" key={categoryKey}>
                              <div>
                                <p className="preference-title text-white">{categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}</p>
                                <p className="preference-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>Send email for {categoryKey} notifications</p>
                              </div>
                              <label className="preference-toggle">
                                <input
                                  type="checkbox"
                                  checked={Boolean(preferences[categoryKey])}
                                  onChange={(event) => handlePreferenceToggle(categoryKey, event.target.checked)}
                                  disabled={preferencesSavingKey === categoryKey}
                                />
                                <span>{preferences[categoryKey] ? 'On' : 'Off'}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>`;

if (!profCode.includes('<h3>Email Preferences</h3>')) {
  profCode = profCode.replace(
    /(<\/div>\s*)(\s*<\/div>\s*)\{\/\* End of Security Tab \*\//i, // wait, there's no such comment.
    `// FALLBACK`
  );
  
  // Find where the Password & Security card ends.
  //   </div>
  // </div>
  // )}
  // </div> // tab-content
  // </div> // profile-container
  const targetSplit = `                      )}
                    </div>
                  </div>`;
                  
  const splitIndex = profCode.lastIndexOf(targetSplit);
  if (splitIndex !== -1) {
    profCode = profCode.substring(0, splitIndex + targetSplit.length) + profJsx + profCode.substring(splitIndex + targetSplit.length);
  }
}

fs.writeFileSync('src/pages/Profile.jsx', profCode);

console.log('UI Streamlining complete.');
