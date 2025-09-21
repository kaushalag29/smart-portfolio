import React from 'react';
import Image from 'next/image';
import heroImage from "@/assets/Kaushal.jpg";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import LeetCodeStats from '@/components/LeetCodeStats';
import { Twitter, GithubIcon, Linkedin, FileText } from 'lucide-react';
import { FaMedium } from 'react-icons/fa';
import { SiCodeforces, SiCodechef, SiSpoj, SiCredly, SiLeetcode } from 'react-icons/si';

const AboutMe: React.FC = () => {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg p-4 h-full transition-colors">
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row gap-3 mt-2">
          <div className="flex-shrink-0 flex flex-col items-center">
            <Dialog>
              <DialogTrigger asChild>
                <button className="rounded-full ring-2 ring-blue-500/20 focus:outline-none focus:ring-4 focus:ring-blue-400">
                  <Image
                    src={heroImage}
                    alt="Kaushal's profile picture"
                    className="rounded-full w-28 h-28 object-cover"
                    priority
                  />
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 bg-transparent border-0 shadow-none" closeClassName="!bg-red-600 !text-white hover:!bg-red-700">
                <DialogTitle className="sr-only">Profile photo</DialogTitle>
                <Image
                  src={heroImage}
                  alt="Kaushal's profile picture enlarged"
                  className="rounded-lg w-full h-auto"
                />
              </DialogContent>
            </Dialog>
            <a
              href="https://drive.google.com/file/d/1tMKKWhOf1ortURHQukP9m2QDGgcyrxeC/view"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-white text-sm font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <FileText className="w-5 h-5" />
              <span>View Resume</span>
            </a>
            <div className="mt-3 grid grid-cols-4 gap-4 place-items-center">
              {/* Row 1: LinkedIn, Credly, GitHub, Medium */}
              <a 
                href="https://linkedin.com/in/kaushal-kumar-agarwal-976854166" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-7 h-7" />
              </a>
              <a 
                href="https://www.credly.com/users/kaushal-agarwal.d7d5896d/badges#credly" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                aria-label="Credly Profile"
                title="Credly"
              >
                <SiCredly className="w-7 h-7" />
              </a>
              <a 
                href="https://github.com/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-7 h-7" />
              </a>
              <a 
                href="https://kaushalagarwal-73962.medium.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                aria-label="Medium Profile"
              >
                <FaMedium className="w-7 h-7" />
              </a>

              {/* Row 2: LeetCode, Codeforces, CodeChef, SPOJ */}
              <a 
                href="https://leetcode.com/u/kaushalag29/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                aria-label="LeetCode Profile"
                title="LeetCode"
              >
                <SiLeetcode className="w-7 h-7" />
              </a>
              <a 
                href="https://codeforces.com/profile/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                aria-label="Codeforces Profile"
                title="Codeforces"
              >
                <SiCodeforces className="w-7 h-7" />
              </a>
              <a 
                href="https://www.codechef.com/users/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-500 transition-colors"
                aria-label="CodeChef Profile"
                title="CodeChef"
              >
                <SiCodechef className="w-7 h-7" />
              </a>
              <a 
                href="https://www.spoj.com/users/kaushalag29/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="SPOJ Profile"
                title="SPOJ"
              >
                <SiSpoj className="w-7 h-7" />
              </a>
            </div>
            <div className="mt-3 w-full max-w-[320px]">
              <LeetCodeStats compact />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Kaushal Kumar Agarwal
                </h1>
                <h2 className="text-md font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 mb-2">
                  AWS Certified | Software Engineer × AI/ML Innovator
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">@kaushalag29</p>
              </div>
              
              <div className="flex-1 bg-gray-50 dark:bg-[#1E2330] rounded-lg p-4 mb-2 mt-2">
                <div className="space-y-2.5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    I'm Kaushal Agarwal, an AWS Certified Software & AI/ML Engineer with 3+ years of experience designing and building intelligent, scalable systems that power real-world applications. My work spans cloud-native platforms, distributed systems, and modern AI/ML workflows, where I love bridging the gap between software engineering rigor and cutting-edge machine learning innovation.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    I hold a Master's in Computer Science (Data Science & Machine Learning specialization) from Rice University and a B.E. in Computer Science from BIT Mesra. Over the years, I've built solutions ranging from serverless data platforms and blockchain applications to agentic RAG systems and generative AI pipelines.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    I'm passionate about software architecture, system security, and the evolving landscape of generative AI, always asking how technology can be harnessed to augment human capabilities responsibly. Outside of work, you'll find me exploring emerging tech, contributing to open source, and experimenting with ideas that push the boundaries of AI-driven systems. What excites me most is creating technology that is not just intelligent, but also scalable, secure, and impactful.
                  </p>
                </div>
              </div>

              <div className="mt-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutMe;