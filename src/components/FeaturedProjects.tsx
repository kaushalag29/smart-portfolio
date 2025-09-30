'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { githubService } from '@/lib/github';
import { GithubIcon, ExternalLink, Loader } from 'lucide-react';
import { 
  SiNextdotjs, SiOpenai, SiReact, SiTypescript, 
  SiTailwindcss, SiNodedotjs, SiMongodb,
  SiLaravel, SiPhp, SiMysql, SiDocker
} from 'react-icons/si';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';

type GitHubRepo = RestEndpointMethodTypes["repos"]["listForUser"]["response"]["data"][0];

const techIcons: { [key: string]: React.ReactNode } = {
  'Next.js': <SiNextdotjs className="w-4 h-4" />,
  'OpenAI': <SiOpenai className="w-4 h-4" />,
  'React': <SiReact className="w-4 h-4" />,
  'TypeScript': <SiTypescript className="w-4 h-4" />,
  'TailwindCSS': <SiTailwindcss className="w-4 h-4" />,
  'Node.js': <SiNodedotjs className="w-4 h-4" />,
  'MongoDB': <SiMongodb className="w-4 h-4" />,
  'Laravel': <SiLaravel className="w-4 h-4" />,
  'PHP': <SiPhp className="w-4 h-4" />,
  'MySQL': <SiMysql className="w-4 h-4" />,
  'Docker': <SiDocker className="w-4 h-4" />
};

const FeaturedProjects: React.FC = () => {
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const username = 'kaushalag29';
      const { data: repos } = await githubService.getRepositories(username, {
        per_page: 100,
        type: 'owner'
      });

      // Sort by stars and update date
      const sortedRepos = repos.sort((a, b) => {
        // First compare by stars
        const starsA = a.stargazers_count || 0;
        const starsB = b.stargazers_count || 0;
        if (starsB !== starsA) {
          return starsB - starsA;
        }
        // If stars are equal, sort by update date
        const dateA = new Date(a.updated_at || 0).getTime();
        const dateB = new Date(b.updated_at || 0).getTime();
        return dateB - dateA;
      });

      setProjects(sortedRepos.slice(0, 4));
    } catch (err) {
      setError('Error fetching featured projects');
      console.error('Error fetching featured projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg p-4 transition-colors">
      <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 mb-4">
        Github Featured Projects
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-50 dark:bg-gradient-to-br dark:from-[#1E1E2E] dark:to-[#2D2D44] rounded-lg p-3 flex flex-col justify-between border border-gray-200 dark:border-gray-800/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
          >
            <div>
              <h3 className="text-base font-semibold mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {project.description || 'No description available'}
              </p>
              {project.topics && project.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.topics.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.topics.length > 3 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-600 dark:text-gray-400">
                      +{project.topics.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">★</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{project.stargazers_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">⑂</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{project.forks_count}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    onClick={(e) => e.preventDefault()}
                    className="text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                  </div>
                  {project.homepage && (
                    <a
                      href={project.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors z-10"
                      title="View Live Demo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProjects;