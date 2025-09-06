"use client";

import React, { useMemo, useState } from 'react';
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
const TimelineItem: React.FC<{ item: TimelineItem }> = ({ item }) => (
  <div className="mb-8 relative">
    <div className="absolute top-0 left-0 w-2 h-full bg-gray-200 dark:bg-gray-700" />
    <div className="ml-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="absolute left-0 top-4 w-6 h-6 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800" />
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