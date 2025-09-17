import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, diagramType, syntax } = body;
    
    // AI-powered diagram code analysis
    const analysis = await analyzeDiagramCode(code, diagramType, syntax);
    
    return NextResponse.json({
      success: true,
      errors: analysis.errors,
      suggestions: analysis.suggestions,
      metrics: analysis.metrics,
    });
  } catch (error) {
    console.error('Error analyzing diagram code:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze diagram code',
    }, { status: 500 });
  }
}

async function analyzeDiagramCode(code: string, diagramType: string, syntax: string) {
  try {
    // This would integrate with AI services like OpenAI, Anthropic for intelligent analysis
    const analysisPrompt = `
      Analyze the following ${diagramType} diagram code written in ${syntax} syntax:
      
      ${code}
      
      Please provide:
      1. Syntax errors (if any)
      2. Improvement suggestions
      3. Best practice recommendations
      4. Optimization opportunities
      
      Return as JSON with errors, suggestions, and metrics arrays.
    `;
    
    // Mock AI response - in production, this would call actual AI service
    const mockAnalysis = {
      errors: detectSyntaxErrors(code, syntax),
      suggestions: generateSuggestions(code, diagramType),
      metrics: {
        complexity: calculateComplexity(code),
        readability: assessReadability(code),
        bestPractices: checkBestPractices(code, diagramType)
      }
    };
    
    return mockAnalysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      errors: [],
      suggestions: [],
      metrics: { complexity: 'low', readability: 'good', bestPractices: 80 }
    };
  }
}

function detectSyntaxErrors(code: string, syntax: string): Array<{
  line: number;
  message: string;
  severity: string;
}> {
  const errors: Array<{
    line: number;
    message: string;
    severity: string;
  }> = [];
  const lines = code.split('\n');
  
  // Basic syntax validation for mermaid
  if (syntax === 'mermaid') {
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for common syntax issues
      if (trimmedLine.includes('-->') && !trimmedLine.match(/\w+\s*-->\s*\w+/)) {
        errors.push({
          line: index + 1,
          message: 'Invalid arrow syntax. Use: A --> B',
          severity: 'error'
        });
      }
      
      if (trimmedLine.includes('{') && !trimmedLine.includes('}')) {
        errors.push({
          line: index + 1,
          message: 'Unclosed bracket',
          severity: 'warning'
        });
      }
    });
  }
  
  return errors;
}

function generateSuggestions(code: string, diagramType: string): any[] {
  const suggestions = [];
  
  // AI-powered suggestions based on diagram type and content
  if (diagramType === 'flowchart') {
    if (!code.includes('flowchart')) {
      suggestions.push({
        title: 'Add diagram type declaration',
        description: 'Start with "flowchart TD" or "flowchart LR" to specify direction',
        type: 'insert',
        code: 'flowchart TD\n',
        confidence: 0.9
      });
    }
    
    if (code.includes('-->') && !code.includes('[') && !code.includes('(')) {
      suggestions.push({
        title: 'Add node shapes',
        description: 'Use [square], (round), or {diamond} shapes for better visual clarity',
        type: 'enhancement',
        confidence: 0.7
      });
    }
  }
  
  if (diagramType === 'sequence') {
    if (!code.includes('sequenceDiagram')) {
      suggestions.push({
        title: 'Add sequence diagram declaration',
        description: 'Start with "sequenceDiagram" to properly initialize the diagram',
        type: 'insert',
        code: 'sequenceDiagram\n',
        confidence: 0.95
      });
    }
  }
  
  // General suggestions
  if (code.length < 50) {
    suggestions.push({
      title: 'Add more detail',
      description: 'Consider adding more nodes and connections to make the diagram more informative',
      type: 'enhancement',
      confidence: 0.6
    });
  }
  
  return suggestions;
}

function calculateComplexity(code: string): string {
  const lines = code.split('\n').length;
  const connections = (code.match(/-->|->|->>|-->>|\|\|/g) || []).length;
  const nodes = (code.match(/\[[^\]]+\]|\([^)]+\)|\{[^}]+\}/g) || []).length;
  
  const complexityScore = lines + connections * 2 + nodes;
  
  if (complexityScore < 20) return 'low';
  if (complexityScore < 50) return 'medium';
  return 'high';
}

function assessReadability(code: string): string {
  const lines = code.split('\n');
  const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const hasComments = code.includes('%%') || code.includes('//');
  const hasProperIndentation = lines.every(line => line.startsWith('    ') || line.trim() === '');
  
  let score = 0;
  if (averageLineLength < 80) score += 30;
  if (hasComments) score += 30;
  if (hasProperIndentation) score += 40;
  
  if (score > 70) return 'excellent';
  if (score > 50) return 'good';
  if (score > 30) return 'fair';
  return 'poor';
}

function checkBestPractices(code: string, diagramType: string): number {
  let score = 100;
  
  // Check for common best practices
  if (!code.includes('%%')) score -= 10; // No comments
  if (code.length > 500) score -= 15; // Too complex
  
  // Diagram-specific best practices
  if (diagramType === 'flowchart') {
    if (!code.includes('[Start]') && !code.includes('[End]')) score -= 20;
  }
  
  if (diagramType === 'sequence') {
    if (!code.includes('participant')) score -= 15;
  }
  
  return Math.max(0, score);
}