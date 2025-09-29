import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEmbeddingsCollection, getVectorStore } from "../src/lib/supabase";
import fs from "fs";

/**
 * Enhanced comprehensive data formatter for portfolio chatbot
 * Optimized for recruiter-friendly responses
 */

/**
 * Format comprehensive personal information
 */
function formatPersonalInfoSection(personalInfo: any): string {
  let content = "# Personal Profile & Professional Identity\n\n";
  
  if (personalInfo.basicInformation) {
    const basic = personalInfo.basicInformation;
    content += "## Personal Details\n";
    content += `**Full Name**: ${basic.fullName || 'Kaushal Kumar Agarwal'}\n`;
    content += `**Current Role**: ${basic.currentTitle || 'Software Development Engineer'}\n`;
    content += `**Current Company**: ${basic.currentCompany || 'Amazon Web Services'}\n`;
    content += `**Location**: ${basic.currentLocation || 'Seattle, WA, USA'}\n`;
    content += `**Background**: ${basic.homeLocation || 'Originally from India'}\n`;
    if (basic.languages && basic.languages.length > 0) {
      content += `**Languages**: ${basic.languages.join(', ')}\n`;
    }
    content += "\n";
  }
  
  if (personalInfo.contactInformation) {
    const contact = personalInfo.contactInformation;
    content += "## Professional Contact Information\n";
    content += `**Email**: ${contact.professionalEmail || 'ka62@alumni.rice.edu'}\n`;
    content += `**LinkedIn**: ${contact.linkedinProfile || 'Available on request'}\n`;
    content += `**GitHub**: ${contact.githubProfile || 'Available on request'}\n`;
    if (contact.professionalWebsite) {
      content += `**Website**: ${contact.professionalWebsite}\n`;
    }
    content += "\n";
  }
  
  if (personalInfo.professionalIdentity) {
    const prof = personalInfo.professionalIdentity;
    content += "## Professional Identity\n";
    content += `**Primary Expertise**: ${prof.primaryRole || 'Software Engineering and AI/ML'}\n\n`;
    content += `**Professional Summary**: ${prof.professionalSummary || 'Experienced software engineer with expertise in AI/ML and cloud platforms.'}\n\n`;
    content += `**Career Progression**: ${prof.careerProgression || 'Advanced through multiple technical roles to current position'}\n\n`;
    
    if (prof.specializations && prof.specializations.length > 0) {
      content += "**Core Specializations**:\n";
      prof.specializations.forEach((spec: string) => {
        content += `- ${spec}\n`;
      });
      content += "\n";
    }
  }
  
  if (personalInfo.personalCharacteristics) {
    const char = personalInfo.personalCharacteristics;
    
    if (char.corePersonalityTraits && char.corePersonalityTraits.length > 0) {
      content += "## Key Personal Strengths\n";
      char.corePersonalityTraits.forEach((trait: string, index: number) => {
        content += `${index + 1}. ${trait}\n`;
      });
      content += "\n";
    }
    
    if (char.workingStyle && char.workingStyle.length > 0) {
      content += "## Professional Working Style\n";
      char.workingStyle.forEach((style: string, index: number) => {
        content += `${index + 1}. ${style}\n`;
      });
      content += "\n";
    }
    
    if (char.personalMotivations && char.personalMotivations.length > 0) {
      content += "## Core Professional Motivations\n";
      char.personalMotivations.forEach((motivation: string, index: number) => {
        content += `${index + 1}. ${motivation}\n`;
      });
      content += "\n";
    }
  }
  
  if (personalInfo.internationalExperience) {
    const intl = personalInfo.internationalExperience;
    content += "## Global Professional Experience\n";
    content += `**Cultural Adaptability**: ${intl.culturalAdaptability || 'Strong international experience'}\n`;
    content += `**Global Perspective**: ${intl.globalPerspective || 'Experienced with diverse teams'}\n`;
    content += `**International Journey**: ${intl.immigrationJourney || 'Successfully established international career'}\n\n`;
  }
  
  if (personalInfo.certificationHighlights && personalInfo.certificationHighlights.length > 0) {
    content += "## Professional Certifications\n";
    personalInfo.certificationHighlights.forEach((cert: string) => {
      content += `- ${cert}\n`;
    });
    content += "\n";
  }
  
  return content;
}

