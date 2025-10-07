import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEmbeddingsCollection, getVectorStore } from "../src/lib/supabase";
import fs from "fs";

/**
 * PRODUCTION-GRADE INTELLIGENT INDEXING SYSTEM
 * 
 * Design Philosophy: Think like a 20-year recruiter/hiring manager
 * 
 * What recruiters ask:
 * 1. Company-specific: "Tell me about your work at X"
 * 2. Project-specific: "Describe the Y project"
 * 3. Skill-based: "How did you use Python/AWS/React?"
 * 4. Behavioral: "Tell me about a time you showed leadership"
 * 5. Technical depth: "Explain your ML architecture"
 * 6. Impact-focused: "What was the business impact?"
 * 7. Timeline-based: "What did you do in 2023?"
 * 8. Comparison: "How does X compare to Y?"
 * 9. Problem-solving: "How did you handle challenges?"
 * 10. Learning: "How do you stay current?"
 * 
 * Solution: Multi-faceted indexing with rich metadata
 */

// ============================================================
// ENTITY EXTRACTION & METADATA ENRICHMENT
// ============================================================

interface ExtractedEntities {
  skills: string[];
  tools: string[];
  concepts: string[];
  metrics: string[];
  timeIndicators: string[];
}

/**
 * Extract technical skills and tools from text
 */
function extractTechnicalEntities(text: string): ExtractedEntities {
  const textLower = text.toLowerCase();
  
  // Comprehensive skill/tool dictionary
  const skillPatterns = {
    languages: ['python', 'java', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'scala', 'go', 'rust', 'ruby'],
    mlFrameworks: ['tensorflow', 'pytorch', 'scikit-learn', 'keras', 'xgboost', 'lightgbm'],
    webFrameworks: ['react', 'angular', 'vue', 'next\\.?js', 'express', 'flask', 'django', 'spring boot', '\\.net', 'asp\\.net'],
    cloudPlatforms: ['aws', 'azure', 'gcp', 'google cloud', 'amazon web services'],
    awsServices: ['lambda', 's3', 'ec2', 'dynamodb', 'sagemaker', 'bedrock', 'glue', 'step functions', 'cloudformation', 'ecs', 'eks', 'rds', 'opensearch', 'cloudwatch', 'iam'],
    databases: ['mysql', 'postgresql', 'mongodb', 'dynamodb', 'redis', 'cassandra', 'neo4j', 'neptune', 'elasticsearch'],
    dataEngineering: ['spark', 'hadoop', 'kafka', 'airflow', 'flink', 'beam'],
    devops: ['docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform', 'ansible'],
    aiml: ['llm', 'gpt', 'bert', 'transformer', 'rag', 'embedding', 'fine-tuning', 'neural network', 'deep learning', 'machine learning', 'nlp', 'computer vision', 'reinforcement learning'],
    testing: ['pytest', 'junit', 'jest', 'selenium', 'cypress'],
    monitoring: ['prometheus', 'grafana', 'datadog', 'new relic'],
  };
  
  const entities: ExtractedEntities = {
    skills: [],
    tools: [],
    concepts: [],
    metrics: [],
    timeIndicators: []
  };
  
  // Extract skills
  Object.values(skillPatterns).flat().forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    if (regex.test(text)) {
      entities.skills.push(pattern.replace(/\\\.?/g, ''));
    }
  });
  
  // Extract metrics (numbers with %, x, or units)
  const metricRegex = /(\d+(?:\.\d+)?)\s*(%|x|times|ms|seconds|GB|TB|MB|requests|users|developers|repositories|faster|improvement|increase|decrease|boost|reduction)/gi;
  const metrics = text.match(metricRegex);
  if (metrics) {
    entities.metrics = metrics.map(m => m.trim());
  }
  
  // Extract time indicators
  const timeRegex = /\b(20\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\b/gi;
  const times = text.match(timeRegex);
  if (times) {
    entities.timeIndicators = [...new Set(times.map(t => t.trim()))];
  }
  
  // Deduplicate
  entities.skills = [...new Set(entities.skills)];
  entities.tools = [...new Set(entities.tools)];
  entities.concepts = [...new Set(entities.concepts)];
  entities.metrics = [...new Set(entities.metrics)];
  
  return entities;
}

