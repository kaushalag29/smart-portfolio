import React from 'react';
import { skills } from '../data/skills';
import * as Si from 'react-icons/si';
import * as Di from 'react-icons/di';
import * as Pi from 'react-icons/pi';
import * as Fa from 'react-icons/fa';
import * as Fa6 from 'react-icons/fa6';

const Technologies: React.FC = () => {
  // Create a mapping of icon names to actual components
  const iconComponents: { [key: string]: React.ElementType } = {};
  [Si, Di, Pi, Fa, Fa6].forEach(pack => {
    Object.keys(pack).forEach(key => {
      iconComponents[key] = (pack as any)[key];
    });
  });

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg p-3 transition-colors">
      <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 mb-3">
        Technologies
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 gap-1.5">
        {skills.map((skill, index) => {
          const IconComponent = iconComponents[skill.icon];
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-[#1E2330] rounded-lg transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-[#252B3B] group"
            >
              {IconComponent && (
                <div 
                  className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-400 group-hover:text-[#000000] dark:group-hover:text-white transition-colors"
                  style={{ color: skill.color }}
                >
                  <IconComponent className="w-full h-full" />
                </div>
              )}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-center leading-tight">
                {skill.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Technologies;