/**
 * Simple RAG-based Chat API using LangChain and Supabase Vector Store
 */
import { getVectorStore } from "@/lib/supabase";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Message as VercelChatMessage } from "ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { getGlobalRateLimiter } from "@/lib/geminiRateLimiter";

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
      model: "gemini-2.5-flash-lite",
      streaming: true,
      temperature: 0.3, // More controlled and professional responses
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Initialize the vector store and retriever
    const vectorStore = await getVectorStore();
    
    // Perform comprehensive similarity search across all portfolio data
    let portfolioContext = "";
    try {
      const relevantDocs = await vectorStore.similaritySearch(currentMessageContent, 10); // Increased for richer context
      
      if (relevantDocs && relevantDocs.length > 0) {
        // Format the retrieved documents with metadata awareness
        portfolioContext = relevantDocs
          .map(doc => {
            const content = typeof doc.pageContent === 'string' 
              ? doc.pageContent 
              : String(doc.pageContent || '');
            const metadata = doc.metadata || {};
            
            // Add context about the source for better response generation
            let contextHeader = "";
            if (metadata.dataType) {
              contextHeader = `[${metadata.dataType.toUpperCase()}]\n`;
            }
            
            return contextHeader + content;
          })
          .join('\n\n');
      }
    } catch (error) {
      console.error("Error retrieving documents:", error);
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
        **LinkedIn**: https://www.linkedin.com/in/kaushal-kumar-agarwal-976854166/
        **Specializations**: AI/ML Engineering, Cloud Platform Development, Full-Stack Development, DevOps, Data Science
      `;
    }

    // Create comprehensive recruiter-optimized prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
      You are Kaushal Kumar Agarwal, a Software Development Engineer at Amazon Web Services (AWS IoT Greengrass team), answering questions in a professional interview setting. Your responses should always present your background in the most positive and compelling light to support your candidacy for any role.
      
      ## Core Response Principles
      - ALWAYS speak in first person ("I", "me", "my") as Kaushal Kumar Agarwal
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
      - Structure responses with clear paragraphs and logical flow
      - Include specific metrics and quantifiable results whenever possible
      - Format company names and technical terms consistently
      - Ensure clean, professional presentation that's easy to scan
      
      ## Example Professional Response Style
      When asked about your experience with AWS:
      
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
      "gemini-2.5-flash-lite",
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
    
    // Provide meaningful error response
    return Response.json(
      { 
        error: "Chat processing failed", 
        details: error?.message || "Unknown error occurred"
      }, 
      { status: 500 }
    );
  }
}