/**
 * Format early life and personal background information
 */
function formatEarlyLifeSection(earlyLife: any): string {
  let content = "# Personal Background & Early Motivation\n\n";
  
  content += "## Early Technology Passion\n";
  content += `${earlyLife.childhood || 'Demonstrated strong early interest in technology and computer science.'}\n\n`;
  
  content += "## Leadership Development\n";
  content += `${earlyLife.personalityFormation || 'Developed strong communication and leadership skills through various experiences.'}\n\n`;
  
  content += "## Core Motivations\n";
  content += `${earlyLife.earlyMotivations || 'Driven by passion to create impactful technology solutions.'}\n\n`;
  
  if (earlyLife.behavioralTags && earlyLife.behavioralTags.length > 0) {
    content += "## Key Strengths Demonstrated Early\n";
    content += earlyLife.behavioralTags.map((tag: string) => `- ${tag.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`).join('\n');
    content += "\n\n";
  }
  
  return content;
}

/**
 * Format academic journey with focus on achievements
 */
function formatAcademicJourney(academicJourney: any): string {
  let content = "# Academic Excellence & Growth Journey\n\n";
  
  if (academicJourney.highSchool) {
    content += "## High School Achievement Story\n";
    if (academicJourney.highSchool.keyExperiences && academicJourney.highSchool.keyExperiences.length > 0) {
      const exp = academicJourney.highSchool.keyExperiences[0];
      content += `**Academic Transformation**: ${exp.situation || 'Demonstrated remarkable academic improvement and consistency.'}\n\n`;
      content += `**Goals & Strategy**: ${exp.task || 'Focused on achieving excellence in national-level examinations.'}\n\n`;
      content += `**Approach**: ${exp.action || 'Implemented disciplined study methodology and strategic preparation.'}\n\n`;
      content += `**Outstanding Results**: ${exp.result || 'Achieved excellent academic results and secured admission to prestigious engineering college.'}\n\n`;
    }
    
    if (academicJourney.highSchool.achievements) {
      content += `**Academic Performance**: ${academicJourney.highSchool.achievements}\n\n`;
    }
    
    if (academicJourney.highSchool.pivotalMoments) {
      content += `**Key Realization**: ${academicJourney.highSchool.pivotalMoments}\n\n`;
    }
  }
  
  if (academicJourney.college) {
    content += "## College Excellence & Technical Leadership\n";
    content += `**Strategic College Choice**: ${academicJourney.college.admissionStory || 'Made strategic decision to pursue Computer Science at premier institution.'}\n\n`;
    
    if (academicJourney.college.keyExperiences && academicJourney.college.keyExperiences.length > 0) {
      academicJourney.college.keyExperiences.forEach((exp: any, index: number) => {
        content += `### ${exp.title || `Achievement ${index + 1}`}\n`;
        content += `**Period**: ${exp.period || 'Throughout college'}\n`;
        content += `**Challenge**: ${exp.situation || 'Tackled complex technical challenges'}\n`;
        content += `**Objective**: ${exp.task || 'Developed expertise and leadership skills'}\n`;
        content += `**Strategic Approach**: ${exp.action || 'Implemented systematic learning and practice'}\n`;
        content += `**Exceptional Results**: ${exp.result || 'Achieved outstanding performance and recognition'}\n\n`;
      });
    }
    
    content += `**Professional Relationships**: ${academicJourney.college.relationships || 'Built strong mentorship and collaborative relationships with peers and faculty.'}\n\n`;
    content += `**Overall Growth**: ${academicJourney.college.growth || 'Demonstrated exceptional personal and technical development throughout college.'}\n\n`;
  }
  
  if (academicJourney.graduateSchool) {
    content += "## Graduate School Leadership & International Experience\n";
    content += `**Strategic Decision**: ${academicJourney.graduateSchool.decisionToAdvance || 'Made strategic choice to pursue advanced education and international experience.'}\n\n`;
    content += `**Adaptation Excellence**: ${academicJourney.graduateSchool.adaptationChallenges || 'Successfully adapted to new environment and excelled in challenging circumstances.'}\n\n`;
    
    if (academicJourney.graduateSchool.teachingAssistantExperience) {
      const ta = academicJourney.graduateSchool.teachingAssistantExperience;
      content += "### Teaching Leadership Excellence\n";
      content += `**Initiative**: ${ta.situation || 'Proactively secured Teaching Assistant positions despite initial challenges.'}\n`;
      content += `**Challenges Overcome**: ${ta.challenges || 'Successfully managed complex responsibilities and stakeholder expectations.'}\n`;
      content += `**Leadership Actions**: ${ta.actions || 'Demonstrated exceptional organizational and mentoring capabilities.'}\n`;
      content += `**Outstanding Results**: ${ta.results || 'Achieved significant positive impact on student success and learning outcomes.'}\n\n`;
    }
    
    if (academicJourney.graduateSchool.academicExperiences) {
      const academic = academicJourney.graduateSchool.academicExperiences;
      content += "### Academic Excellence & Project Leadership\n";
      content += `**Strategic Focus**: ${academic.situation || 'Made strategic specialization choice in cutting-edge technology field.'}\n`;
      content += `**Complex Challenges**: ${academic.challenges || 'Successfully managed demanding coursework and leadership responsibilities.'}\n`;
      content += `**Leadership Approach**: ${academic.actions || 'Demonstrated exceptional project management and team coordination skills.'}\n`;
      content += `**Exceptional Results**: ${academic.results || 'Achieved outstanding academic performance with 3.95/4.00 GPA.'}\n\n`;
    }
  }
  
  return content;
}

