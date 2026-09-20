import LegalPage from './LegalPage';

const SECTIONS = [
  {
    heading: '1. What we store',
    body: [
      'Your first and last name, username and email address.',
      'Your password and transaction PIN, stored only as one-way hashes. We cannot read them.',
      'Your transactions, savings, investments, beneficiaries and notifications.',
      'The IP address of certain security events (for example a failed sign-in or a PIN change), so the alert can show where it came from.',
    ],
  },
  {
    heading: '2. How we use it',
    body: [
      'To run the app, apply transaction limits, and send one-time codes and notification emails.',
      'You can switch email notifications on or off by category under Profile, Security.',
    ],
  },
  {
    heading: '3. Cookies and browser storage',
    body: [
      'A sign-in cookie keeps you logged in. A preference cookie remembers whether your balance is shown or hidden.',
      'Session storage is used for small interface details, such as your unread notification count.',
    ],
  },
  {
    heading: '4. Sharing',
    body: [
      'We do not sell your data. Emails are sent through the mail service configured by the project owner.',
    ],
  },
  {
    heading: '5. Please use test data',
    body: [
      'This is a demo. Do not enter sensitive personal information, real financial details, or passwords you use elsewhere.',
    ],
  },
  {
    heading: '6. Deleting your data',
    body: [
      'To have your account and its records removed, email the address below from the email you registered with.',
    ],
  },
];

const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    updated="September 2026"
    intro="This page explains what the demo application stores about you and why."
    sections={SECTIONS}
  />
);

export default Privacy;