/**
 * Extract behavioral tags from STAR-formatted content
 */
function extractBehavioralTags(content: any): string[] {
  const tags = new Set<string>();
  
  // Predefined behavioral competencies
  const behavioralKeywords: { [key: string]: string[] } = {
    'leadership': ['led', 'managed', 'mentored', 'guided', 'coordinated', 'directed', 'supervised'],
    'problem_solving': ['solved', 'fixed', 'debugged', 'optimized', 'improved', 'enhanced', 'resolved'],
    'innovation': ['created', 'developed', 'designed', 'invented', 'pioneered', 'architected', 'built'],
    'collaboration': ['collaborated', 'worked with', 'partnered', 'coordinated', 'team', 'cross-functional'],
    'ownership': ['owned', 'responsible for', 'delivered', 'drove', 'initiated', 'took initiative'],
    'communication': ['presented', 'documented', 'explained', 'communicated', 'reported', 'shared'],
    'learning': ['learned', 'studied', 'researched', 'explored', 'experimented', 'investigated'],
    'impact': ['increased', 'decreased', 'improved', 'reduced', 'boosted', 'achieved', 'delivered'],
    'scalability': ['scaled', 'scalable', 'distributed', 'high-throughput', 'performance'],
    'quality': ['tested', 'validated', 'quality', 'reliable', 'robust', 'production-grade'],
  };
  
  const text = JSON.stringify(content).toLowerCase();
  
  for (const [tag, keywords] of Object.entries(behavioralKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.add(tag);
    }
  }
  
  // Also check if explicitly provided
  if (content.behavioralTags && Array.isArray(content.behavioralTags)) {
    content.behavioralTags.forEach((tag: string) => tags.add(tag.toLowerCase()));
  }
  
  return Array.from(tags);
}

/**
 * Create search-optimized text with keyword boosting
 */
