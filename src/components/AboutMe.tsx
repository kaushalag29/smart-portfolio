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
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <div className="flex-shrink-0 flex flex-col items-center">
            <Dialog>
              <DialogTrigger asChild>
                <button className="rounded-full ring-2 ring-blue-500/20 focus:outline-none focus:ring-4 focus:ring-blue-400">
                  <Image
                    src={heroImage}
                    alt="Kaushal's profile picture"
                    className="rounded-full w-24 h-24 object-cover"
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
              <FileText className="w-4 h-4" />
              <span>View Resume</span>
            </a>
            <div className="mt-3 grid grid-cols-4 gap-3 place-items-center">
              {/* Row 1: LinkedIn, Credly, GitHub, Medium */}
              <a 
                href="https://linkedin.com/in/kaushal-kumar-agarwal-976854166" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.credly.com/users/kaushal-agarwal.d7d5896d/badges#credly" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                aria-label="Credly Profile"
                title="Credly"
              >
                <SiCredly className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://kaushalagarwal-73962.medium.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                aria-label="Medium Profile"
              >
                <FaMedium className="w-5 h-5" />
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
                <SiLeetcode className="w-5 h-5" />
              </a>
              <a 
                href="https://codeforces.com/profile/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                aria-label="Codeforces Profile"
                title="Codeforces"
              >
                <SiCodeforces className="w-5 h-5" />
              </a>
              <a 
                href="https://www.codechef.com/users/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-500 transition-colors"
                aria-label="CodeChef Profile"
                title="CodeChef"
              >
                <SiCodechef className="w-5 h-5" />
              </a>
              <a 
                href="https://www.spoj.com/users/kaushalag29/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="SPOJ Profile"
                title="SPOJ"
              >
                <SiSpoj className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-3 w-full max-w-[280px]">
              <LeetCodeStats compact />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Kaushal Kumar Agarwal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">@kaushalag29</p>
              </div>
              
              <div className="flex-1 bg-gray-50 dark:bg-[#1E2330] rounded-lg p-4 mb-8 mt-4">
                <div className="space-y-3">
                  <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed">
                    Hey there! I&apos;m Kaushal, an AI/ML Engineer and Software Engineer passionate about building intelligent systems that solve real-world problems. With 3+ years of experience across diverse domains—from serverless data platforms to agentic RAG systems—I love exploring the intersection of software engineering, machine learning, and cloud computing.
                  </p>
                  <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed">
                    I hold a B.E. in Computer Science from BIT Mesra and recently completed my Master&apos;s at Rice University. My journey spans from blockchain applications and distributed systems to modern AI/ML workflows. I&apos;m AWS-certified and deeply interested in software architecture, security, and the evolving landscape of generative AI. When I&apos;m not coding, I enjoy exploring new technologies, contributing to open source, and thinking about how AI can augment human capabilities responsibly.
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