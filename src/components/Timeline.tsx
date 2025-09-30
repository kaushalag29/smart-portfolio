"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import resumeData from '@/data/resumeData.json';
import { ChevronDown, ChevronUp, Calendar, MapPin, ExternalLink } from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'education' | 'experience';
  title: string;
  organization: string;
  date: string;
  location?: string;
  description?: string;
  url?: string;
  startYear: number;
}

// Transform resume data into timeline format
const educationItems: TimelineItem[] = resumeData.education.map((edu, index) => ({
  id: `edu-${index}`,
  type: 'education' as const,
  title: edu.degree,
  organization: edu.institution,
  date: `${edu.startDate} - ${edu.endDate}`,
  location: (edu as any).location,
  description: edu.description,
  url: (edu as any).institutionUrl,
  startYear: parseInt(edu.startDate.split(' ')[1] || edu.startDate.split(' ')[0])
}));

const experienceItems: TimelineItem[] = resumeData.experience.map((exp, index) => ({
  id: `exp-${index}`,
  type: 'experience' as const,
  title: exp.position,
  organization: exp.company,
  date: `${exp.startDate} - ${exp.endDate}`,
  location: exp.location,
  description: exp.description,
  url: (exp as any).companyUrl,
  startYear: parseInt(exp.startDate.split(' ')[1] || exp.startDate.split(' ')[0])
}));

// Combine and sort all items by start year (most recent first)
const allTimelineItems = [...educationItems, ...experienceItems].sort((a, b) => b.startYear - a.startYear);

const getLogoFor = (organization: string): string | null => {
  const org = organization.toLowerCase();
  if (org.includes('amazon web services') || org.includes('aws')) return '/AWS.png';
  if (org.includes('cloudwick')) return '/Cloudwick.png';
  if (org.includes('paycom')) return '/Paycom.png';
  if (org.includes('qubole')) return '/Qubole.png';
  if (org.includes('microland')) return '/Microland.png';
  if (org.includes('ranchi mall')) return '/RanchiMall.png';
  if (org.includes('rice university')) return '/Rice.png';
  if (org.includes('bit mesra') || org.includes('birla institute')) return '/BIT.png';
  if (org.includes('d.b.m.s') || org.includes('dbms')) return '/DBMS.png';
  return null;
};

const getLogoSizeFor = (organization: string) => {
  const org = organization.toLowerCase();
  // AWS gets premium prominent display as current role at major tech company
  if (org.includes('amazon web services') || org.includes('aws')) {
    return { width: 52, height: 52 };
  }
  // Company logos that need extra enlargement for visibility
  if (org.includes('cloudwick') || org.includes('paycom') || org.includes('microland')) {
    return { width: 48, height: 48 };
  }
  // Qubole - slightly smaller but still prominent
  if (org.includes('qubole')) {
    return { width: 44, height: 44 };
  }
  // Educational institutions and smaller organizations
  if (org.includes('ranchi mall') || org.includes('bit mesra') || org.includes('rice university') || org.includes('d.b.m.s')) {
    return { width: 36, height: 36 };
  }
  // Default size
  return { width: 38, height: 38 };
};

const TimelineNode: React.FC<{ 
  item: TimelineItem; 
  isExpanded: boolean; 
  onToggle: () => void;
  isLast: boolean;
}> = ({ item, isExpanded, onToggle, isLast }) => {
  const logoSrc = getLogoFor(item.organization);
  const logoSize = getLogoSizeFor(item.organization);
  
  return (
    <div className="relative flex items-start group">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-8 top-20 w-0.5 h-20 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"></div>
      )}
      
      {/* Timeline Dot */}
      <div 
        className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 cursor-pointer transition-all duration-300 ${
          isExpanded 
            ? item.type === 'experience'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-white dark:border-gray-900 shadow-lg scale-110' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-white dark:border-gray-900 shadow-lg scale-110'
            : item.type === 'experience'
              ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800/50'
              : 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-800/50'
        }`}
        onClick={onToggle}
      >
        {logoSrc ? (
          <div className="flex items-center justify-center w-full h-full">
            <Image
              src={logoSrc}
              alt={`${item.organization} logo`}
              width={logoSize.width}
              height={logoSize.height}
              className="rounded-full object-contain"
              style={{ maxWidth: '90%', maxHeight: '90%' }}
            />
          </div>
        ) : (
          <div className={`w-4 h-4 rounded-full ${
            item.type === 'experience' 
              ? 'bg-blue-500 dark:bg-blue-400' 
              : 'bg-purple-500 dark:bg-purple-400'
          }`} />
        )}
      </div>

      {/* Content Card */}
      <div className="ml-8 flex-1">
        {/* Compact Header (Always Visible) */}
        <div 
          className={`cursor-pointer p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${
            item.type === 'experience' 
              ? 'border-blue-500 dark:border-blue-400' 
              : 'border-emerald-500 dark:border-emerald-400'
          }`}
          onClick={onToggle}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                {item.title}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                {item.organization}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
        </div>
      )}
              </div>
            </div>
            
            {/* Expand/Collapse Icon */}
            <div className="flex items-center gap-2 ml-4">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </a>
              )}
              <div className={`p-1 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[600px] md:max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-[500px] md:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
            {item.description && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {item.description.split('\n').map((line, index) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  return (
                    <div key={index} className={`flex items-start ${index > 0 ? 'mt-2 md:mt-3' : ''}`}>
                      {item.type === 'education' && index === 0 ? (
                        <p className="font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                          {trimmedLine}
                        </p>
                      ) : (
                        <>
                          <span className="text-blue-500 dark:text-blue-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                          <p className="leading-relaxed flex-1">
                            {trimmedLine}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
    </div>
  </div>
);
};

const Timeline: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAllItems, setShowAllItems] = useState(false);

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const toggleShowAll = () => {
    setShowAllItems(!showAllItems);
  };

  const expandAll = () => {
    const allIds = new Set(allTimelineItems.map(item => item.id));
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // Show top 5 items by default (most recent work experiences and education)
  const visibleItems = showAllItems ? allTimelineItems : allTimelineItems.slice(0, 5);
  const hasMoreItems = allTimelineItems.length > 5;
  const hasAnyExpanded = expandedItems.size > 0;

  return (
    <section id="timeline" className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Professional Journey
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Click on any timeline node to explore details
        </p>
        
        {/* Legend and Controls */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Legend */}
          <div className="flex items-center gap-8 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Education</span>
            </div>
          </div>
          
          {/* Expand/Collapse Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800 transition-all duration-200 hover:scale-105"
            >
              <ChevronDown className="w-3.5 h-3.5 group-hover:animate-pulse" />
              <span>Expand All</span>
            </button>
            
            <button
              onClick={collapseAll}
              disabled={!hasAnyExpanded}
              className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 hover:scale-105 ${
                hasAnyExpanded
                  ? 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  : 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronUp className={`w-3.5 h-3.5 ${hasAnyExpanded ? 'group-hover:animate-pulse' : ''}`} />
              <span>Collapse All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {visibleItems.map((item, index) => (
            <TimelineNode
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
              isLast={index === visibleItems.length - 1}
            />
          ))}
        </div>

        {/* Show More/Less Button */}
        {hasMoreItems && (
          <div className="flex justify-center mt-8">
            <button
              onClick={toggleShowAll}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {showAllItems ? (
                <>
                  <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <span>Show More ({allTimelineItems.length - 5} more items)</span>
                  <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

    </section>
  );
};

export default Timeline;