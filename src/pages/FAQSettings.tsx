import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSettings = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I create a new route?",
      answer: "Tap the '+' button on the home screen and select 'Add Route'. You can then plot your route on the map, add waypoints, and save it with a name and description."
    },
    {
      question: "How do I join a club?",
      answer: "Navigate to the Clubs section, browse or search for clubs that interest you, and tap 'Join' on the club's profile page. Some clubs may require approval from an admin."
    },
    {
      question: "Can I make my profile private?",
      answer: "Yes! Go to Settings > Privacy & Safety and toggle on 'Private Profile'. This will hide your activity and routes from non-friends."
    },
    {
      question: "How do I add a vehicle to my garage?",
      answer: "Go to your Profile, tap 'My Garage', then tap the '+' button. Fill in your vehicle details including make, model, year, and optionally add photos."
    },
    {
      question: "How do events work?",
      answer: "You can browse upcoming events on the Events tab, RSVP to events you're interested in, and even create your own events for meets, drives, or shows."
    },
    {
      question: "What's the difference between Free and Pro?",
      answer: "Pro members get unlimited route saves, advanced route planning features, priority event listings, and an ad-free experience. Check Plan & Billing for full details."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Tap the three dots menu on any post, event, or profile and select 'Report'. Our team reviews all reports within 24 hours."
    },
    {
      question: "Can I export my routes?",
      answer: "Yes! Pro members can export routes as GPX files. Open the route, tap the share icon, and select 'Export as GPX'."
    },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">FAQ</h1>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="flex-1 px-4 pt-3 pb-6">
        <p className="text-sm text-muted-foreground mb-4">
          Find answers to commonly asked questions about RevNet.
        </p>
        
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-border/30 last:border-b-0"
              >
                <AccordionTrigger className="px-4 py-3 text-sm font-medium text-left hover:no-underline hover:bg-muted/50">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for?
          </p>
          <button className="mt-2 text-sm font-medium text-primary">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQSettings;
