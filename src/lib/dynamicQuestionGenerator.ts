/**
 * DYNAMIC QUESTION GENERATOR
 * Generates context-aware questions based on chat history and timeline items
 */

export interface SuggestedQuestion {
  icon: string;
  text: string;
  color: string;
}

export interface TimelineItem {
  type: 'experience' | 'education';
  title: string;
  organization: string;
  date: string;
  location?: string;
  description?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Analyzes chat history to understand conversation context
 */
function analyzeChatHistory(): {
  discussedCompanies: Set<string>;
  discussedTopics: Set<string>;
  lastQuestionType: string | null;
  conversationDepth: number;
} {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    // Server-side rendering or localStorage not available
    return {
      discussedCompanies: new Set(),
      discussedTopics: new Set(),
      lastQuestionType: null,
      conversationDepth: 0,
    };
  }

  const CHAT_HISTORY_KEY = 'smart-portfolio-chat-history';
  
  try {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!savedHistory) {
      return {
        discussedCompanies: new Set(),
        discussedTopics: new Set(),
        lastQuestionType: null,
        conversationDepth: 0,
      };
    }

    const messages: ChatMessage[] = JSON.parse(savedHistory);
    const discussedCompanies = new Set<string>();
    const discussedTopics = new Set<string>();
    let lastQuestionType: string | null = null;

    // Company detection patterns
    const companyPatterns = [
      'aws', 'amazon', 'paycom', 'cloudwick', 'qubole', 
      'microland', 'ranchi mall', 'rice', 'bit mesra'
    ];

    // Topic detection patterns
    const topicPatterns = {
      projects: /\b(project|built|developed|implemented|created|designed)\b/i,
      impact: /\b(impact|result|improved|increased|reduced|achieved|metrics)\b/i,
      challenges: /\b(challenge|problem|difficult|solved|overcame|obstacle)\b/i,
      technologies: /\b(technology|tech|stack|tool|framework|language|python|java|aws)\b/i,
      teamwork: /\b(team|collaboration|worked with|leadership|managed)\b/i,
      learning: /\b(learn|studied|training|course|education)\b/i,
    };

    // Analyze recent messages (last 10)
    const recentMessages = messages.slice(-10);
    
    recentMessages.forEach((msg, idx) => {
      const content = msg.content.toLowerCase();
      
      // Detect companies
      companyPatterns.forEach(company => {
        if (content.includes(company)) {
          discussedCompanies.add(company);
        }
      });

      // Detect topics
      Object.entries(topicPatterns).forEach(([topic, pattern]) => {
        if (pattern.test(content)) {
          discussedTopics.add(topic);
        }
      });

      // Detect last question type (from last user message)
      if (msg.role === 'user' && idx === recentMessages.length - 1) {
        for (const [topic, pattern] of Object.entries(topicPatterns)) {
          if (pattern.test(content)) {
            lastQuestionType = topic;
            break;
          }
        }
      }
    });

    return {
      discussedCompanies,
      discussedTopics,
      lastQuestionType,
      conversationDepth: messages.length,
    };
  } catch (error) {
    console.error('Error analyzing chat history:', error);
    return {
      discussedCompanies: new Set(),
      discussedTopics: new Set(),
      lastQuestionType: null,
      conversationDepth: 0,
    };
  }
}

/**
 * Generates dynamic questions based on timeline item and conversation context
 */
export function generateDynamicQuestions(item: TimelineItem): SuggestedQuestion[] {
  const context = analyzeChatHistory();
  const org = item.organization.toLowerCase();
  
  // Check if this company has been discussed
  const alreadyDiscussed = Array.from(context.discussedCompanies).some(company => 
    org.includes(company) || company.includes(org.split(' ')[0])
  );

  // Generate questions based on conversation state
  if (item.type === 'experience') {
    return generateExperienceQuestions(item, context, alreadyDiscussed);
  } else {
    return generateEducationQuestions(item, context, alreadyDiscussed);
  }
}

/**
 * Generates dynamic questions for experience items
 */
function generateExperienceQuestions(
  item: TimelineItem,
  context: ReturnType<typeof analyzeChatHistory>,
  alreadyDiscussed: boolean
): SuggestedQuestion[] {
  const questions: SuggestedQuestion[] = [];
  const { discussedTopics, lastQuestionType, conversationDepth } = context;

  // Question bank organized by topic
  const questionBank = {
    overview: {
      icon: 'target',
      text: `Tell me about the key projects and achievements at ${item.organization}`,
      color: 'text-blue-600 dark:text-blue-400',
      priority: alreadyDiscussed ? 2 : 1,
    },
    deepDive: {
      icon: 'target',
      text: `Walk me through your day-to-day responsibilities as ${item.title} at ${item.organization}`,
      color: 'text-blue-600 dark:text-blue-400',
      priority: alreadyDiscussed ? 1 : 3,
    },
    impact: {
      icon: 'trending-up',
      text: `What was the biggest impact or measurable result during your time at ${item.organization}?`,
      color: 'text-green-600 dark:text-green-400',
      priority: discussedTopics.has('impact') ? 4 : 1,
    },
    metrics: {
      icon: 'trending-up',
      text: `Can you quantify the business impact of your work at ${item.organization}?`,
      color: 'text-green-600 dark:text-green-400',
      priority: discussedTopics.has('impact') ? 1 : 3,
    },
    challenges: {
      icon: 'lightbulb',
      text: `Describe a challenging problem you solved as ${item.title} at ${item.organization}`,
      color: 'text-purple-600 dark:text-purple-400',
      priority: discussedTopics.has('challenges') ? 4 : 1,
    },
    starStory: {
      icon: 'lightbulb',
      text: `Share a STAR story about overcoming a significant obstacle at ${item.organization}`,
      color: 'text-purple-600 dark:text-purple-400',
      priority: discussedTopics.has('challenges') ? 1 : 2,
    },
    technologies: {
      icon: 'message',
      text: `What technologies and skills did you use in your role at ${item.organization}?`,
      color: 'text-orange-600 dark:text-orange-400',
      priority: discussedTopics.has('technologies') ? 4 : 1,
    },
    techStack: {
      icon: 'message',
      text: `How did you choose the tech stack for your projects at ${item.organization}?`,
      color: 'text-orange-600 dark:text-orange-400',
      priority: discussedTopics.has('technologies') ? 1 : 3,
    },
    teamwork: {
      icon: 'message',
      text: `Tell me about the team structure and collaboration at ${item.organization}`,
      color: 'text-indigo-600 dark:text-indigo-400',
      priority: discussedTopics.has('teamwork') ? 4 : 2,
    },
    leadership: {
      icon: 'target',
      text: `Describe your leadership experience and mentoring at ${item.organization}`,
      color: 'text-blue-600 dark:text-blue-400',
      priority: discussedTopics.has('teamwork') ? 1 : 3,
    },
    projects: {
      icon: 'lightbulb',
      text: `What was your most innovative project at ${item.organization}?`,
      color: 'text-purple-600 dark:text-purple-400',
      priority: discussedTopics.has('projects') ? 4 : 1,
    },
    architecture: {
      icon: 'message',
      text: `Explain the system architecture you designed at ${item.organization}`,
      color: 'text-orange-600 dark:text-orange-400',
      priority: discussedTopics.has('projects') ? 1 : 2,
    },
    growth: {
      icon: 'trending-up',
      text: `What did you learn from your experience at ${item.organization}?`,
      color: 'text-green-600 dark:text-green-400',
      priority: discussedTopics.has('learning') ? 4 : 2,
    },
    transition: {
      icon: 'target',
      text: `How did your role at ${item.organization} prepare you for your next position?`,
      color: 'text-blue-600 dark:text-blue-400',
      priority: conversationDepth > 5 ? 1 : 3,
    },
  };

  // If company already discussed, prioritize follow-up questions
  if (alreadyDiscussed) {
    // Avoid repeating the same question type
    const availableQuestions = Object.entries(questionBank).filter(([key]) => {
      if (lastQuestionType === 'impact') return !['impact', 'metrics'].includes(key);
      if (lastQuestionType === 'challenges') return !['challenges', 'starStory'].includes(key);
      if (lastQuestionType === 'technologies') return !['technologies', 'techStack'].includes(key);
      if (lastQuestionType === 'teamwork') return !['teamwork', 'leadership'].includes(key);
      if (lastQuestionType === 'projects') return !['projects', 'architecture'].includes(key);
      return true;
    });

    // Sort by priority and select top 4
    const sortedQuestions = availableQuestions
      .sort((a, b) => a[1].priority - b[1].priority)
      .slice(0, 4);

    return sortedQuestions.map(([_, q]) => ({
      icon: q.icon,
      text: q.text,
      color: q.color,
    }));
  }

  // First time discussing this company - use priority-sorted questions
  const sortedQuestions = Object.values(questionBank)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);

  return sortedQuestions.map(q => ({
    icon: q.icon,
    text: q.text,
    color: q.color,
  }));
}

/**
 * Generates dynamic questions for education items
 */
function generateEducationQuestions(
  item: TimelineItem,
  context: ReturnType<typeof analyzeChatHistory>,
  alreadyDiscussed: boolean
): SuggestedQuestion[] {
  const { discussedTopics, conversationDepth } = context;

  const questionBank = {
    overview: {
      icon: 'lightbulb',
      text: `Tell me about your academic experience at ${item.organization}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      priority: alreadyDiscussed ? 3 : 1,
    },
    projects: {
      icon: 'target',
      text: `What projects or achievements stood out during ${item.title} at ${item.organization}?`,
      color: 'text-teal-600 dark:text-teal-400',
      priority: discussedTopics.has('projects') ? 4 : 1,
    },
    research: {
      icon: 'lightbulb',
      text: `Did you conduct any research or thesis work at ${item.organization}?`,
      color: 'text-emerald-600 dark:text-emerald-400',
      priority: discussedTopics.has('projects') ? 1 : 2,
    },
    preparation: {
      icon: 'trending-up',
      text: `How did ${item.title} from ${item.organization} prepare you for your career?`,
      color: 'text-indigo-600 dark:text-indigo-400',
      priority: conversationDepth > 3 ? 1 : 2,
    },
    skills: {
      icon: 'target',
      text: `What key technical skills did you develop at ${item.organization}?`,
      color: 'text-teal-600 dark:text-teal-400',
      priority: discussedTopics.has('technologies') ? 4 : 1,
    },
    coursework: {
      icon: 'message',
      text: `Which courses at ${item.organization} were most relevant to your career?`,
      color: 'text-blue-600 dark:text-blue-400',
      priority: discussedTopics.has('learning') ? 4 : 2,
    },
    extracurricular: {
      icon: 'lightbulb',
      text: `Tell me about your extracurricular activities and leadership at ${item.organization}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      priority: discussedTopics.has('teamwork') ? 1 : 3,
    },
  };

  // Sort by priority and select top 3 (education gets fewer questions)
  const sortedQuestions = Object.values(questionBank)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  return sortedQuestions.map(q => ({
    icon: q.icon,
    text: q.text,
    color: q.color,
  }));
}

/**
 * Clears chat history (for testing or reset)
 */
export function clearChatHistory(): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  const CHAT_HISTORY_KEY = 'smart-portfolio-chat-history';
  localStorage.removeItem(CHAT_HISTORY_KEY);
}