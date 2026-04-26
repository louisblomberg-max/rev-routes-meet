import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="mobile-container bg-background min-h-dvh">
      <div className="sticky top-0 z-10 bg-[#E9E6DF] border-b-2 border-[#E5E5E5] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50" iconClassName="w-4 h-4" onClick={() => navigate(-1)} />
          <h1 className="text-lg font-bold">Terms of Service</h1>
        </div>
      </div>
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto pb-20">
        <p className="text-xs text-muted-foreground">Last updated: April 2026</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By using RevNet, you agree to these Terms of Service. If you do not agree, please do not use the app. These terms constitute a legally binding agreement between you and REVNET LTD (Companies House number 17054158).'
          },
          {
            title: '2. Eligibility',
            body: 'You must be at least 18 years old to use RevNet. By using the app you confirm you meet this requirement. RevNet is intended for use in the United Kingdom.'
          },
          {
            title: '3. Your Account',
            body: 'You are responsible for maintaining the security of your account and all activity under it. You must provide accurate information when registering. You may not share your account with others or use another person\'s account.'
          },
          {
            title: '4. Acceptable Use',
            body: 'You must not use RevNet to post illegal, harmful, or offensive content, impersonate other users, spam or harass other members, share false emergency or SOS alerts, violate any applicable laws, or attempt to reverse engineer or compromise the app.'
          },
          {
            title: '5. User Content',
            body: 'You retain ownership of content you post. By posting content you grant REVNET LTD a licence to display and distribute it within the app. You are responsible for ensuring your content does not infringe third-party rights.'
          },
          {
            title: '6. SOS and Safety Features',
            body: 'The SOS feature is for genuine roadside emergencies only. Misuse of SOS — including false alerts — may result in account suspension. RevNet is not an emergency service. Always contact 999 for life-threatening emergencies.'
          },
          {
            title: '7. Subscriptions and Payments',
            body: 'Paid subscriptions are billed monthly or annually as selected. You may cancel at any time — your access continues until the end of the billing period. Refunds are not provided for partial periods. Payments are processed by Stripe.'
          },
          {
            title: '8. Event Tickets',
            body: 'Event tickets are sold by event organisers, not by REVNET LTD. RevNet collects a 5% service fee. Refund policies are set by individual organisers. RevNet is not liable for event cancellations or changes.'
          },
          {
            title: '9. Limitation of Liability',
            body: 'RevNet is provided "as is". REVNET LTD is not liable for any indirect or consequential losses arising from use of the app. Our total liability is limited to the amount you paid us in the 12 months preceding any claim.'
          },
          {
            title: '10. Termination',
            body: 'We may suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings. Upon termination your data is handled in accordance with our Privacy Policy.'
          },
          {
            title: '11. Governing Law',
            body: 'These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.'
          },
          {
            title: '12. Contact',
            body: 'REVNET LTD\nEmail: hello@revnet.app\nCompanies House number: 17054158'
          },
        ].map(section => (
          <div key={section.title} className="space-y-2">
            <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terms;
