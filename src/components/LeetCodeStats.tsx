'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Award, Code, CheckCircle } from 'lucide-react';

interface LeetCodeStats {
  status: string;
  message: string;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
  submissionCalendar: Record<string, number>;
}

type LeetCodeStatsProps = {
  compact?: boolean
}

const LeetCodeStats: React.FC<LeetCodeStatsProps> = ({ compact = false }) => {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeetCodeStats = async () => {
      try {
        const response = await fetch('https://leetcode-stats-api.herokuapp.com/kaushalag29');
        if (!response.ok) {
          throw new Error('Failed to fetch LeetCode stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Unable to load LeetCode statistics');
        console.error('Error fetching LeetCode stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeetCodeStats();
  }, []);

  if (loading) {
    return (
      <div className={`bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg ${compact ? 'p-3' : 'p-4'} h-full transition-colors`}>
        <div className="flex items-center justify-center h-full">
          <div className={`animate-spin rounded-full ${compact ? 'h-6 w-6' : 'h-8 w-8'} border-b-2 border-orange-500`}></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg ${compact ? 'p-3' : 'p-4'} h-full transition-colors`}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Code className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400 mb-2`} />
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
            {error || 'Unable to load LeetCode stats'}
          </p>
        </div>
      </div>
    );
  }

  const solvedPercentage = Math.round((stats.totalSolved / stats.totalQuestions) * 100);
  const easyPercentage = Math.round((stats.easySolved / stats.totalEasy) * 100);
  const mediumPercentage = Math.round((stats.mediumSolved / stats.totalMedium) * 100);
  const hardPercentage = Math.round((stats.hardSolved / stats.totalHard) * 100);

  return (
    <div className={`bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg ${compact ? 'p-5' : 'p-4'} h-full transition-colors`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-4' : 'mb-4'}`}>
        <h2 className={`${compact ? 'text-base font-semibold' : 'text-xl font-bold'} text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600`}>
          LeetCode Stats
        </h2>
        <div className="flex items-center space-x-1">
          <Trophy className={`${compact ? 'w-4 h-4' : 'w-4 h-4'} text-orange-500`} />
          <span className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
            #{stats.ranking.toLocaleString()}
          </span>
        </div>
      </div>

      <div className={`${compact ? 'space-y-4' : 'space-y-4'}`}>
        {/* Overall Progress */}
        <div className="bg-gray-50 dark:bg-[#1E2330] rounded-lg ${compact ? 'p-4' : 'p-3'}">
          <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-2'}`}>
            <div className="flex items-center space-x-2">
              <Target className={`${compact ? 'w-4 h-4' : 'w-4 h-4'} text-orange-500`} />
              <span className={`${compact ? 'text-sm' : 'text-sm'} font-medium text-gray-900 dark:text-gray-200`}>
                Problems Solved
              </span>
            </div>
            <span className={`${compact ? 'text-sm' : 'text-sm'} font-bold text-orange-600 dark:text-orange-400`}>
              {stats.totalSolved}/{stats.totalQuestions}
            </span>
          </div>
          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${compact ? 'h-2.5' : 'h-2'} ${compact ? 'mb-1' : 'mb-1'}` }>
            <div 
              className={`bg-gradient-to-r from-orange-500 to-orange-600 ${compact ? 'h-2.5' : 'h-2'} rounded-full transition-all duration-300`}
              style={{ width: `${solvedPercentage}%` }}
            />
          </div>
          <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
            {solvedPercentage}% Complete
          </p>
        </div>

        {/* Problem Difficulty Breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {/* Easy Problems */}
          <div className={`bg-gray-50 dark:bg-[#1E2330] rounded-lg ${compact ? 'p-3' : 'p-3'}`}>
            <div className={`flex items-center justify-between ${compact ? 'mb-2.5' : 'mb-2'}`}>
              <span className={`${compact ? 'text-xs' : 'text-xs'} font-medium text-green-600 dark:text-green-400`}>Easy</span>
              <CheckCircle className={`${compact ? 'w-3 h-3' : 'w-3 h-3'} text-green-500`} />
            </div>
            <div className={`${compact ? 'text-sm' : 'text-sm'} font-bold text-gray-900 dark:text-gray-200 ${compact ? 'mb-1.5' : 'mb-1'}`}>
              {stats.easySolved}
            </div>
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${compact ? 'h-2' : 'h-1.5'} ${compact ? 'mb-1' : 'mb-1'}`}>
              <div 
                className={`bg-green-500 ${compact ? 'h-2' : 'h-1.5'} rounded-full transition-all duration-300`}
                style={{ width: `${easyPercentage}%` }}
              />
            </div>
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
              {easyPercentage}%
            </p>
          </div>

          {/* Medium Problems */}
          <div className={`bg-gray-50 dark:bg-[#1E2330] rounded-lg ${compact ? 'p-3' : 'p-3'}`}>
            <div className={`flex items-center justify-between ${compact ? 'mb-2.5' : 'mb-2'}`}>
              <span className={`${compact ? 'text-xs' : 'text-xs'} font-medium text-yellow-600 dark:text-yellow-400`}>Medium</span>
              <CheckCircle className={`${compact ? 'w-3 h-3' : 'w-3 h-3'} text-yellow-500`} />
            </div>
            <div className={`${compact ? 'text-sm' : 'text-sm'} font-bold text-gray-900 dark:text-gray-200 ${compact ? 'mb-1.5' : 'mb-1'}`}>
              {stats.mediumSolved}
            </div>
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${compact ? 'h-2' : 'h-1.5'} ${compact ? 'mb-1' : 'mb-1'}`}>
              <div 
                className={`bg-yellow-500 ${compact ? 'h-2' : 'h-1.5'} rounded-full transition-all duration-300`}
                style={{ width: `${mediumPercentage}%` }}
              />
            </div>
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
              {mediumPercentage}%
            </p>
          </div>

          {/* Hard Problems */}
          <div className={`bg-gray-50 dark:bg-[#1E2330] rounded-lg ${compact ? 'p-3' : 'p-3'}`}>
            <div className={`flex items-center justify-between ${compact ? 'mb-2.5' : 'mb-2'}`}>
              <span className={`${compact ? 'text-xs' : 'text-xs'} font-medium text-red-600 dark:text-red-400`}>Hard</span>
              <CheckCircle className={`${compact ? 'w-3 h-3' : 'w-3 h-3'} text-red-500`} />
            </div>
            <div className={`${compact ? 'text-sm' : 'text-sm'} font-bold text-gray-900 dark:text-gray-200 ${compact ? 'mb-1.5' : 'mb-1'}`}>
              {stats.hardSolved}
            </div>
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${compact ? 'h-2' : 'h-1.5'} ${compact ? 'mb-1' : 'mb-1'}`}>
              <div 
                className={`bg-red-500 ${compact ? 'h-2' : 'h-1.5'} rounded-full transition-all duration-300`}
                style={{ width: `${hardPercentage}%` }}
              />
            </div>
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
              {hardPercentage}%
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`bg-gray-50 dark:bg-[#1E2330] rounded-lg ${compact ? 'p-4' : 'p-3'} text-center`}>
            <TrendingUp className={`${compact ? 'w-5 h-5' : 'w-4 h-4'} text-blue-500 mx-auto ${compact ? 'mb-2' : 'mb-1'}`} />
            <div className={`${compact ? 'text-sm' : 'text-sm'} font-bold text-gray-900 dark:text-gray-200`}>
              {stats.acceptanceRate}%
            </div>
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>Acceptance</p>
          </div>
          
          <div className={`bg-gray-50 dark:bg-[#1E2330] rounded-lg ${compact ? 'p-4' : 'p-3'} text-center`}>
            <Award className={`${compact ? 'w-5 h-5' : 'w-4 h-4'} text-purple-500 mx-auto ${compact ? 'mb-2' : 'mb-1'}`} />
            <div className={`${compact ? 'text-sm' : 'text-sm'} font-bold text-gray-900 dark:text-gray-200`}>
              {stats.contributionPoints.toLocaleString()}
            </div>
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>Points</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeStats;
