import { ChevronRight, Check, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, SETUP_STEPS } from '@/contexts/OnboardingContext';

const MOCK_CLUBS = [
  { id: 'c1', name: 'London Supercar Spotters', location: 'London, UK', members: 1240, tags: ['Supercars', 'Meets'] },
  { id: 'c2', name: 'JDM UK', location: 'Nationwide', members: 3800, tags: ['JDM', 'Modified'] },
  { id: 'c3', name: 'Classic Car Collective', location: 'Birmingham, UK', members: 890, tags: ['Classics', 'Vintage'] },
  { id: 'c4', name: 'Track Day Addicts', location: 'UK Wide', members: 2100, tags: ['Track Days', 'Motorsport'] },
  { id: 'c5', name: 'Euro Scene UK', location: 'Manchester, UK', members: 1560, tags: ['European', 'Modified'] },
  { id: 'c6', name: 'Bike Riders Club', location: 'Nationwide', members: 970, tags: ['Motorcycles', 'Touring'] },
];

const ClubDiscoveryStep = () => {
  const { data, updateData, next, back, step } = useOnboarding();
  const setupIdx = step - 6;

  const toggle = (clubId: string) => {
    const joined = data.joinedClubs.includes(clubId)
      ? data.joinedClubs.filter(c => c !== clubId)
      : [...data.joinedClubs, clubId];
    updateData({ joinedClubs: joined });
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1">
          {Array.from({ length: SETUP_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= setupIdx ? 'bg-primary' : 'bg-black/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto pb-32">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2 animate-fade-up text-black">
          Find Your Community
        </h1>
        <p className="text-sm text-center mb-8 animate-fade-up text-black/60">
          Join clubs that match your interests and location.
        </p>

        <div className="space-y-2.5 animate-fade-up">
          {MOCK_CLUBS.map(club => {
            const joined = data.joinedClubs.includes(club.id);
            return (
              <button
                key={club.id}
                onClick={() => toggle(club.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  joined ? 'border-primary bg-white shadow-sm' : 'border-black/10 bg-white/80 hover:border-black/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${joined ? 'bg-primary/10' : 'bg-black/5'}`}>
                    <Users className={`w-5 h-5 ${joined ? 'text-primary' : 'text-black/40'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-black truncate">{club.name}</p>
                      {joined && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-black/30" />
                      <span className="text-xs text-black/40">{club.location}</span>
                      <span className="text-xs text-black/30">·</span>
                      <span className="text-xs text-black/40">{club.members.toLocaleString()} members</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {club.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/50">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={next} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          {data.joinedClubs.length > 0 ? `Continue (${data.joinedClubs.length} joined)` : 'Next'}
          <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={next} className="w-full text-sm text-black/50 mt-2 py-2">Skip for now</button>
        <button onClick={back} className="w-full text-xs text-black/40 py-1">Back</button>
      </div>
    </div>
  );
};

export default ClubDiscoveryStep;
