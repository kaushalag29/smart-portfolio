/**
 * Simple RAG-based Chat API using LangChain and Supabase Vector Store
 */
import { getVectorStore } from "@/lib/supabase";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Message as VercelChatMessage } from "ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { getGlobalRateLimiter } from "@/lib/geminiRateLimiter";
import { IntelligentQueryRouter } from "@/lib/intelligentQueryRouter";

/**
 * Generate graceful error response based on error type
 */
function getGracefulErrorResponse(error: any): { message: string; status: number } {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  // Rate limiting errors
  if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return {
      message: "I'm currently experiencing high demand. Please wait a moment and try again. Thank you for your patience!",
      status: 429
    };
  }
  
  // Service unavailable
  if (errorMessage.includes('503') || errorMessage.includes('unavailable')) {
    return {
      message: "I'm temporarily unavailable. Please try again in a few moments.",
      status: 503
    };
  }
  
  // Authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
    return {
      message: "There's an authentication issue. Please refresh the page and try again.",
      status: 401
    };
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      message: "That took longer than expected. Please try again.",
      status: 504
    };
  }
  
  // Generic error
  return {
    message: "I encountered an unexpected issue. Please try again, and if the problem continues, try refreshing the page.",
    status: 500
  };
}

/**
 * Main API handler for chat requests
 */
