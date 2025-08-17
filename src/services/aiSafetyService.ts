/**
 * AI Safety Service
 * 
 * Implements comprehensive safety measures and content filtering
 * for AI-generated therapeutic content to ensure user safety
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface SafetyCheck {
  passed: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface ContentAnalysis {
  isTherapeuticallyAppropriate: boolean;
  containsHarmfulContent: boolean;
  containsInappropriateAdvice: boolean;
  containsDisclaimer: boolean;
  languageTone: 'supportive' | 'neutral' | 'concerning' | 'harmful';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SafetyReport {
  contentId: string;
  timestamp: string;
  contentType: 'exercise' | 'insight' | 'recommendation' | 'affirmation';
  originalContent: any;
  safetyCheck: SafetyCheck;
  contentAnalysis: ContentAnalysis;
  action: 'approved' | 'modified' | 'rejected';
  modifiedContent?: any;
}

const STORAGE_KEYS = {
  SAFETY_REPORTS: 'ai_safety_reports',
  SAFETY_SETTINGS: 'ai_safety_settings',
  BLOCKED_CONTENT: 'ai_blocked_content',
} as const;

// Harmful content patterns to detect
const HARMFUL_PATTERNS = [
  // Self-harm related
  /\b(kill|hurt|harm|cut|suicide|end.{0,10}life|self.{0,5}harm)\b/i,
  /\b(razor|blade|pills|overdose|jump|bridge)\b/i,
  
  // Inappropriate medical advice
  /\b(diagnose|medication|prescribe|stop.{0,10}taking|increase.{0,10}dose)\b/i,
  /\b(replace.{0,10}therapy|instead.{0,10}of.{0,10}doctor|cure.{0,10}depression)\b/i,
  
  // Minimizing serious conditions
  /\b(just.{0,5}think.{0,5}positive|get.{0,5}over.{0,5}it|not.{0,5}real)\b/i,
  /\b(weakness|attention.{0,5}seeking|making.{0,5}it.{0,5}up)\b/i,
  
  // Inappropriate guarantees
  /\b(guarantee|promise|cure|fix|solve.{0,10}all)\b/i,
  /\b(never.{0,10}feel.{0,10}sad|always.{0,10}happy|permanent.{0,10}solution)\b/i,
];

// Inappropriate advice patterns
const INAPPROPRIATE_ADVICE_PATTERNS = [
  /\b(avoid.{0,10}all|never.{0,10}talk|isolate|give.{0,10}up)\b/i,
  /\b(you.{0,5}should.{0,5}feel|must.{0,5}be|have.{0,5}to.{0,5}be)\b/i,
  /\b(wrong.{0,5}with.{0,5}you|broken|damaged|hopeless)\b/i,
];

// Required therapeutic language patterns
const THERAPEUTIC_LANGUAGE_PATTERNS = [
  /\b(gentle|kind|compassion|understanding|support)\b/i,
  /\b(it's.{0,5}okay|normal.{0,5}to.{0,5}feel|valid|understandable)\b/i,
  /\b(at.{0,5}your.{0,5}own.{0,5}pace|when.{0,5}you're.{0,5}ready)\b/i,
];

class AISafetyService {
  private safetySettings = {
    strictMode: true,
    requireDisclaimer: true,
    blockHarmfulContent: true,
    requireTherapeuticLanguage: true,
    logAllContent: true,
  };

  /**
   * Validate AI-generated exercise for safety
   */
  async validateExercise(exercise: {
    title: string;
    category: string;
    duration: number;
    steps: string[];
    description: string;
    benefits: string[];
  }): Promise<SafetyCheck> {
    const contentText = [
      exercise.title,
      exercise.description,
      ...exercise.steps,
      ...exercise.benefits,
    ].join(' ');

    const analysis = this.analyzeContent(contentText, 'exercise');
    const safetyCheck = this.performSafetyCheck(analysis, exercise);

    // Log safety report
    await this.logSafetyReport({
      contentId: `exercise_${Date.now()}`,
      timestamp: new Date().toISOString(),
      contentType: 'exercise',
      originalContent: exercise,
      safetyCheck,
      contentAnalysis: analysis,
      action: safetyCheck.passed ? 'approved' : 'rejected',
    });

    return safetyCheck;
  }

  /**
   * Validate AI-generated insights for safety
   */
  async validateInsights(insights: {
    insights: string[];
    trends: string[];
    recommendations: string[];
    riskFactors: string[];
    strengths: string[];
  }): Promise<SafetyCheck> {
    const contentText = [
      ...insights.insights,
      ...insights.trends,
      ...insights.recommendations,
      ...insights.riskFactors,
      ...insights.strengths,
    ].join(' ');

    const analysis = this.analyzeContent(contentText, 'insight');
    const safetyCheck = this.performSafetyCheck(analysis, insights);

    // Special validation for risk factors
    if (insights.riskFactors.length > 0) {
      const riskAnalysis = this.validateRiskFactors(insights.riskFactors);
      if (!riskAnalysis.passed) {
        safetyCheck.passed = false;
        safetyCheck.issues.push(...riskAnalysis.issues);
        safetyCheck.severity = 'high';
      }
    }

    await this.logSafetyReport({
      contentId: `insights_${Date.now()}`,
      timestamp: new Date().toISOString(),
      contentType: 'insight',
      originalContent: insights,
      safetyCheck,
      contentAnalysis: analysis,
      action: safetyCheck.passed ? 'approved' : 'rejected',
    });

    return safetyCheck;
  }

  /**
   * Validate therapeutic content (affirmations, coping strategies)
   */
  async validateTherapeuticContent(
    content: string,
    type: 'affirmation' | 'recommendation'
  ): Promise<SafetyCheck> {
    const analysis = this.analyzeContent(content, type);
    const safetyCheck = this.performSafetyCheck(analysis, { content });

    await this.logSafetyReport({
      contentId: `${type}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      contentType: type,
      originalContent: { content },
      safetyCheck,
      contentAnalysis: analysis,
      action: safetyCheck.passed ? 'approved' : 'rejected',
    });

    return safetyCheck;
  }

  /**
   * Analyze content for safety issues
   */
  private analyzeContent(content: string, type: string): ContentAnalysis {
    const lowerContent = content.toLowerCase();

    // Check for harmful content
    const containsHarmfulContent = HARMFUL_PATTERNS.some(pattern => 
      pattern.test(content)
    );

    // Check for inappropriate advice
    const containsInappropriateAdvice = INAPPROPRIATE_ADVICE_PATTERNS.some(pattern => 
      pattern.test(content)
    );

    // Check for therapeutic language
    const hasTherapeuticLanguage = THERAPEUTIC_LANGUAGE_PATTERNS.some(pattern => 
      pattern.test(content)
    );

    // Check for disclaimer (for recommendations)
    const containsDisclaimer = type === 'recommendation' ? 
      /\b(professional|doctor|therapist|medical|emergency)\b/i.test(content) : true;

    // Determine language tone
    let languageTone: ContentAnalysis['languageTone'] = 'neutral';
    if (containsHarmfulContent) {
      languageTone = 'harmful';
    } else if (containsInappropriateAdvice) {
      languageTone = 'concerning';
    } else if (hasTherapeuticLanguage) {
      languageTone = 'supportive';
    }

    // Determine risk level
    let riskLevel: ContentAnalysis['riskLevel'] = 'low';
    if (containsHarmfulContent) {
      riskLevel = 'critical';
    } else if (containsInappropriateAdvice) {
      riskLevel = 'high';
    } else if (!hasTherapeuticLanguage && type !== 'affirmation') {
      riskLevel = 'medium';
    }

    return {
      isTherapeuticallyAppropriate: hasTherapeuticLanguage && !containsInappropriateAdvice,
      containsHarmfulContent,
      containsInappropriateAdvice,
      containsDisclaimer,
      languageTone,
      riskLevel,
    };
  }

  /**
   * Perform comprehensive safety check
   */
  private performSafetyCheck(analysis: ContentAnalysis, content: any): SafetyCheck {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let severity: SafetyCheck['severity'] = 'low';

    // Critical issues
    if (analysis.containsHarmfulContent) {
      issues.push('Content contains potentially harmful language or suggestions');
      recommendations.push('Remove all references to self-harm or dangerous activities');
      severity = 'critical';
    }

    // High severity issues
    if (analysis.containsInappropriateAdvice) {
      issues.push('Content provides inappropriate therapeutic advice');
      recommendations.push('Use gentle, supportive language without prescriptive advice');
      severity = severity === 'critical' ? 'critical' : 'high';
    }

    // Medium severity issues
    if (!analysis.isTherapeuticallyAppropriate) {
      issues.push('Content lacks therapeutic appropriateness');
      recommendations.push('Include more supportive and validating language');
      severity = severity === 'critical' || severity === 'high' ? severity : 'medium';
    }

    if (!analysis.containsDisclaimer && this.safetySettings.requireDisclaimer) {
      issues.push('Content lacks appropriate disclaimers');
      recommendations.push('Include disclaimer about professional support when appropriate');
    }

    // Risk level assessment
    if (analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') {
      issues.push(`Content risk level is ${analysis.riskLevel}`);
      recommendations.push('Revise content to reduce risk and improve safety');
    }

    const passed = issues.length === 0 || (
      !analysis.containsHarmfulContent && 
      !analysis.containsInappropriateAdvice &&
      analysis.riskLevel !== 'critical'
    );

    return {
      passed,
      issues,
      severity,
      recommendations,
    };
  }

  /**
   * Validate risk factors for appropriate language
   */
  private validateRiskFactors(riskFactors: string[]): SafetyCheck {
    const issues: string[] = [];
    const recommendations: string[] = [];

    riskFactors.forEach((factor, index) => {
      // Check if risk factor is too alarming
      if (/\b(dangerous|severe|critical|emergency)\b/i.test(factor)) {
        issues.push(`Risk factor ${index + 1} uses alarming language`);
        recommendations.push('Use gentler language to describe concerns');
      }

      // Check if risk factor lacks supportive framing
      if (!/\b(consider|might|could|may want to)\b/i.test(factor)) {
        issues.push(`Risk factor ${index + 1} lacks gentle framing`);
        recommendations.push('Frame risk factors as gentle suggestions rather than definitive statements');
      }
    });

    return {
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'medium' : 'low',
      recommendations,
    };
  }

  /**
   * Log safety report for monitoring
   */
  private async logSafetyReport(report: SafetyReport): Promise<void> {
    try {
      if (!this.safetySettings.logAllContent) return;

      const existing = await AsyncStorage.getItem(STORAGE_KEYS.SAFETY_REPORTS);
      const reports = existing ? JSON.parse(existing) : [];
      
      // Keep last 100 reports
      const newReports = [...reports, report].slice(-100);
      
      await AsyncStorage.setItem(STORAGE_KEYS.SAFETY_REPORTS, JSON.stringify(newReports));

      // Log blocked content separately if rejected
      if (report.action === 'rejected') {
        await this.logBlockedContent(report);
      }
    } catch (error) {
      console.error('Failed to log safety report:', error);
    }
  }

  /**
   * Log blocked content for analysis
   */
  private async logBlockedContent(report: SafetyReport): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_CONTENT);
      const blocked = existing ? JSON.parse(existing) : [];
      
      const blockedItem = {
        timestamp: report.timestamp,
        contentType: report.contentType,
        issues: report.safetyCheck.issues,
        severity: report.safetyCheck.severity,
        contentPreview: JSON.stringify(report.originalContent).substring(0, 200),
      };
      
      const newBlocked = [...blocked, blockedItem].slice(-50);
      
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_CONTENT, JSON.stringify(newBlocked));
    } catch (error) {
      console.error('Failed to log blocked content:', error);
    }
  }

  /**
   * Get safety statistics
   */
  async getSafetyStats(): Promise<{
    totalReports: number;
    approvedCount: number;
    rejectedCount: number;
    criticalIssues: number;
    recentBlocked: any[];
  }> {
    try {
      const [reportsStr, blockedStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SAFETY_REPORTS),
        AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_CONTENT),
      ]);

      const reports = reportsStr ? JSON.parse(reportsStr) : [];
      const blocked = blockedStr ? JSON.parse(blockedStr) : [];

      const approvedCount = reports.filter((r: SafetyReport) => r.action === 'approved').length;
      const rejectedCount = reports.filter((r: SafetyReport) => r.action === 'rejected').length;
      const criticalIssues = reports.filter((r: SafetyReport) => r.safetyCheck.severity === 'critical').length;

      return {
        totalReports: reports.length,
        approvedCount,
        rejectedCount,
        criticalIssues,
        recentBlocked: blocked.slice(-10),
      };
    } catch (error) {
      console.error('Failed to get safety stats:', error);
      return {
        totalReports: 0,
        approvedCount: 0,
        rejectedCount: 0,
        criticalIssues: 0,
        recentBlocked: [],
      };
    }
  }

  /**
   * Update safety settings
   */
  async updateSafetySettings(settings: Partial<typeof this.safetySettings>): Promise<void> {
    try {
      this.safetySettings = { ...this.safetySettings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SAFETY_SETTINGS, JSON.stringify(this.safetySettings));
    } catch (error) {
      console.error('Failed to update safety settings:', error);
    }
  }

  /**
   * Get current safety settings
   */
  async getSafetySettings(): Promise<typeof this.safetySettings> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAFETY_SETTINGS);
      if (stored) {
        this.safetySettings = { ...this.safetySettings, ...JSON.parse(stored) };
      }
      return this.safetySettings;
    } catch (error) {
      console.error('Failed to get safety settings:', error);
      return this.safetySettings;
    }
  }

  /**
   * Clear safety logs (for privacy)
   */
  async clearSafetyLogs(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.SAFETY_REPORTS),
        AsyncStorage.removeItem(STORAGE_KEYS.BLOCKED_CONTENT),
      ]);
      console.log('Safety logs cleared');
    } catch (error) {
      console.error('Failed to clear safety logs:', error);
    }
  }
}

export const aiSafetyService = new AISafetyService();
