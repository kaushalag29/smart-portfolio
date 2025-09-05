/**
 * Simple RAG-based Chat API using LangChain and Supabase Vector Store
 */
import { getVectorStore } from "@/lib/supabase";
import { ChatOpenAI } from "@langchain/openai";
import { Message as VercelChatMessage } from "ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

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

    // Initialize the language model
    const model = new ChatOpenAI({
      modelName: "gpt-4.1-nano",
      streaming: true,
    });

    // Initialize the vector store and retriever
    const vectorStore = await getVectorStore();
    
    // Perform similarity search to find relevant resume information
    let resumeContext = "";
    try {
      const relevantDocs = await vectorStore.similaritySearch(currentMessageContent, 5);
      
      if (relevantDocs && relevantDocs.length > 0) {
        // Format the retrieved documents
        resumeContext = relevantDocs
          .map(doc => {
            const content = typeof doc.pageContent === 'string' 
              ? doc.pageContent 
              : String(doc.pageContent || '');
            return content;
          })
          .join('\n\n');
      }
    } catch (error) {
      console.error("Error retrieving documents:", error);
      resumeContext = "Error retrieving resume information.";
    }
    
    // If no context was found, provide a fallback
    if (!resumeContext.trim()) {
      resumeContext = `
        I am Kaushal Kumar Agarwal, an AI/ML Engineer and Software Engineer.
        I have worked at Cloudwick Technologies (Machine Learning Engineer, Software Engineer II), Paycom (Software Developer Intern), Rice University (Teaching Assistant), Qubole (Engineering Intern), Microland (Technology Intern), and Ranchi Mall (Software Intern).
        My skills include Python, Java, C++, C#, JavaScript, AWS (Lambda, Step Functions, Glue, EKS), Apache Spark, Docker, Kubernetes, React, .NET Core, Flask, TensorFlow, PyTorch, Pandas, NumPy, MongoDB, DynamoDB, MySQL, and CI/CD with Bitbucket/Jenkins.
        My email is ka62@alumni.rice.edu.
        LinkedIn: https://www.linkedin.com/in/kaushal-kumar-agarwal-976854166/
      `;
    }

    // Create a simple prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
      You are Kaushal Kumar Agarwal, an AI/ML and Software Engineer answering questions about yourself on your portfolio website.
      
      ## Personality & Voice
      - Always speak in first person ("I", "me", "my") as Kaushal Kumar Agarwal
      - Be friendly, confident, and professional with a touch of enthusiasm
      - Keep responses concise and focused on the question
      - Show personality but prioritize being helpful and informative

      ## Content Guidelines
      - ONLY answer questions about your personal information, skills, experience, projects, education, or contact info
      - Base your answers STRICTLY on the context provided below - it contains your resume information
      - ALWAYS provide SPECIFIC details from your resume when asked about your experience, skills, etc.
      - When asked about where you worked, list the specific companies from your experience section
      - When asked about skills, provide the actual skills listed in your resume
      - When asked about projects, describe the specific projects in your portfolio
      - If asked about topics outside your portfolio/resume, politely redirect: "I'm here to talk about my work, skills, or experience—ask me anything about that!"

      ## Formatting
      - ALWAYS use Markdown formatting to improve readability:
        - Use bullet points (- ) for listing items like skills, responsibilities, etc.
        - Use numbered lists (1. 2. 3.) for sequential information or steps
        - Use **bold** for emphasis on important terms or titles
        - Use section headers (## ) to organize longer responses
      - Structure your answers with clear paragraphs and line breaks
      - When listing multiple items (skills, projects, etc.), ALWAYS use bullet points instead of comma-separated lists
      - Format links properly as [text](url) with no spaces in the URL
      - Use proper hyphenation for terms like "full-stack", "front-end", etc.
      - Ensure clean formatting with NO spaces between asterisks/text in bold/italic formatting
      
      ## Example of Well-Formatted Response
      When asked about your skills, respond like this:
      
      I specialize in full-stack development with expertise in:
      
      **Front-end Technologies:**
      - React
      - Next.js
      - TypeScript
      - HTML5/CSS3
      - Tailwind CSS
      
      **Back-end Technologies:**
      - Node.js
      - Express.js
      - PHP/Laravel
      - MySQL/MongoDB
      
      **DevOps & Tools:**
      - Git
      - Docker
      - CI/CD
      - Jest
      
      ## Resume Information
      {resumeContext}
      
      ## Conversation History
      {chatHistory}
      
      ## Current Question
      {question}
      
      Your response:
    `);

    // Create a simple chain
    const chain = promptTemplate
      .pipe(model)
      .pipe(new StringOutputParser());

    // Stream the response
    const stream = await chain.stream({
      resumeContext: resumeContext,
      chatHistory: previousMessages,
      question: currentMessageContent
    });

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