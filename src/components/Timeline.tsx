"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import resumeData from '@/data/resumeData.json';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineItem {
  type: 'education' | 'experience';
  title: string;
  organization: string;
  date: string;
  location?: string;
  description?: string;
  skills?: string[];
}

// Transform resume data into timeline format
const educationItems: TimelineItem[] = resumeData.education.map(edu => ({
  type: 'education' as const,
  title: edu.degree,
  organization: edu.institution,
  date: `${edu.startDate} - ${edu.endDate}`,
  description: edu.description,
  skills: [] // Education doesn't have specific skills in the JSON, but we could extract from description
}));

const experienceItems: TimelineItem[] = resumeData.experience.map(exp => ({
  type: 'experience' as const,
  title: exp.position,
  organization: exp.company,
  date: `${exp.startDate} - ${exp.endDate}`,
  location: exp.location,
  description: exp.description,
  skills: [] // Could extract key technologies from description if needed
}));
const getLogoFor = (organization: string): string | null => {
  const org = organization.toLowerCase();
  // Keyword-based aliases → expected filenames in /public
  if (org.includes('cloudwick')) return '/Cloudwick.png';
  if (org.includes('paycom')) return '/Paycom.png';
  if (org.includes('qubole')) return '/Qubole.png';
  if (org.includes('microland')) return '/Microland.png';
  if (org.includes('ranchi')) return '/RanchiMall.png';
  if (org.includes('rice')) return '/Rice.png';
  if (org.includes('birla') || org.includes('bit mesra') || org.includes('mesra')) return '/BIT.png';

  // Fallback: try sanitized first token, e.g., "/Acme.png"
  const firstToken = organization.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
  if (firstToken) return `/${firstToken}.png`;
  return null;
};

const getLogoSizeFor = (organization: string): { width: number; height: number } => {
  const org = organization.toLowerCase();
  // Reduced size for specific orgs
  if (org.includes('ranchi') || org.includes('rice') || org.includes('birla') || org.includes('bit mesra') || org.includes('mesra')) {
    return { width: 40, height: 40 };
  }
  // Default size
  return { width: 80, height: 80 };
};

const TimelineItem: React.FC<{ item: TimelineItem }> = ({ item }) => {
  const logoSrc = getLogoFor(item.organization);
  const logoSize = getLogoSizeFor(item.organization);
  return (
    <div className="mb-8 relative">
      <div className="ml-0 p-4 pr-24 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
        {logoSrc && (
          <Image
            src={logoSrc}
            alt={`${item.organization} logo`}
            width={logoSize.width}
            height={logoSize.height}
            className="absolute right-3 top-3 rounded-md shadow-sm"
          />
        )}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{item.organization}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">{item.date}</p>
        {item.location && (
          <p className="text-sm text-gray-500 dark:text-gray-500">{item.location}</p>
        )}
        {item.description && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
        )}
        {item.skills && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Timeline: React.FC = () => {
  const [showAllExp, setShowAllExp] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);

  const initialExpToShow = 3;
  const initialEduToShow = 2;

  const visibleExperience = useMemo(
    () => (showAllExp ? experienceItems : experienceItems.slice(0, initialExpToShow)),
    [showAllExp]
  );
  const visibleEducation = useMemo(
    () => (showAllEdu ? educationItems : educationItems.slice(0, initialEduToShow)),
    [showAllEdu]
  );

  const expHiddenCount = Math.max(0, experienceItems.length - visibleExperience.length);
  const eduHiddenCount = Math.max(0, educationItems.length - visibleEducation.length);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Timeline</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Experience</h2>
          <div id="experience-list">
            {visibleExperience.map((item, index) => (
              <TimelineItem key={`${item.title}-${index}`} item={item} />
            ))}
          </div>
          {experienceItems.length > initialExpToShow && (
            <div className="mt-2 flex">
              <button
                onClick={() => setShowAllExp((v) => !v)}
                className="mx-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-[#1E2330] dark:hover:bg-[#252B3B] text-gray-700 dark:text-gray-300 transition-colors"
                aria-expanded={showAllExp}
                aria-controls="experience-list"
              >
                {showAllExp ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show {expHiddenCount} more
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Education</h2>
          <div id="education-list">
            {visibleEducation.map((item, index) => (
              <TimelineItem key={`${item.title}-${index}`} item={item} />
            ))}
          </div>
          {educationItems.length > initialEduToShow && (
            <div className="mt-2 flex">
              <button
                onClick={() => setShowAllEdu((v) => !v)}
                className="mx-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-[#1E2330] dark:hover:bg-[#252B3B] text-gray-700 dark:text-gray-300 transition-colors"
                aria-expanded={showAllEdu}
                aria-controls="education-list"
              >
                {showAllEdu ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show {eduHiddenCount} more
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;