export async function POST(req: Request) {
  try {
    // Parse incoming request
    const body = await req.json();
    const messages = body.messages;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    // Get the current user message
    const currentMessageContent = messages[messages.length - 1].content;
    
    // Format previous messages for context
    const previousMessages = messages.slice(0, -1)
      .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // Initialize rate limiter
    const rateLimiter = getGlobalRateLimiter();
    
    // Initialize the language model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      streaming: true,
      temperature: 0.0, // More controlled and professional responses
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Initialize the vector store and retriever
    const vectorStore = await getVectorStore();
    
    // ============================================================
    // INTELLIGENT QUERY ANALYSIS
    // ============================================================
    
    // Analyze query to extract all entities and intent
    const queryAnalysis = IntelligentQueryRouter.analyzeQuery(currentMessageContent);
    
    // Create context-aware search queries
    let searchQueries = [currentMessageContent];
    
    // Include conversation context if available
    if (messages.length > 1) {
      const recentUserMessages = messages
        .slice(Math.max(0, messages.length - 5), -1)
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .slice(-2);
      
      if (recentUserMessages.length > 0) {
        const contextEnhanced = `${recentUserMessages.join(' ')} ${currentMessageContent}`;
        searchQueries.push(contextEnhanced);
      }
    }
    
    // Generate additional search queries based on analysis
    const additionalQueries = IntelligentQueryRouter.generateSearchQueries(
      currentMessageContent,
      queryAnalysis
    );
    searchQueries.push(...additionalQueries);
    searchQueries = [...new Set(searchQueries)]; // Deduplicate
    
    // ============================================================
    // MULTI-STRATEGY RETRIEVAL
    // ============================================================
    let portfolioContext = "";
    try {
      const allDocs: any[] = [];
      const seenContent = new Set<string>();
      
      // Execute each search strategy
      for (const [strategyIdx, strategy] of queryAnalysis.searchStrategies.entries()) {
        try {
          let strategyDocs: any[] = [];
          
          if (strategy.type === 'filtered' && Object.keys(strategy.filters).length > 0) {
            // Filtered search
            
            // Try with primary search query
            try {
              strategyDocs = await vectorStore.similaritySearch(
                searchQueries[0],
                strategy.k,
                strategy.filters
              );
            } catch (err) {
              // Fallback to semantic search if metadata filtering not supported
              strategyDocs = await vectorStore.similaritySearch(searchQueries[0], strategy.k);
              
              // Manual filtering in memory
              const filterKey = Object.keys(strategy.filters)[0];
              const filterValue = strategy.filters[filterKey];
              strategyDocs = strategyDocs.filter((doc: any) => {
                const metaValue = doc.metadata?.[filterKey];
                if (!metaValue) return false;
                if (filterKey === 'skills' || filterKey === 'type') {
                  return metaValue.toLowerCase().includes(filterValue.toLowerCase());
                }
                return metaValue === filterValue;
              });
            }
          } else {
            // Semantic search with all query variations
            for (const query of searchQueries.slice(0, 2)) { // Use top 2 queries
              const docs = await vectorStore.similaritySearch(query, Math.ceil(strategy.k / searchQueries.length));
              strategyDocs.push(...docs);
            }
          }
          
          // Apply boost and deduplicate
          strategyDocs.forEach(doc => {
            const contentHash = doc.pageContent.substring(0, 100);
            if (!seenContent.has(contentHash)) {
              seenContent.add(contentHash);
              doc._strategyBoost = strategy.boost;
              doc._strategy = strategy.type;
              allDocs.push(doc);
            }
          });
          
        } catch (err) {
          // Strategy failed, continue with other strategies
        }
      }
      
      if (allDocs.length > 0) {
        // Advanced re-ranking based on multiple factors
        allDocs.sort((a, b) => {
          const aBoost = a._strategyBoost || 1.0;
          const bBoost = b._strategyBoost || 1.0;
          const aMeta = a.metadata || {};
          const bMeta = b.metadata || {};
          
          // 1. Strategy boost
          if (aBoost !== bBoost) return bBoost - aBoost;
          
          // 2. Company match
          if (queryAnalysis.detectedEntities.companies.length > 0) {
            const targetCompany = queryAnalysis.detectedEntities.companies[0];
            const aCompanyMatch = aMeta.company === targetCompany;
            const bCompanyMatch = bMeta.company === targetCompany;
            if (aCompanyMatch && !bCompanyMatch) return -1;
            if (!aCompanyMatch && bCompanyMatch) return 1;
          }
          
          // 3. Type match based on intent
          const intent = queryAnalysis.queryIntent.primary;
          const typeMatchScore = (meta: any): number => {
            const type = meta.type || '';
            if (intent === 'behavioral' && (type === 'star_story' || type === 'journey_experience')) return 3;
            if (intent === 'project' && (type === 'project' || type === 'star_story')) return 3;
            if (intent === 'skill' && (type === 'skill_experience' || type === 'experience')) return 3;
            if (intent === 'experience' && (type === 'experience' || type === 'journey_experience')) return 3;
            return 1;
          };
          
          const aTypeScore = typeMatchScore(aMeta);
          const bTypeScore = typeMatchScore(bMeta);
          if (aTypeScore !== bTypeScore) return bTypeScore - aTypeScore;
          
          // 4. Skill match
          if (queryAnalysis.detectedEntities.skills.length > 0 && aMeta.skills && bMeta.skills) {
            const targetSkills = queryAnalysis.detectedEntities.skills.map((s: string) => s.toLowerCase());
            const aSkills = (aMeta.skills || '').toLowerCase();
            const bSkills = (bMeta.skills || '').toLowerCase();
            const aSkillMatches = targetSkills.filter((s: string) => aSkills.includes(s)).length;
            const bSkillMatches = targetSkills.filter((s: string) => bSkills.includes(s)).length;
            if (aSkillMatches !== bSkillMatches) return bSkillMatches - aSkillMatches;
          }
          
          return 0;
        });
        
        // Take top results based on query needs
        const topK = queryAnalysis.queryIntent.needsMultipleExamples ? 15 : 10;
        const topDocs = allDocs.slice(0, topK);
        
        // Format documents for LLM context
        portfolioContext = topDocs
          .map(doc => {
            const content = typeof doc.pageContent === 'string' 
              ? doc.pageContent 
              : String(doc.pageContent || '');
            const metadata = doc.metadata || {};
            
            // Rich metadata header
            let contextHeader = "";
            if (metadata.type && metadata.company) {
              contextHeader = `[${metadata.type.toUpperCase()} @ ${metadata.company}]\n`;
            } else if (metadata.type && metadata.skill) {
              contextHeader = `[${metadata.skill.toUpperCase()} EXPERIENCE]\n`;
            } else if (metadata.type) {
              contextHeader = `[${metadata.type.toUpperCase()}]\n`;
            }
            
            return contextHeader + content;
          })
          .join('\n\n---\n\n');
      }
    } catch (error) {
      console.error("❌ [Error] Failed to retrieve documents:", error);
      portfolioContext = "Portfolio data temporarily unavailable.";
    }
    
    // If no context was found, provide comprehensive fallback
    if (!portfolioContext.trim()) {
      portfolioContext = `
        I am Kaushal Kumar Agarwal, a Software Development Engineer at Amazon Web Services (AWS IoT Greengrass team) with comprehensive experience in AI/ML, cloud platforms, and full-stack development.
        
        **Current Role**: Software Development Engineer at AWS IoT Greengrass (Oct 2025 - Present)
        **Previous Experience**: Machine Learning Engineer at Cloudwick Technologies, Software Developer Intern at Paycom, Software Engineer II at Cloudwick Technologies, Engineering Intern at Qubole, Technology Intern at Microland, Software Intern at Ranchi Mall
        **Education**: Master of Computer Science (3.95/4.0 GPA) from Rice University, B.E. in Computer Science from BIT Mesra
        **Technical Expertise**: Python, Java, C++, C#, JavaScript, AWS (comprehensive cloud platform expertise), Apache Spark, Docker, Kubernetes, React, .NET Core, Flask, TensorFlow, PyTorch, LLMs, AI/ML frameworks
        **Contact**: ka62@alumni.rice.edu
        **Professional Links**: [LinkedIn](https://www.linkedin.com/in/kaushal-kumar-agarwal-976854166/), [GitHub](https://github.com/kaushalkumar94), [LeetCode](https://leetcode.com/kaushalkumar94/)
        **Specializations**: AI/ML Engineering, Cloud Platform Development, Full-Stack Development, DevOps, Data Science
      `;
    }

    // Create comprehensive recruiter-optimized prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
      You are Kaushal Kumar Agarwal, a Software Development Engineer at Amazon Web Services (AWS IoT Greengrass team), answering questions in a professional interview setting. Your responses should always present your background in the most positive and compelling light to support your candidacy for any role.
      
      ## Core Response Principles
      - ALWAYS speak in first person ("I", "me", "my") as Kaushal Kumar Agarwal
      - When users refer to "he", "his", or "him", understand they are asking about YOU and respond in first person
      - Maintain a confident, professional, and enthusiastic tone suitable for recruiter conversations
      - Every response should showcase your strengths, achievements, and positive qualities
      - NEVER mention any weaknesses, failures, or negative aspects
      - Frame all experiences as learning opportunities and growth achievements
      - Focus on impact, results, and value delivered in every story

      ## Content Strategy
      - Base ALL answers on the comprehensive context provided below - it contains your detailed professional journey
      - When discussing experiences, use the STAR method (Situation, Task, Action, Result) naturally
      - Emphasize leadership, problem-solving, innovation, and technical excellence
      - Highlight measurable impacts (performance improvements, cost savings, team success)
      - Connect past experiences to future value you can bring to new roles
      - Show continuous learning and adaptation to new technologies

      ## Professional Positioning
      - Position yourself as a technical leader with strong business acumen
      - Emphasize your ability to work across technical and non-technical stakeholders
      - Highlight your experience scaling from startup to enterprise environments
      - Showcase your international experience and cultural adaptability
      - Demonstrate your passion for emerging technologies, especially AI/ML and cloud platforms

      ## Response Handling
      - Pay attention to the CONVERSATION HISTORY below - if the user is asking a follow-up question, make sure your answer relates to the previous topic
      - If a question references "his personal projects", "his work", etc., understand they are asking about YOUR projects and experiences
      - If asked about specific technical challenges, focus on your problem-solving approach and successful outcomes
      - When discussing career transitions, frame them as strategic growth decisions
      - For behavioral questions, draw from your comprehensive experience database
      - If information isn't available in your context, respond professionally: "That specific information isn't readily available at the moment. Please connect with Kaushal directly to discuss that in more detail. Meanwhile, let me share what I can tell you about [related relevant experience]."
      - NEVER hallucinate or make up information not present in your context

      ## Formatting Excellence
      - Use professional Markdown formatting consistently:
        - **Bold** for company names, roles, and key achievements
        - Bullet points (-) for listing accomplishments, skills, and responsibilities
        - Numbered lists (1. 2. 3.) for process steps or sequential information
        - Section headers (##) for organizing comprehensive responses
        - **[Link Text](URL)** for ALL URLs - NEVER use plain text URLs
      - **CRITICAL**: When sharing ANY links (LinkedIn, GitHub, Portfolio, Blog, etc.), ALWAYS use proper Markdown link format
        - ✅ CORRECT: "Connect with me on [LinkedIn](https://www.linkedin.com/in/kaushal-kumar-agarwal-976854166/)"
        - ✅ CORRECT: "Check out my [GitHub profile](https://github.com/kaushalkumar94)"
        - ❌ WRONG: "LinkedIn: https://www.linkedin.com/in/..."
        - ❌ WRONG: "LinkedIn Profile: https://..."
      - Structure responses with clear paragraphs and logical flow
      - Include specific metrics and quantifiable results whenever possible
      - Format company names and technical terms consistently
      - Ensure clean, professional presentation that's easy to scan
      
      ## Example Professional Response Style
      
      **Example 1 - When asked about AWS experience:**
      
      I have extensive hands-on experience with AWS services across multiple professional roles:

      **Current Role at AWS IoT Greengrass:**
      - Contributing to edge computing and IoT platform solutions at global scale
      - Leveraging comprehensive AI/ML expertise for next-generation edge computing capabilities

      **Previous AWS Expertise (Cloudwick Technologies):**
      - **Serverless Architecture**: Designed and implemented production systems using Lambda, Step Functions, DynamoDB, SQS, SES
      - **Data Processing**: Built scalable data pipelines using AWS Glue, S3 lifecycle management, and CloudWatch Events
      - **AI/ML Platforms**: Developed and productionized ML solutions using Bedrock, SageMaker, and OpenSearch
      - **DevOps Excellence**: Achieved 20% faster release cycles through optimized CI/CD with CloudFormation and Systems Manager

      **Professional Certifications:**
      - AWS Certified Solutions Architect Associate
      - AWS Certified Developer Associate  
      - AWS Certified SysOps Administrator Associate
      - AWS Certified AI Practitioner
      - AWS Certified Machine Learning Associate

      This comprehensive AWS experience enables me to architect, develop, and scale cloud-native solutions effectively.
      
      **Example 2 - When asked about LinkedIn or contact info:**
      
      I'd be happy to connect! You can find me on [LinkedIn](https://www.linkedin.com/in/kaushal-kumar-agarwal-976854166/) where I regularly share insights about AI/ML and cloud technologies.
      
      You can also check out my work on [GitHub](https://github.com/kaushalkumar94) where I showcase various projects in machine learning, cloud solutions, and full-stack development.
      
      Feel free to reach out via email at ka62@alumni.rice.edu for any opportunities or collaborations!
      
      ## Professional Context Database
      {portfolioContext}
      
      ## Conversation History
      {chatHistory}
      
      ## Current Question
      {question}
      
      Your professional response (always positive, achievement-focused, and recruiter-friendly):
    `);

    // Create the optimized chain
    const chain = promptTemplate
      .pipe(model)
      .pipe(new StringOutputParser());

    // Stream the professional response with rate limiting
    // Note: We wrap the streaming call to ensure rate limiting
    const stream = await rateLimiter.execute(
      "gemini-2.5-flash",
      async () => {
        return await chain.stream({
      portfolioContext: portfolioContext,
      chatHistory: previousMessages,
      question: currentMessageContent
    });
      }
    );

    // Create a text encoder for the stream
    const encoder = new TextEncoder();
    
    // Create a readable stream
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Ensure chunk is a string
            const text = typeof chunk === 'string' ? chunk : String(chunk || '');
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          console.error("Error processing stream:", error);
          controller.error(error);
        }
      },
    });

    // Return the stream as a response
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    
    // Get graceful error response
    const { message, status } = getGracefulErrorResponse(error);
    
    return Response.json(
      { 
        error: message,
        message: message // For compatibility with different error handling patterns
      }, 
      { status }
    );
  }
}