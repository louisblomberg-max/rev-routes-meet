import { ReactNode } from 'react';

const DesktopPageWrapper = ({ children }: { children: ReactNode }) => (
  <div className="w-full min-h-screen md:max-w-2xl md:mx-auto">
    {children}
  </div>
);

export default DesktopPageWrapper;