/**
 * Format detailed work experiences with STAR method focus
 */
function formatDetailedExperiences(experiences: any[]): string {
  let content = "# Professional Experience & Career Achievements\n\n";
  
  experiences.forEach((exp: any, index: number) => {
    content += `## ${exp.company || `Company ${index + 1}`} - ${exp.position || 'Professional Role'}\n`;
    content += `**Period**: ${exp.period || 'Professional tenure'}\n`;
    content += `**Location**: ${exp.location || 'Professional location'}\n\n`;
    
    if (exp.joinStory) {
      content += "### Strategic Career Move\n";
      content += `**How I Joined**: ${exp.joinStory.howIJoined || 'Secured position through competitive process'}\n`;
      content += `**Strategic Vision**: ${exp.joinStory.initialExpectations || 'Focused on delivering high-impact technical solutions'}\n`;
      content += `**First Day Excellence**: ${exp.joinStory.firstDayExperience || 'Quickly integrated and began contributing to team objectives'}\n\n`;
    }
    
    if (exp.keyProjects && exp.keyProjects.length > 0) {
      content += "### Major Technical Achievements\n";
      exp.keyProjects.forEach((project: any, projectIndex: number) => {
        content += `#### ${project.projectName || `Project ${projectIndex + 1}`}\n`;
        content += `**Situation**: ${project.situation || 'Identified critical business challenge requiring technical solution'}\n`;
        content += `**Task**: ${project.task || 'Designed and implemented comprehensive technical solution'}\n`;
        content += `**Action**: ${project.action || 'Led development and implementation with focus on quality and performance'}\n`;
        content += `**Result**: ${project.result || 'Delivered exceptional results exceeding expectations and business objectives'}\n`;
        
        if (project.behavioralTags && project.behavioralTags.length > 0) {
          content += `**Key Competencies Demonstrated**: ${project.behavioralTags.map((tag: string) => tag.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())).join(', ')}\n`;
        }
        content += "\n";
      });
    }
    
    if (exp.relationships) {
      content += "### Professional Relationships & Leadership\n";
      content += `**Team Collaboration**: ${exp.relationships.teamDynamics || 'Demonstrated exceptional teamwork and collaborative leadership'}\n`;
      content += `**Conflict Resolution**: ${exp.relationships.conflictResolution || 'Successfully managed challenging situations with diplomatic approach'}\n`;
      content += `**Mentorship Impact**: ${exp.relationships.mentorship || 'Both provided mentorship to others and sought guidance for continuous improvement'}\n\n`;
    }
    
    if (exp.growthAtCompany) {
      content += "### Professional Growth & Impact\n";
      content += `${exp.growthAtCompany}\n\n`;
    }
    
    if (exp.departureReason) {
      content += "### Career Progression Strategy\n";
      content += `${exp.departureReason}\n\n`;
    }
    
    content += "---\n\n";
  });
  
  return content;
}