function createSearchText(parts: string[]): string {
  // Repeat important terms for better matching
  return parts
    .map(p => p.toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
// MULTI-FACETED DOCUMENT CREATORS
// ============================================================

/**
 * Create comprehensive experience document with all metadata
 */
function createExperienceDocument(exp: any, index: number): Document[] {
  const docs: Document[] = [];
  const entities = extractTechnicalEntities(exp.description);
  const behavioral = extractBehavioralTags(exp);
  
  // Main experience document
  let mainContent = `# ${exp.company} - ${exp.position}\n\n`;
  mainContent += `**Position**: ${exp.position}\n`;
  mainContent += `**Company**: ${exp.company}\n`;
  mainContent += `**Duration**: ${exp.startDate} to ${exp.endDate}\n`;
  mainContent += `**Location**: ${exp.location || 'N/A'}\n\n`;
  mainContent += `## Role Overview & Key Achievements\n\n`;
  mainContent += `${exp.description}\n\n`;
  
  if (entities.skills.length > 0) {
    mainContent += `**Technologies Used**: ${entities.skills.join(', ')}\n\n`;
  }
  
  if (entities.metrics.length > 0) {
    mainContent += `**Measurable Impact**: ${entities.metrics.join(', ')}\n\n`;
  }
  
  // Rich metadata
  docs.push(new Document({
    pageContent: mainContent,
    metadata: {
      type: 'experience',
      company: exp.company,
      position: exp.position,
      location: exp.location || '',
      startDate: exp.startDate,
      endDate: exp.endDate,
      skills: entities.skills.join(','),
      metrics: entities.metrics.join(','),
      behavioral: behavioral.join(','),
      timeframe: `${exp.startDate}_${exp.endDate}`,
      source: 'resume',
      section: 'experience',
      index: index,
      // Search-optimized text
      searchText: createSearchText([
        exp.company,
        exp.position,
        exp.description,
        exp.location || '',
        ...entities.skills,
        ...behavioral
      ])
    }
  }));
  
  // BONUS: Create skill-focused sub-documents for each major skill
  // This helps when recruiter asks "How did you use AWS?" or "Python experience?"
  const majorSkills = entities.skills.filter(s => 
    ['python', 'java', 'aws', 'react', 'machine learning', 'spark'].some(major => 
      s.toLowerCase().includes(major)
    )
  );
  
  majorSkills.forEach(skill => {
    const skillContent = `# ${skill.toUpperCase()} Experience at ${exp.company}\n\n`;
    let skillDoc = skillContent;
    skillDoc += `**Position**: ${exp.position}\n`;
    skillDoc += `**Company**: ${exp.company}\n`;
    skillDoc += `**Duration**: ${exp.startDate} to ${exp.endDate}\n\n`;
    skillDoc += `## How ${skill} Was Used:\n\n`;
    skillDoc += `${exp.description}\n\n`;
    
    docs.push(new Document({
      pageContent: skillDoc,
      metadata: {
        type: 'skill_experience',
        skill: skill,
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate,
        endDate: exp.endDate,
        source: 'resume',
        section: 'experience',
        searchText: createSearchText([skill, exp.company, exp.position, exp.description])
      }
    }));
  });
  
  return docs;
}

/**
 * Create comprehensive project document
 */
function createProjectDocument(proj: any, index: number): Document[] {
  const docs: Document[] = [];
  const entities = extractTechnicalEntities(`${proj.name} ${proj.description} ${proj.technologies.join(' ')}`);
  
  // Main project document
  let mainContent = `# Project: ${proj.name}\n\n`;
  mainContent += `**Project Name**: ${proj.name}\n\n`;
  mainContent += `## Description\n\n`;
  mainContent += `${proj.description}\n\n`;
  mainContent += `## Technologies & Skills\n\n`;
  mainContent += `${proj.technologies.join(', ')}\n\n`;
  
  if (entities.metrics.length > 0) {
    mainContent += `**Key Metrics**: ${entities.metrics.join(', ')}\n\n`;
  }
  
  mainContent += `**Project Link**: ${proj.link}\n\n`;
  
  docs.push(new Document({
    pageContent: mainContent,
    metadata: {
      type: 'project',
      projectName: proj.name,
      technologies: proj.technologies.join(','),
      skills: entities.skills.join(','),
      metrics: entities.metrics.join(','),
      source: 'resume',
      section: 'projects',
      index: index,
      searchText: createSearchText([
        proj.name,
        proj.description,
        ...proj.technologies,
        ...entities.skills
      ])
    }
  }));
  
  return docs;
}

/**
 * Create journey-based STAR documents (detailed behavioral stories)
 */
function createJourneyDocuments(exp: any): Document[] {
  const docs: Document[] = [];
  
  // Main company journey
  let mainContent = `# ${exp.company} - Detailed Professional Journey\n\n`;
  mainContent += `**Position**: ${exp.position}\n`;
  mainContent += `**Period**: ${exp.period}\n`;
  mainContent += `**Location**: ${exp.location}\n\n`;
  
  if (exp.joinStory) {
    mainContent += `## How I Joined ${exp.company}\n\n`;
    mainContent += `${exp.joinStory.howIJoined || ''}\n\n`;
    mainContent += `**Initial Expectations**: ${exp.joinStory.initialExpectations || ''}\n\n`;
    mainContent += `**First Day Experience**: ${exp.joinStory.firstDayExperience || ''}\n\n`;
  }
  
  if (exp.growthAtCompany) {
    mainContent += `## Professional Growth & Development\n\n`;
    mainContent += `${exp.growthAtCompany}\n\n`;
  }
  
  if (exp.relationships) {
    mainContent += `## Team Dynamics & Collaboration\n\n`;
    mainContent += `**Team Collaboration**: ${exp.relationships.teamDynamics || ''}\n\n`;
    mainContent += `**Mentorship**: ${exp.relationships.mentorship || ''}\n\n`;
    mainContent += `**Conflict Resolution**: ${exp.relationships.conflictResolution || ''}\n\n`;
  }
  
  if (exp.departureReason) {
    mainContent += `## Career Progression Decision\n\n`;
    mainContent += `${exp.departureReason}\n\n`;
  }
  
  const behavioral = extractBehavioralTags(exp);
  const entities = extractTechnicalEntities(JSON.stringify(exp));
  
  docs.push(new Document({
    pageContent: mainContent,
    metadata: {
      type: 'journey_experience',
      company: exp.company,
      position: exp.position,
      period: exp.period,
      behavioral: behavioral.join(','),
      skills: entities.skills.join(','),
      source: 'journey',
      section: 'detailedExperiences',
      searchText: createSearchText([
        exp.company,
        exp.position,
        JSON.stringify(exp.joinStory || ''),
        exp.growthAtCompany || '',
        JSON.stringify(exp.relationships || '')
      ])
    }
  }));
  
  // Individual STAR project documents
  if (exp.keyProjects && exp.keyProjects.length > 0) {
    exp.keyProjects.forEach((project: any, idx: number) => {
      let starContent = `# BEHAVIORAL STORY: ${project.projectName} at ${exp.company}\n\n`;
      starContent += `**Company**: ${exp.company}\n`;
      starContent += `**Position**: ${exp.position}\n`;
      starContent += `**Project**: ${project.projectName}\n\n`;
      starContent += `## Situation (Context)\n\n`;
      starContent += `${project.situation || 'Not specified'}\n\n`;
      starContent += `## Task (Objective)\n\n`;
      starContent += `${project.task || 'Not specified'}\n\n`;
      starContent += `## Action (What I Did)\n\n`;
      starContent += `${project.action || 'Not specified'}\n\n`;
      starContent += `## Result (Impact)\n\n`;
      starContent += `${project.result || 'Not specified'}\n\n`;
      
      if (project.behavioralTags && project.behavioralTags.length > 0) {
        starContent += `**Competencies Demonstrated**: ${project.behavioralTags.join(', ')}\n\n`;
      }
      
      const projBehavioral = extractBehavioralTags(project);
      const projEntities = extractTechnicalEntities(JSON.stringify(project));
      
      docs.push(new Document({
        pageContent: starContent,
        metadata: {
          type: 'star_story',
          company: exp.company,
          position: exp.position,
          projectName: project.projectName,
          behavioral: projBehavioral.join(','),
          skills: projEntities.skills.join(','),
          metrics: projEntities.metrics.join(','),
          source: 'journey',
          section: 'starStories',
          searchText: createSearchText([
            exp.company,
            project.projectName,
            project.situation || '',
            project.task || '',
            project.action || '',
            project.result || '',
            ...projBehavioral,
            ...projEntities.skills
          ])
        }
      }));
    });
  }
  
  return docs;
}

/**
 * Create certification documents
 */
function createCertificationDocument(cert: any, index: number): Document {
  let content = `# Certification: ${cert.name}\n\n`;
  content += `**Certification**: ${cert.name}\n`;
  content += `**Date Earned**: ${cert.date}\n\n`;
  content += `## Description & Skills Validated\n\n`;
  content += `${cert.description}\n\n`;
  
  const entities = extractTechnicalEntities(`${cert.name} ${cert.description}`);
  
  return new Document({
    pageContent: content,
    metadata: {
      type: 'certification',
      certificationName: cert.name,
      date: cert.date,
      skills: entities.skills.join(','),
      source: 'resume',
      section: 'certifications',
      index: index,
      searchText: createSearchText([cert.name, cert.description])
    }
  });
}

/**
 * Create comprehensive skills document with cross-references
 */
function createSkillsDocument(skills: string[], experiences: any[]): Document[] {
  const docs: Document[] = [];
  
  // Main skills overview
  let mainContent = `# Technical Skills & Expertise Profile\n\n`;
  mainContent += `**All Technical Skills**: ${skills.join(', ')}\n\n`;
  mainContent += `## Skill Categories\n\n`;
  
  const skillCategories: { [key: string]: string[] } = {
    'Programming Languages': skills.filter(s => 
      ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'scala', 'go'].some(lang => 
        s.toLowerCase().includes(lang)
      )
    ),
    'Cloud & AWS': skills.filter(s => 
      ['aws', 'cloud', 'lambda', 's3', 'dynamodb', 'sagemaker'].some(cloud => 
        s.toLowerCase().includes(cloud)
      )
    ),
    'AI/ML & Data Science': skills.filter(s => 
      ['tensorflow', 'pytorch', 'machine learning', 'deep learning', 'llm', 'ml'].some(ml => 
        s.toLowerCase().includes(ml)
      )
    ),
    'Web Development': skills.filter(s => 
      ['react', 'node', 'html', 'css', 'javascript', 'next'].some(web => 
        s.toLowerCase().includes(web)
      )
    ),
    'Data Engineering': skills.filter(s => 
      ['spark', 'hadoop', 'kafka', 'airflow'].some(de => 
        s.toLowerCase().includes(de)
      )
    ),
    'DevOps & Infrastructure': skills.filter(s => 
      ['docker', 'kubernetes', 'jenkins', 'terraform'].some(devops => 
        s.toLowerCase().includes(devops)
      )
    ),
  };
  
  Object.entries(skillCategories).forEach(([category, categorySkills]) => {
    if (categorySkills.length > 0) {
      mainContent += `### ${category}\n`;
      mainContent += `${categorySkills.join(', ')}\n\n`;
    }
  });
  
  docs.push(new Document({
    pageContent: mainContent,
    metadata: {
      type: 'skills_overview',
      allSkills: skills.join(','),
      source: 'resume',
      section: 'skills',
      searchText: createSearchText(skills)
    }
  }));
  
  return docs;
}

/**
 * Create personal info document
 */
function createPersonalInfoDocument(info: any): Document {
  let content = `# Kaushal Kumar Agarwal - Professional Profile\n\n`;
  content += `**Full Name**: ${info.name}\n`;
  content += `**Current Title**: ${info.title}\n`;
  content += `**Email**: ${info.email}\n`;
  content += `**Location**: ${info.location}\n`;
  content += `**GitHub**: ${info.github}\n`;
  content += `**LinkedIn**: ${info.linkedin}\n\n`;
  content += `## Professional Summary\n\n`;
  content += `${info.summary}\n\n`;
  
  return new Document({
    pageContent: content,
    metadata: {
      type: 'personal_info',
      name: info.name,
      title: info.title,
      email: info.email,
      location: info.location,
      source: 'resume',
      section: 'personalInfo',
      searchText: createSearchText([info.name, info.title, info.summary, info.location])
    }
  });
}

/**
 * Create education documents
 */
function createEducationDocument(edu: any, index: number): Document {
  let content = `# ${edu.institution}\n\n`;
  content += `**Degree**: ${edu.degree}\n`;
  content += `**Institution**: ${edu.institution}\n`;
  content += `**Duration**: ${edu.startDate} to ${edu.endDate}\n`;
  content += `**Location**: ${edu.location || 'N/A'}\n\n`;
  content += `## Academic Details & Achievements\n\n`;
  content += `${edu.description}\n\n`;
  
  const entities = extractTechnicalEntities(edu.description);
  
  return new Document({
    pageContent: content,
    metadata: {
      type: 'education',
      institution: edu.institution,
      degree: edu.degree,
      location: edu.location || '',
      startDate: edu.startDate,
      endDate: edu.endDate,
      skills: entities.skills.join(','),
      source: 'resume',
      section: 'education',
      index: index,
      searchText: createSearchText([edu.institution, edu.degree, edu.description])
    }
  });
}

// ============================================================
// MAIN PRODUCTION INDEXING FUNCTION
// ============================================================

async function generateProductionEmbeddings() {
  try {
    console.log("\n" + "=".repeat(100));
    console.log("🚀 PRODUCTION-GRADE INTELLIGENT INDEXING SYSTEM");
    console.log("   Designed for comprehensive recruiter Q&A");
    console.log("=".repeat(100) + "\n");
    
    const vectorStore = await getVectorStore();
    
    // Clear existing documents
    console.log("🗑️  Clearing existing documents...");
    const { error } = await (await getEmbeddingsCollection()).delete().neq('id', 0);
    if (error) {
      console.error('❌ Error clearing documents:', error);
      return;
    }
    console.log("✅ Existing documents cleared\n");

    const documents: Document[] = [];

    // ============================================================
    // LOAD & INDEX RESUME DATA
    // ============================================================
    console.log("📄 Loading resume data...");
    const resumeDataPath = "src/data/resumeData.json";
    const resumeRawData = fs.readFileSync(resumeDataPath, "utf-8");
    const resumeData = JSON.parse(resumeRawData);
    
    let resumeCount = 0;
    
    // 1. Personal Info
    if (resumeData.personalInfo) {
      documents.push(createPersonalInfoDocument(resumeData.personalInfo));
      resumeCount++;
      console.log("   ✓ Personal profile indexed");
    }
    
    // 2. Experiences (with skill-focused sub-documents)
    if (resumeData.experience && Array.isArray(resumeData.experience)) {
      resumeData.experience.forEach((exp: any, index: number) => {
        const expDocs = createExperienceDocument(exp, index);
        documents.push(...expDocs);
        resumeCount += expDocs.length;
      });
      console.log(`   ✓ ${resumeData.experience.length} experiences indexed (with ${resumeCount - 1} skill-focused sub-docs)`);
    }
    
    // 3. Projects
    if (resumeData.projects && Array.isArray(resumeData.projects)) {
      resumeData.projects.forEach((proj: any, index: number) => {
        const projDocs = createProjectDocument(proj, index);
        documents.push(...projDocs);
        resumeCount += projDocs.length;
      });
      console.log(`   ✓ ${resumeData.projects.length} projects indexed`);
    }
    
    // 4. Education
    if (resumeData.education && Array.isArray(resumeData.education)) {
      resumeData.education.forEach((edu: any, index: number) => {
        documents.push(createEducationDocument(edu, index));
        resumeCount++;
      });
      console.log(`   ✓ ${resumeData.education.length} education entries indexed`);
    }
    
    // 5. Certifications
    if (resumeData.certifications && Array.isArray(resumeData.certifications)) {
      resumeData.certifications.forEach((cert: any, index: number) => {
        documents.push(createCertificationDocument(cert, index));
        resumeCount++;
      });
      console.log(`   ✓ ${resumeData.certifications.length} certifications indexed`);
    }
    
    // 6. Skills Overview
    if (resumeData.skills && Array.isArray(resumeData.skills)) {
      const skillDocs = createSkillsDocument(resumeData.skills, resumeData.experience);
      documents.push(...skillDocs);
      resumeCount += skillDocs.length;
      console.log(`   ✓ Skills profile indexed with categorization`);
    }
    
    console.log(`\n📊 Resume data: ${resumeCount} documents created\n`);

    // ============================================================
    // LOAD & INDEX JOURNEY DATA (STAR STORIES)
    // ============================================================
    console.log("📖 Loading journey data (behavioral stories)...");
    const journeyDataPath = "src/data/myJourney.json";
    const journeyRawData = fs.readFileSync(journeyDataPath, "utf-8");
    const journeyData = JSON.parse(journeyRawData);
    
    let journeyCount = 0;
    
    // Detailed company experiences with STAR stories
    if (journeyData.detailedExperiences && journeyData.detailedExperiences.length > 0) {
      journeyData.detailedExperiences.forEach((exp: any) => {
        const journeyDocs = createJourneyDocuments(exp);
        documents.push(...journeyDocs);
        journeyCount += journeyDocs.length;
        const starCount = exp.keyProjects?.length || 0;
        console.log(`   ✓ ${exp.company}: ${journeyDocs.length} docs (1 journey + ${starCount} STAR stories)`);
      });
    }
    
    // Process other narrative sections (chunked for context)
    const narrativeSections = [
      { key: 'lifeJourney.earlyLife', title: 'Early Life & Motivation' },
      { key: 'lifeJourney.academicJourney', title: 'Academic Journey' },
      { key: 'values', title: 'Core Values & Philosophy' },
      { key: 'futureAspirations', title: 'Future Aspirations' },
    ];
    
    narrativeSections.forEach(({ key, title }) => {
      const parts = key.split('.');
      let data = journeyData;
      for (const part of parts) {
        data = data?.[part];
      }
      
      if (data) {
        const content = `# ${title}\n\n${JSON.stringify(data, null, 2)}`;
        documents.push(new Document({
          pageContent: content,
          metadata: {
            type: 'narrative',
            section: key,
            source: 'journey',
            searchText: createSearchText([title, JSON.stringify(data)])
          }
        }));
        journeyCount++;
      }
    });
    
    console.log(`\n📊 Journey data: ${journeyCount} documents created\n`);
    
    // ============================================================
    // SMART CHUNKING FOR LARGE NARRATIVES
    // ============================================================
    console.log("🔪 Applying smart chunking to large narrative documents...");
    
    // Separate atomic docs from narratives
    const atomicDocs = documents.filter(d => d.metadata.type !== 'narrative');
    const narrativeDocs = documents.filter(d => d.metadata.type === 'narrative');
    
    console.log(`   📦 Atomic documents (no chunking): ${atomicDocs.length}`);
    console.log(`   📄 Narrative documents (will chunk): ${narrativeDocs.length}`);
    
    // Only chunk narratives if they're large
    let finalDocs = [...atomicDocs];
    
    if (narrativeDocs.length > 0) {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000, // Larger chunks for narratives
        chunkOverlap: 300,
        separators: ['\n\n\n', '\n\n', '\n', '. ', ' ', '']
      });
      
      const chunkedNarratives = await splitter.splitDocuments(narrativeDocs);
      finalDocs.push(...chunkedNarratives);
      console.log(`   ✓ Narratives split into ${chunkedNarratives.length} contextual chunks\n`);
    }
    
    // ============================================================
    // FINAL INDEXING
    // ============================================================
    console.log("=".repeat(100));
    console.log(`📦 TOTAL DOCUMENTS TO INDEX: ${finalDocs.length}`);
    console.log("=".repeat(100));
    console.log("\n📊 Breakdown:");
    console.log(`   • Experiences: ${resumeData.experience?.length || 0} (with skill-focused views)`);
    console.log(`   • Projects: ${resumeData.projects?.length || 0}`);
    console.log(`   • STAR Stories: ${journeyData.detailedExperiences?.reduce((sum: number, exp: any) => sum + (exp.keyProjects?.length || 0), 0) || 0}`);
    console.log(`   • Certifications: ${resumeData.certifications?.length || 0}`);
    console.log(`   • Education: ${resumeData.education?.length || 0}`);
    console.log(`   • Skills Profile: 1`);
    console.log(`   • Narrative Chunks: ${finalDocs.filter(d => d.metadata.type === 'narrative').length}`);
    console.log("\n");
    
    console.log("🔄 Adding documents to vector store (this may take 10-15 minutes)...\n");
    const startTime = Date.now();
    
    await vectorStore.addDocuments(finalDocs);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log("\n" + "=".repeat(100));
    console.log(`✅ SUCCESS! All documents indexed in ${duration}s`);
    console.log("=".repeat(100));
    console.log("\n🎯 Production Features Enabled:");
    console.log("   ✓ Multi-faceted indexing (company, skill, project, behavioral)");
    console.log("   ✓ Rich metadata (type, company, skills, metrics, behavioral tags)");
    console.log("   ✓ STAR story format for behavioral questions");
    console.log("   ✓ Skill-specific sub-documents for technology questions");
    console.log("   ✓ Entity extraction (skills, metrics, time periods)");
    console.log("   ✓ Search-optimized text for better retrieval");
    console.log("\n🤖 Ready to answer ANY recruiter question!\n");
    
  } catch (error) {
    console.error("\n❌ Error generating production embeddings:", error);
    throw error;
  }
}

generateProductionEmbeddings().catch(console.error);
