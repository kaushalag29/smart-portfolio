# Smart Portfolio with AI Integration

This project is a modern portfolio website built with Next.js 15, featuring AI-powered components including a chatbot, tech stack validation, and interactive visualizations.

## Key Features

- **AI-powered Chatbot**: Interactive portfolio exploration using LangChain and Google Gemini AI, with vector search capabilities through Supabase pgvector
- **Tech Stack Architecture Visualization**: Interactive drag-and-drop interface to design and validate technology stacks with AI feedback
- **GitHub Integration**: Dynamic GitHub statistics, featured projects, and contribution graphs
- **Responsive Design**: Fully responsive UI with dark/light mode support using Tailwind CSS and NextUI components
- **Blog System**: Markdown-based blog with reading time estimation and syntax highlighting
- **Performance Optimized**: Server components, static generation, and efficient caching strategies

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS, NextUI components, Framer Motion
- **Database**: Supabase with pgvector for vector embeddings
- **AI/ML**: 
  - LangChain for chat functionality
  - Google Gemini AI for embeddings and chat completions
  - ReactFlow for tech stack visualization
- **GitHub API**: Octokit for repository and contribution data
- **UI Components**: 
  - React Icons
  - Lucide React
  - Recharts for data visualization
- **Content**: 
  - React Markdown
  - Gray Matter for frontmatter parsing
  - React Syntax Highlighter

## Features Summary

1. **Home Page**: Featuring about section, skills, timeline, and featured projects
2. **Tech Stack Architect**: Interactive tool for designing and validating technology stacks with AI feedback
3. **Blog System**: Markdown-based blog with filtering capabilities
4. **AI Chatbot**: Conversational interface for exploring the portfolio
5. **GitHub Integration**: Dynamic display of repositories and statistics

## Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- Git

## Installation Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/medevs/smart-portfolio.git
   cd smart-portfolio
   ```
2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Google AI API Key for Gemini models
   # Get your API key from: https://makersuite.google.com/app/apikey
   GOOGLE_API_KEY=your_google_api_key

   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # GitHub
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token

   # Optional: Add any other API keys needed for additional features
   ```
4. **Database Setup**
   Run the following SQL in your Supabase SQL editor to set up vector search for Google Gemini embeddings:
   ```sql
   -- Enable the pgvector extension
   create extension if not exists vector;

   -- Create documents table for vector storage
   -- Note: Google Gemini gemini-embedding-001 uses 3072 dimensions by default
   create table if not exists documents (
     id bigserial primary key,
     content text,
     metadata jsonb,
     embedding vector(1536)
   );

   -- Create the matching function
   create or replace function match_documents(
     query_embedding vector(1536),
     filter jsonb default '{}'::jsonb,
     match_count int default 10
   ) returns table (
     id bigint,
     content text,
     metadata jsonb,
     similarity float
   )
   language plpgsql
   as $$
   begin
     return query
     select
       id,
       content,
       metadata,
       1 - (documents.embedding <=> query_embedding) as similarity
     from documents
     where metadata @> filter
     order by documents.embedding <=> query_embedding
     limit match_count;
   end;
   $$;

   -- Create index for better performance
   -- Note: ivfflat index has 2000 dimension limit, so we use HNSW
   CREATE INDEX CONCURRENTLY documents_embedding_hnsw_idx 
   ON documents USING hnsw (embedding vector_cosine_ops);
   ```
   
   **Important: Index Limitations**
   - Google Gemini uses **3072 dimensions** by default
   - pgvector's `ivfflat` index has a **2000 dimension limit**  
   - **Solution**: Use `HNSW` index which supports higher dimensions
   - If HNSW is not available, the table will work without index (slower for large datasets)
   
   **If you're migrating from OpenAI embeddings**, you'll need to drop and recreate the table:
   ```sql
   -- Drop existing table and function (if migrating from OpenAI)
   drop function if exists match_documents;
   drop table if exists documents;
   
   -- Then run the above SQL to create the new table with correct dimensions
   ```

5. **Generate Embeddings**
   After setting up the database, generate the embeddings from your portfolio data:
   ```bash
   npm run generate
   ```
   This will process your resume data and create vector embeddings using Google Gemini.

6. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:3000`
7. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## Project Structure

For a detailed breakdown of the project’s folders and files, see [Project-Structure.md](./Project-Structure.md).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.