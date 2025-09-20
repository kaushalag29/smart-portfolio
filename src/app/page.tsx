import React from 'react';
import AboutMe from '@/components/AboutMe';
import Technologies from '@/components/Technologies';
import FeaturedProjects from '@/components/FeaturedProjects';
import PersonalProjects from '@/components/PersonalProjects';
import GitHubStats from '@/components/GitHubStats';
import Timeline from '@/components/Timeline';
import Languages from '@/components/Languages';
import Hobbies from '@/components/Hobbies';

const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen p-2 max-w-7xl mx-auto space-y-2">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2">
          <AboutMe />
        </div>
        <div>
          <GitHubStats />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        {/* Left Column - Personal Projects + Github Featured Projects */}
        <div className="lg:col-span-3 space-y-2">
          <PersonalProjects />
          <FeaturedProjects />
        </div>

        {/* Right Column - Technologies Stack + Hobbies + Languages */}
        <div className="lg:col-span-2 space-y-2">
          <Technologies />
          <Hobbies />
          <Languages />
        </div>

        {/* Timeline - Spans full width */}
        <div className="lg:col-span-5">
          <Timeline />
        </div>
      </div>
    </main>
  );
};

export default HomePage;