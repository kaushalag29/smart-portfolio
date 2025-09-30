'use client'

import React from 'react';
import Image from 'next/image';
import { GithubIcon, ExternalLink } from 'lucide-react';

type Project = {
  id: string;
  img: string;
  title: string;
  info: string;
  info2?: string;
  url?: string; // demo
  repo?: string; // source
};

const personalProjects: Project[] = [
  {
    id: 'p1',
    img: '/Project1.png',
    title: 'Video Dubber',
    info: 'Dubbing any video using subtitles + open-source components.',
    info2: 'Tech Stack → Python, TTS (Voice Cloning), FFmpeg',
    url: 'https://www.youtube.com/channel/UCkeZ85bZLIcYJGTxeQhsTxA',
  },  
  {
    id: 'p2',
    img: '/Project2.png',
    title: 'Image-Based Retrieval System',
    info: 'Evaluation of FAISS VectorDB for retrieving K similar images for a given input.',
    info2: 'Tech Stack → Python, FAISS, SigLIP',
    url: 'https://drive.google.com/file/d/1agdnF5qffHHcn4D5sYdSJiKRMIqx8Eoq/view',
    repo: 'https://github.com/kaushalag29/COMP-646-Faiss-Project',
  },
  {
    id: 'p3',
    img: '/Project3.png',
    title: 'Chest X-ray Medical Report Generation',
    info: 'Transfer learning + Encoder–Decoder achieving BLEU 0.322 for automated report generation.',
    info2: 'Optimized RNN/LSTM/GRU (+~30% BLEU). Nov 2023 – Dec 2023',
    url: 'https://github.com/kaushalag29/COMP576-Final-Project/blob/main/IEEE%20Format%20Research%20Paper.pdf',
    repo: 'https://github.com/kaushalag29/COMP576-Final-Project',
  },
  {
    id: 'p4',
    img: '/Project4.png',
    title: 'BC Web Hosting Platform',
    info: 'Static website hosting using Ethereum Blockchain & IPFS.',
    info2: 'Tech Stack → Blockchain, IPFS, MetaMask, Chrome Extension',
    url: 'https://youtu.be/BoGtQ4uK0-I',
  },
];

const PersonalProjects: React.FC = () => {
  return (
    <section id="personal-projects" className="bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg p-3 transition-colors">
      <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 mb-3">
        Personal Projects
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
        {personalProjects.map((project) => (
          <article
            key={project.id}
            className="bg-gray-50 dark:bg-gradient-to-br dark:from-[#1E1E2E] dark:to-[#2D2D44] rounded-lg p-2.5 flex flex-col justify-between border border-gray-200 dark:border-gray-800/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
          >
            <a
              href={project.url || project.repo || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col flex-1 cursor-pointer"
            >
              <div>
                <div className="relative h-28 w-full mb-2 rounded-md overflow-hidden bg-gray-100 dark:bg-[#1E2330] group-hover:ring-2 group-hover:ring-blue-500/50 transition-all">
                  <Image src={project.img} alt={project.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <h3 className="text-base font-semibold mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 line-clamp-2">{project.info}</p>
                {project.info2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 line-clamp-1">{project.info2}</p>
                )}
              </div>
            </a>
            <div className="flex items-center space-x-2 mt-1">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors z-10"
                  title="View Demo"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {project.repo && project.repo.trim().length > 0 && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors z-10"
                  title="View Repository"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PersonalProjects;