/**
 * Format core values and work philosophy
 */
function formatValues(values: any): string {
  let content = "# Core Values & Professional Philosophy\n\n";
  
  if (values.coreValues && values.coreValues.length > 0) {
    content += "## Fundamental Professional Values\n";
    values.coreValues.forEach((value: string, index: number) => {
      content += `### ${index + 1}. ${value.split(':')[0] || `Core Value ${index + 1}`}\n`;
      content += `${value.split(':').slice(1).join(':').trim() || 'Committed to excellence and integrity in all professional endeavors.'}\n\n`;
    });
  }
  
  if (values.workPhilosophy) {
    content += "## Professional Work Approach\n";
    content += `${values.workPhilosophy}\n\n`;
  }
  
  if (values.decisionMaking) {
    content += "## Strategic Decision Making\n";
    content += `${values.decisionMaking}\n\n`;
  }
  
  return content;
}

/**
 * Format future aspirations and career vision
 */
function formatFutureAspirations(aspirations: any): string {
  let content = "# Career Vision & Future Goals\n\n";
  
  if (aspirations.careerGoals) {
    content += "## Strategic Career Trajectory\n";
    content += `${aspirations.careerGoals}\n\n`;
  }
  
  if (aspirations.skillDevelopment) {
    content += "## Continuous Learning & Growth Areas\n";
    content += `${aspirations.skillDevelopment}\n\n`;
  }
  
  if (aspirations.impact) {
    content += "## Vision for Professional Impact\n";
    content += `${aspirations.impact}\n\n`;
  }
  
  return content;
}

/**
 * Enhanced resume section formatter with recruiter-friendly language
 */
