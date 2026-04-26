import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-10 bg-[#FAFAFA] border-b-2 border-[#E5E5E5] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50" iconClassName="w-4 h-4" onClick={() => navigate(-1)} />
          <h1 className="text-lg font-bold">Privacy Policy</h1>
        </div>
      </div>
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto pb-20">
        <p className="text-xs text-muted-foreground">Last updated: April 2026</p>

        {[
          {
            title: '1. Who We Are',
            body: 'RevNet is operated by REVNET LTD (Companies House number 17054158), registered in England and Wales. We operate the RevNet mobile and web application for the UK automotive and motorcycle community. Contact us at: hello@revnet.app'
          },
          {
            title: '2. What Data We Collect',
            body: 'We collect information you provide directly: name, email address, profile photo, vehicle information, location data (when you use navigation or SOS features), event and route data you create, messages you send, and payment information (processed securely by Stripe — we do not store card details).'
          },
          {
            title: '3. How We Use Your Data',
            body: 'We use your data to provide the RevNet service, including showing your profile to other users, enabling navigation and location sharing features, processing payments for subscriptions and event tickets, sending notifications about events and community activity, and improving the app.'
          },
          {
            title: '4. Location Data',
            body: 'Location data is only collected when you actively use navigation, enable live location sharing, or send an SOS request. Your exact location is never shared without your consent. SOS helpers only see your approximate distance, not your exact coordinates.'
          },
          {
            title: '5. Who We Share Data With',
            body: 'We share data with: Supabase (database and storage hosting), Stripe (payment processing), Mapbox (mapping and navigation). We do not sell your personal data to third parties. We do not use your data for advertising.'
          },
          {
            title: '6. Your Rights (UK GDPR)',
            body: 'You have the right to access your data, correct inaccurate data, request deletion of your data, object to processing, and data portability. To exercise these rights, contact us at hello@revnet.app. You can delete your account at any time from Settings.'
          },
          {
            title: '7. Data Retention',
            body: 'We retain your data while your account is active. When you delete your account, your personal data is deleted within 30 days. Some data may be retained longer where required by law.'
          },
          {
            title: '8. Cookies',
            body: 'RevNet uses essential cookies and local storage to keep you signed in and remember your preferences. We do not use tracking or advertising cookies.'
          },
          {
            title: '9. Changes to This Policy',
            body: 'We may update this policy. We will notify you of significant changes via the app. Continued use of RevNet after changes constitutes acceptance of the updated policy.'
          },
          {
            title: '10. Contact',
            body: 'REVNET LTD\nEmail: hello@revnet.app\nRegistered in England and Wales\nCompanies House number: 17054158'
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

export default Privacy;
