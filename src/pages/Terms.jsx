import LegalPage from './LegalPage';

const SECTIONS = [
  {
    heading: '1. What this is',
    body: [
      'Zurich Bank is a demonstration project. It is not a licensed bank, it is not insured, and it does not hold, move or lend real money.',
      'Every balance, transfer, saving and investment you see is simulated.',
    ],
  },
  {
    heading: '2. Your account',
    body: [
      'New accounts may start with a practice balance. It has no cash value and cannot be withdrawn to a real bank account.',
      'Keep your password and transaction PIN private. Please do not reuse a password or PIN from any real account.',
    ],
  },
  {
    heading: '3. Simulated features',
    body: [
      'Stock prices in the investment section are randomly generated for demonstration. They are not real market data, and nothing in the app is financial advice.',
      'Transaction limits and account tiers are examples of how such rules could work.',
    ],
  },
  {
    heading: '4. Acceptable use',
    body: [
      'Use the app in good faith. Do not attempt to disrupt the service, access other users\' accounts, or abuse the sign-up bonus.',
    ],
  },
  {
    heading: '5. Data may be reset',
    body: [
      'Accounts, balances and history may be reset or deleted at any time without notice, for example when the demo is updated.',
    ],
  },
  {
    heading: '6. No warranty',
    body: [
      'The app is provided as is, without warranties of any kind. The project owner is not liable for any loss arising from its use.',
    ],
  },
];

const Terms = () => (
  <LegalPage
    title="Terms of Service"
    updated="September 2026"
    intro="By creating an account you agree to these terms. They are short because this is a demo application."
    sections={SECTIONS}
  />
);

export default Terms;