function formatResumeSection(sectionName: string, data: any): string {
  // Format section headers consistently
  const formatSectionName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  // Format the section name
  const formattedSectionName = formatSectionName(sectionName);
  let content = `# ${formattedSectionName}\n`;

  // Handle different section types with professional emphasis
  if (sectionName === "personalInfo") {
    const info = data;
    content += `**Name**: ${info.name}\n`;
    content += `**Professional Title**: ${info.title}\n`;
    content += `**Contact Email**: ${info.email}\n`;
    content += `**Current Location**: ${info.location}\n`;
    content += `**Professional Summary**: ${info.summary}\n`;
    content += `**GitHub Portfolio**: ${info.github}\n`;
    content += `**LinkedIn Profile**: ${info.linkedin}\n`;
    if (info.website) content += `**Professional Website**: ${info.website}\n`;
  } 
  else if (sectionName === "experience") {
    data.forEach((exp: any, i: number) => {
      content += `## ${exp.company} - ${exp.position}\n`;
      content += `**Role**: ${exp.position}\n`;
      content += `**Company**: ${exp.company}\n`;
      content += `**Duration**: ${exp.startDate} to ${exp.endDate}\n`;
      content += `**Location**: ${exp.location || 'Professional role'}\n`;
      content += `**Key Achievements**: ${exp.description}\n`;
      if (exp.companyUrl) content += `**Company Website**: ${exp.companyUrl}\n`;
      content += "\n";
    });
  }
  else if (sectionName === "education") {
    data.forEach((edu: any, i: number) => {
      content += `## ${edu.institution} - ${edu.degree}\n`;
      content += `**Institution**: ${edu.institution}\n`;
      content += `**Degree**: ${edu.degree}\n`;
      content += `**Duration**: ${edu.startDate} to ${edu.endDate}\n`;
      content += `**Location**: ${edu.location || 'Academic institution'}\n`;
      content += `**Academic Achievements**: ${edu.description}\n`;
      if (edu.institutionUrl) content += `**Institution Website**: ${edu.institutionUrl}\n`;
      content += "\n";
    });
  }
  else if (sectionName === "skills") {
    content += `**Technical Expertise**: ${data.join(", ")}\n`;
    content += "\nDemonstrated proficiency across full-stack development, cloud platforms, AI/ML technologies, and modern development frameworks.\n";
  }
  else if (sectionName === "projects") {
    data.forEach((proj: any, i: number) => {
      content += `## ${proj.name}\n`;
      content += `**Project Name**: ${proj.name}\n`;
      content += `**Technical Achievement**: ${proj.description}\n`;
      content += `**Technologies & Skills**: ${proj.technologies.join(", ")}\n`;
      content += `**Project Link**: ${proj.link}\n`;
      content += "\n";
    });
  }
  else if (sectionName === "languages") {
    content += "Languages: ";
    data.forEach((lang: any, i: number) => {
      content += `${lang.language} (${lang.proficiency})`;
      if (i < data.length - 1) content += ", ";
    });
    content += "\n";
  }
  else if (sectionName === "interests") {
    content += `**Professional Interests**: ${data.join(", ")}\n`;
    content += "Passionate about staying current with emerging technologies and industry trends.\n";
  }
  else if (sectionName === "softSkills") {
    content += `**Core Professional Competencies**: ${data.join(", ")}\n`;
    content += "Demonstrated leadership, communication, and collaborative abilities across diverse professional environments.\n";
  }
  else if (sectionName === "certifications") {
    data.forEach((cert: any, i: number) => {
      content += `## ${cert.name}\n`;
      content += `**Certification**: ${cert.name}\n`;
      content += `**Earned**: ${cert.date}\n`;
      content += `**Professional Validation**: ${cert.description}\n`;
      content += "\n";
    });
  }
  else {
    // Generic handling for any other sections
    content += JSON.stringify(data, null, 2);
  }

  return content;
}

/**
 * Comprehensive function to load both resume and journey data and create optimized documents
 */
