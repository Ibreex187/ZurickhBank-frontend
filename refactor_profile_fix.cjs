const fs = require('fs');

let profCode = fs.readFileSync('src/pages/Profile.jsx', 'utf8');

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

// Construct a whitespace-agnostic Regex to find the EXACT end of the Transaction PIN form card inside Security Tab
const insertionPointRegex = /(\(profileData\.hasTransactionPin \? 'Update PIN' : 'Set PIN'\)\}\s*<\/button>\s*<\/div>\s*<\/form>\s*\)\}\s*<\/div>\s*<\/div>)/;

if (insertionPointRegex.test(profCode)) {
  profCode = profCode.replace(insertionPointRegex, '$1' + profJsx);
  fs.writeFileSync('src/pages/Profile.jsx', profCode);
  console.log('Successfully injected Email Preferences UI into Profile.jsx');
} else {
  console.log('ERROR: Regex failed to find the insertion point!');
}
