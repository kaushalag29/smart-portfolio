/**
 * INTELLIGENT QUERY ROUTER
 * Analyzes recruiter questions and extracts all relevant entities
 */

export interface QueryAnalysis {
  originalQuery: string;
  detectedEntities: DetectedEntities;
  queryIntent: QueryIntent;
  searchStrategies: SearchStrategy[];
  confidenceScore: number;
}

export interface DetectedEntities {
  companies: string[];
  skills: string[];
  projects: string[];
  locations: string[];
  timeframes: string[];
  certifications: string[];
  concepts: string[];
}

export interface QueryIntent {
  primary: string;
  secondary: string[];
  isSTARQuestion: boolean;
  isBehavioral: boolean;
  isTechnical: boolean;
  needsMultipleExamples: boolean;
}

export interface SearchStrategy {
  type: 'filtered' | 'semantic' | 'hybrid' | 'multi_query';
  filters: { [key: string]: string };
  boost: number;
  k: number;
}

export class IntelligentQueryRouter {
  
  private static readonly COMPANIES: { [key: string]: string[] } = {
    'Amazon Web Services': ['aws', 'amazon web services', 'amazon', 'greengrass'],
    'Cloudwick Technologies': ['cloudwick'],
    'Paycom': ['paycom'],
    'Qubole': ['qubole'],
    'Microland': ['microland'],
    'Ranchi Mall': ['ranchi mall', 'ranchimall'],
    'Rice University': ['rice', 'rice university'],
    'BIT Mesra': ['bit', 'mesra', 'birla'],
  };
  
  private static readonly SKILLS: { [key: string]: string[] } = {
    'Python': ['python'],
    'Java': ['java'],
    'JavaScript': ['javascript', 'js', 'node'],
    'C++': ['c\\+\\+', 'cpp'],
    'C#': ['c#', 'csharp', '\\.net'],
    'React': ['react'],
    'AWS': ['aws'],
    'Machine Learning': ['machine learning', 'ml'],
    'Docker': ['docker'],
    'Kubernetes': ['kubernetes', 'k8s'],
  };
  
  static analyzeQuery(query: string): QueryAnalysis {
    const queryLower = query.toLowerCase();
    const entities = this.detectEntities(queryLower);
    const intent = this.determineIntent(queryLower);
    const strategies = this.createSearchStrategies(entities, intent);
    const confidence = this.calculateConfidence(entities, intent);
    
    return {
      originalQuery: query,
      detectedEntities: entities,
      queryIntent: intent,
      searchStrategies: strategies,
      confidenceScore: confidence
    };
  }
  
