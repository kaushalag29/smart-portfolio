"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import resumeData from '@/data/resumeData.json';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';
import { useChat, type SuggestedQuestion } from '@/contexts/ChatContext';

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

// Smart question templates for recruiters
const getSmartQuestions = (item: TimelineItem): SuggestedQuestion[] => {
  if (item.type === 'experience') {
    return [
      { 
        icon: 'target', 
        text: `Tell me about the key projects and achievements at ${item.organization}`,
        color: 'text-blue-600 dark:text-blue-400'
      },
      { 
        icon: 'trending-up', 
        text: `What was the biggest impact or measurable result during your time at ${item.organization}?`,
        color: 'text-green-600 dark:text-green-400'
      },
      { 
        icon: 'lightbulb', 
        text: `Describe a challenging problem you solved as ${item.title} at ${item.organization}`,
        color: 'text-purple-600 dark:text-purple-400'
      },
      { 
        icon: 'message', 
        text: `What technologies and skills did you use in your role at ${item.organization}?`,
        color: 'text-orange-600 dark:text-orange-400'
      }
    ];
  } else {
    return [
      { 
        icon: 'lightbulb', 
        text: `Tell me about your academic experience at ${item.organization}`,
        color: 'text-emerald-600 dark:text-emerald-400'
      },
      { 
        icon: 'target', 
        text: `What projects or achievements stood out during ${item.title} at ${item.organization}?`,
        color: 'text-teal-600 dark:text-teal-400'
      },
      { 
        icon: 'trending-up', 
        text: `How did ${item.title} from ${item.organization} prepare you for your career?`,
        color: 'text-indigo-600 dark:text-indigo-400'
      }
    ];
  }
};

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
  if (org.includes('amazon web services') || org.includes('aws')) return { width: 48, height: 48 };
  if (org.includes('cloudwick')) return { width: 48, height: 48 };
  if (org.includes('paycom')) return { width: 48, height: 48 };
  if (org.includes('qubole')) return { width: 48, height: 48 };
  if (org.includes('microland')) return { width: 48, height: 48 };
  if (org.includes('ranchi mall')) return { width: 48, height: 48 };
  if (org.includes('rice university')) return { width: 48, height: 48 };
  if (org.includes('bit mesra') || org.includes('birla institute')) return { width: 48, height: 48 };
  return { width: 48, height: 48 };
};


const TimelineNode: React.FC<{ 
  item: TimelineItem; 
  isExpanded: boolean; 
  onToggle: () => void;
  isLast: boolean;
}> = ({ item, isExpanded, onToggle, isLast }) => {
  const { openChat } = useChat();
  const logoSrc = getLogoFor(item.organization);
  const logoSize = getLogoSizeFor(item.organization);
  const smartQuestions = getSmartQuestions(item);
  
  const handleAskAI = () => {
    // Open chat with suggested questions
    openChat(undefined, smartQuestions);
  };
  
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
              alt={item.organization}
              width={logoSize.width}
              height={logoSize.height}
              className="object-contain rounded-full p-1"
            />
          </div>
        ) : (
          <span className={`text-2xl font-bold ${
            isExpanded ? 'text-white' : item.type === 'experience' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
          }`}>
            {item.organization.charAt(0)}
          </span>
        )}
      </div>
      
      {/* Content Card */}
      <div className="ml-6 flex-1 min-w-0">
        <div className={`relative rounded-xl border-2 transition-all duration-300 ${
          isExpanded 
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl' 
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}>
          
          {/* AI Assistant Badge - Floating */}
          <div className="absolute -top-3 right-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAskAI();
              }}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600"
              title="Ask AI about this experience"
            >
              <Sparkles size={14} className="group-hover:animate-spin" />
              <span className="text-xs font-semibold whitespace-nowrap">Ask AI</span>
            </button>
          </div>

          {/* Header */}
          <div 
            className="p-4 cursor-pointer"
            onClick={onToggle}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="truncate">{item.organization}</span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{item.date}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`flex-shrink-0 p-2 rounded-full transition-colors duration-200 ${
                isExpanded 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
          </div>


          {/* Expanded Details */}
          {isExpanded && item.description && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4 space-y-2">
                {item.description.split('\n').map((line, index) => (
                  line.trim() && (
                    <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {line.startsWith('•') || line.startsWith('-') ? (
                        <span className="flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                          <span className="flex-1">{line.substring(1).trim()}</span>
                        </span>
                      ) : (
                        line
                      )}
                    </p>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TimelineEnhanced: React.FC = () => {
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

  const hasAnyExpanded = expandedItems.size > 0;

  return (
    <section id="timeline" className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Professional Journey
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
          <Sparkles size={18} className="text-purple-500 animate-pulse" />
          <p className="text-base">
            Click <span className="font-semibold text-purple-600 dark:text-purple-400">"Ask AI"</span> on any experience to learn more with smart recruiter questions
          </p>
        </div>
        
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
              className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              Expand All
            </button>
            {hasAnyExpanded && (
              <button
                onClick={collapseAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Collapse All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
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
      {allTimelineItems.length > 5 && (
        <div className="mt-8 text-center">
          <button
            onClick={toggleShowAll}
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {showAllItems ? 'Show Less' : `Show ${allTimelineItems.length - 5} More Experiences`}
          </button>
        </div>
      )}
    </section>
  );
};

export default TimelineEnhanced;