async function generateEmbeddings() {
  try {
    console.log("Starting comprehensive embeddings generation...");
    
    // Get the vector store
    const vectorStore = await getVectorStore();
    
    // Clear existing documents
    console.log("Clearing existing documents...");
    const { error } = await (await getEmbeddingsCollection()).delete().neq('id', 0);
    if (error) {
      console.error('Error clearing documents:', error);
      return;
    }

    const documents: Document[] = [];

    // Load resume data
    console.log("Loading resume data...");
    const resumeDataPath = "src/data/resumeData.json";
    const resumeRawData = fs.readFileSync(resumeDataPath, "utf-8");
    const resumeData = JSON.parse(resumeRawData);
    
    // Create documents for resume sections
    const resumeSections = [
      "personalInfo", "experience", "education", "skills", 
      "projects", "languages", "interests", "certifications", "softSkills"
    ];
    
    for (const section of resumeSections) {
      if (!resumeData[section]) continue;
      
      const content = formatResumeSection(section, resumeData[section]);
      
      documents.push(new Document({
        pageContent: content,
        metadata: { 
          section: section,
          source: "resume",
          dataType: "professional_summary"
        }
      }));
    }
    
    console.log(`Created ${documents.length} resume documents`);

    // Load comprehensive journey data
    console.log("Loading comprehensive journey data...");
    const journeyDataPath = "src/data/myJourney.json";
    const journeyRawData = fs.readFileSync(journeyDataPath, "utf-8");
    const journeyData = JSON.parse(journeyRawData);
    
    // Process personal information first
    if (journeyData.personalInfo) {
      const content = formatPersonalInfoSection(journeyData.personalInfo);
      documents.push(new Document({
        pageContent: content,
        metadata: { 
          section: "personalInfo",
          source: "journey",
          dataType: "personal_identity"
        }
      }));
    }
    
    // Process life journey sections
    if (journeyData.lifeJourney) {
      if (journeyData.lifeJourney.earlyLife) {
        const content = formatEarlyLifeSection(journeyData.lifeJourney.earlyLife);
        documents.push(new Document({
          pageContent: content,
          metadata: { 
            section: "earlyLife",
            source: "journey",
            dataType: "personal_background"
          }
        }));
      }
      
      if (journeyData.lifeJourney.academicJourney) {
        const content = formatAcademicJourney(journeyData.lifeJourney.academicJourney);
        documents.push(new Document({
          pageContent: content,
          metadata: { 
            section: "academicJourney",
            source: "journey",
            dataType: "educational_excellence"
          }
        }));
      }
    }
    
    // Process detailed work experiences
    if (journeyData.detailedExperiences && journeyData.detailedExperiences.length > 0) {
      const content = formatDetailedExperiences(journeyData.detailedExperiences);
      documents.push(new Document({
        pageContent: content,
        metadata: { 
          section: "detailedExperiences",
          source: "journey",
          dataType: "behavioral_stories"
        }
      }));
      
      // Create individual company documents for better retrieval
      journeyData.detailedExperiences.forEach((exp: any, index: number) => {
        let companyContent = `# ${exp.company} Experience - ${exp.position}\n\n`;
        companyContent += `**Duration**: ${exp.period}\n`;
        companyContent += `**Location**: ${exp.location}\n\n`;
        
        if (exp.joinStory) {
          companyContent += `**Strategic Career Move**: ${exp.joinStory.howIJoined}\n\n`;
        }
        
        if (exp.keyProjects) {
          companyContent += "## Key Technical Achievements\n";
          exp.keyProjects.forEach((project: any) => {
            companyContent += `### ${project.projectName}\n`;
            companyContent += `**Challenge**: ${project.situation}\n`;
            companyContent += `**Solution**: ${project.action}\n`;
            companyContent += `**Impact**: ${project.result}\n\n`;
          });
        }
        
        if (exp.growthAtCompany) {
          companyContent += `**Professional Growth**: ${exp.growthAtCompany}\n\n`;
        }
        
        documents.push(new Document({
          pageContent: companyContent,
          metadata: { 
            section: "companyExperience",
            company: exp.company,
            position: exp.position,
            source: "journey",
            dataType: "company_specific"
          }
        }));
      });
    }
    
    // Process values and philosophy
    if (journeyData.values) {
      const content = formatValues(journeyData.values);
      documents.push(new Document({
        pageContent: content,
        metadata: { 
          section: "values",
          source: "journey",
          dataType: "professional_philosophy"
        }
      }));
    }
    
    // Process future aspirations
    if (journeyData.futureAspirations) {
      const content = formatFutureAspirations(journeyData.futureAspirations);
      documents.push(new Document({
        pageContent: content,
        metadata: { 
          section: "futureAspirations",
          source: "journey",
          dataType: "career_vision"
        }
      }));
    }
    
    console.log(`Created total ${documents.length} comprehensive documents`);

    // Split documents into optimized chunks for better retrieval
    console.log("Splitting documents for optimal retrieval...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1200,
      chunkOverlap: 300,
    });
    
    const splitDocs = await splitter.splitDocuments(documents);
    console.log(`Split into ${splitDocs.length} optimized chunks`);

    // Add documents to vector store
    console.log("Adding comprehensive dataset to vector store...");
    await vectorStore.addDocuments(splitDocs);

    console.log("Comprehensive portfolio embeddings generated successfully!");
    console.log("Dataset includes: Resume data, Life journey, Detailed experiences, Values, and Career aspirations");
  } catch (error) {
    console.error("Error generating comprehensive embeddings:", error);
    throw error;
  }
}

generateEmbeddings().catch(console.error);