  private static detectEntities(queryLower: string): DetectedEntities {
    const entities: DetectedEntities = {
      companies: [],
      skills: [],
      projects: [],
      locations: [],
      timeframes: [],
      certifications: [],
      concepts: []
    };
    
    for (const [company, keywords] of Object.entries(this.COMPANIES)) {
      if (keywords.some(kw => queryLower.includes(kw))) {
        entities.companies.push(company);
      }
    }
    
    for (const [skill, keywords] of Object.entries(this.SKILLS)) {
      if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(queryLower))) {
        entities.skills.push(skill);
      }
    }
    
    const locationPatterns = ['seattle', 'houston', 'dallas', 'bengaluru'];
    entities.locations = locationPatterns.filter(loc => queryLower.includes(loc));
    
    const timePatterns = /\b(20\d{2}|recent|current|latest)\b/gi;
    const timeMatches = queryLower.match(timePatterns);
    if (timeMatches) {
      entities.timeframes = [...new Set(timeMatches.map(t => t.trim()))];
    }
    
    if (/\b(aws|certified|certification)\b/i.test(queryLower)) {
      entities.certifications = ['AWS'];
    }
    
    return entities;
  }
  
  private static determineIntent(queryLower: string): QueryIntent {
    const isSTAR = /\b(situation|task|action|result|tell me about a time)\b/i.test(queryLower);
    const isBehavioral = /\b(challenge|problem|conflict|difficult)\b/i.test(queryLower) || isSTAR;
    const isTechnical = /\b(how|architecture|design|implement|technical)\b/i.test(queryLower);
    const needsMultiple = /\b(examples|multiple|several|all|list)\b/i.test(queryLower);
    
    let primary = 'general';
    if (/\b(project|built|developed)\b/i.test(queryLower)) primary = 'project';
    else if (/\b(experience|work|worked|job)\b/i.test(queryLower)) primary = 'experience';
    else if (/\b(skill|technology|expertise)\b/i.test(queryLower)) primary = 'skill';
    else if (isBehavioral) primary = 'behavioral';
    
    return {
      primary,
      secondary: [],
      isSTARQuestion: isSTAR,
      isBehavioral,
      isTechnical,
      needsMultipleExamples: needsMultiple
    };
  }
  
  private static createSearchStrategies(
    entities: DetectedEntities,
    intent: QueryIntent
  ): SearchStrategy[] {
    const strategies: SearchStrategy[] = [];
    
    if (entities.companies.length > 0) {
      strategies.push({
        type: 'filtered',
        filters: { company: entities.companies[0] },
        boost: 2.0,
        k: 10
      });
    }
    
    if (intent.isSTARQuestion || intent.isBehavioral) {
      strategies.push({
        type: 'filtered',
        filters: { type: 'star_story,journey_experience' },
        boost: 1.5,
        k: 8
      });
    }
    
    strategies.push({
      type: 'semantic',
      filters: {},
      boost: 1.0,
      k: 15
    });
    
    return strategies;
  }
  
  private static calculateConfidence(entities: DetectedEntities, intent: QueryIntent): number {
    let score = 0.5;
    if (entities.companies.length > 0) score += 0.2;
    if (entities.skills.length > 0) score += 0.15;
    if (intent.primary !== 'general') score += 0.1;
    return Math.min(score, 1.0);
  }
  
  static generateSearchQueries(query: string, analysis: QueryAnalysis): string[] {
    const queries = [query];
    
    if (analysis.detectedEntities.companies.length > 0) {
      const company = analysis.detectedEntities.companies[0];
      queries.push(`${query} ${company}`);
    }
    
    if (analysis.detectedEntities.skills.length > 0) {
      const skills = analysis.detectedEntities.skills.slice(0, 2).join(' ');
      queries.push(`${skills} experience`);
    }
    
    return [...new Set(queries)];
  }
  
  static formatAnalysisLog(analysis: QueryAnalysis): string {
    let log = `\n🔍 [INTELLIGENT QUERY ANALYSIS]\n`;
    log += `   Query: "${analysis.originalQuery}"\n`;
    log += `   Confidence: ${(analysis.confidenceScore * 100).toFixed(0)}%\n\n`;
    
    log += `📌 Detected Entities:\n`;
    if (analysis.detectedEntities.companies.length > 0) {
      log += `   • Companies: ${analysis.detectedEntities.companies.join(', ')}\n`;
    }
    if (analysis.detectedEntities.skills.length > 0) {
      log += `   • Skills: ${analysis.detectedEntities.skills.join(', ')}\n`;
    }
    
    log += `\n🎯 Query Intent:\n`;
    log += `   • Primary: ${analysis.queryIntent.primary}\n`;
    log += `   • STAR Question: ${analysis.queryIntent.isSTARQuestion ? 'Yes' : 'No'}\n`;
    log += `   • Behavioral: ${analysis.queryIntent.isBehavioral ? 'Yes' : 'No'}\n`;
    log += `   • Technical: ${analysis.queryIntent.isTechnical ? 'Yes' : 'No'}\n`;
    
    log += `\n🔎 Search Strategies: ${analysis.searchStrategies.length}\n`;
    
    return log;
  }
}
