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
            <div className="mt-3">
              <div className="flex flex-col items-center justify-center mb-3 space-y-1">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800/30 shadow-sm">
                  <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600">
                    Connect With Me
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 animate-bounce">
                  <span>Click icons below</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 place-items-center">
              {/* Row 1: LinkedIn, Credly, GitHub, Medium */}
              <a 
                href="https://linkedin.com/in/kaushal-kumar-agarwal-976854166" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 dark:from-gray-800 dark:to-gray-900 dark:hover:from-blue-900/30 dark:hover:to-blue-800/20 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 animate-float"
                aria-label="LinkedIn Profile"
                title="LinkedIn"
              >
                <Linkedin className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-blue-400 dark:group-hover:ring-blue-500 transition-all duration-300"></div>
              </a>
              <a 
                href="https://www.credly.com/users/kaushal-agarwal.d7d5896d/badges#credly" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 dark:from-gray-800 dark:to-gray-900 dark:hover:from-orange-900/30 dark:hover:to-orange-800/20 text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-300 dark:hover:border-orange-600 animate-float-delay-1"
                aria-label="Credly Profile"
                title="Credly"
              >
                <SiCredly className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-orange-400 dark:group-hover:ring-orange-500 transition-all duration-300"></div>
              </a>
              <a 
                href="https://github.com/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500 animate-float-delay-2"
                aria-label="GitHub Profile"
                title="GitHub"
              >
                <GithubIcon className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-gray-400 dark:group-hover:ring-gray-500 transition-all duration-300"></div>
              </a>
              <a 
                href="https://kaushalagarwal-73962.medium.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 dark:from-gray-800 dark:to-gray-900 dark:hover:from-green-900/30 dark:hover:to-green-800/20 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-600 animate-float-delay-3"
                aria-label="Medium Profile"
                title="Medium"
              >
                <FaMedium className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-green-400 dark:group-hover:ring-green-500 transition-all duration-300"></div>
              </a>

              {/* Row 2: LeetCode, Codeforces, CodeChef, SPOJ */}
              <a 
                href="https://leetcode.com/u/kaushalag29/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-yellow-100 dark:from-gray-800 dark:to-gray-900 dark:hover:from-yellow-900/30 dark:hover:to-yellow-800/20 text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-yellow-300 dark:hover:border-yellow-600 animate-float"
                aria-label="LeetCode Profile"
                title="LeetCode"
              >
                <SiLeetcode className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-yellow-400 dark:group-hover:ring-yellow-500 transition-all duration-300"></div>
              </a>
              <a 
                href="https://codeforces.com/profile/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 dark:from-gray-800 dark:to-gray-900 dark:hover:from-blue-900/30 dark:hover:to-blue-800/20 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 animate-float-delay-1"
                aria-label="Codeforces Profile"
                title="Codeforces"
              >
                <SiCodeforces className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-blue-400 dark:group-hover:ring-blue-500 transition-all duration-300"></div>
              </a>
              <a 
                href="https://www.codechef.com/users/kaushalag29" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-amber-50 hover:to-amber-100 dark:from-gray-800 dark:to-gray-900 dark:hover:from-amber-900/30 dark:hover:to-amber-800/20 text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300 dark:hover:border-amber-600 animate-float-delay-2"
                aria-label="CodeChef Profile"
                title="CodeChef"
              >
                <SiCodechef className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-amber-400 dark:group-hover:ring-amber-500 transition-all duration-300"></div>
              </a>
              <a 
                href="https://www.spoj.com/users/kaushalag29/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 dark:from-gray-800 dark:to-gray-900 dark:hover:from-purple-900/30 dark:hover:to-purple-800/20 text-gray-600 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 animate-float-delay-3"
                aria-label="SPOJ Profile"
                title="SPOJ"
              >
                <SiSpoj className="w-7 h-7 group-hover:animate-pulse" />
                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-purple-400 dark:group-hover:ring-purple-500 transition-all duration-300"></div>
              </a>
              </div>
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