import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, diagramType, enhancementType } = body;
    
    // AI-powered diagram enhancement
    const enhancement = await enhanceDiagram(code, diagramType, enhancementType);
    
    return NextResponse.json({
      success: true,
      enhancedCode: enhancement.enhancedCode,
      improvements: enhancement.improvements,
      explanation: enhancement.explanation,
    });
  } catch (error) {
    console.error('Error enhancing diagram:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to enhance diagram',
    }, { status: 500 });
  }
}

async function enhanceDiagram(code: string, diagramType: string, enhancementType: string) {
  try {
    // This would integrate with AI services for intelligent enhancement
    const enhancementPrompt = `
      Please enhance the following ${diagramType} diagram code:
      
      ${code}
      
      Enhancement type: ${enhancementType}
      
      Provide:
      1. Enhanced code with improvements
      2. List of specific improvements made
      3. Explanation of the enhancements
    `;
    
    // Mock AI enhancement - in production, this would call actual AI service
    let enhancedCode = code;
    const improvements = [];
    let explanation = '';
    
    switch (enhancementType) {
      case 'improve':
        enhancedCode = improveReadability(code, diagramType);
        improvements.push('Improved node naming', 'Added visual clarity', 'Optimized layout');
        explanation = 'Enhanced the diagram for better readability and visual appeal.';
        break;
        
      case 'optimize':
        enhancedCode = optimizeStructure(code, diagramType);
        improvements.push('Reduced complexity', 'Simplified connections', 'Improved flow');
        explanation = 'Optimized the diagram structure for better performance and clarity.';
        break;
        
      case 'standardize':
        enhancedCode = standardizeFormat(code, diagramType);
        improvements.push('Applied naming conventions', 'Standardized syntax', 'Added best practices');
        explanation = 'Standardized the diagram according to industry best practices.';
        break;
        
      default:
        enhancedCode = addDocumentation(code, diagramType);
        improvements.push('Added comments', 'Improved descriptions', 'Enhanced documentation');
        explanation = 'Added comprehensive documentation to the diagram.';
    }
    
    return {
      enhancedCode,
      improvements,
      explanation
    };
  } catch (error) {
    console.error('Enhancement error:', error);
    return {
      enhancedCode: code,
      improvements: [],
      explanation: 'Enhancement failed, returning original code.'
    };
  }
}

function improveReadability(code: string, diagramType: string): string {
  let enhanced = code;
  
  // Add proper spacing and formatting
  enhanced = enhanced.replace(/-->/g, ' --> ');
  enhanced = enhanced.replace(/\|/g, ' | ');
  
  // Add comments for complex sections
  if (diagramType === 'flowchart') {
    if (!enhanced.includes('%%')) {
      enhanced = `%% ${diagramType} diagram\n${enhanced}`;
    }
    
    // Improve node descriptions
    enhanced = enhanced.replace(/\[(\w+)\]/g, '[$1 Process]');
    enhanced = enhanced.replace(/\{(\w+)\}/g, '{$1 Decision}');
  }
  
  return enhanced;
}

function optimizeStructure(code: string, diagramType: string): string {
  let optimized = code;
  
  // Remove redundant connections
  const lines = optimized.split('\n');
  const uniqueLines = [...new Set(lines)];
  optimized = uniqueLines.join('\n');
  
  // Simplify complex branching
  if (diagramType === 'flowchart') {
    // Group related nodes
    optimized = optimized.replace(/(\w+) --> (\w+)\n\1 --> (\w+)/g, '$1 --> $2\n$1 --> $3');
  }
  
  return optimized;
}

function standardizeFormat(code: string, diagramType: string): string {
  let standardized = code;
  
  // Apply consistent naming conventions
  if (diagramType === 'flowchart') {
    // Ensure proper diagram declaration
    if (!standardized.includes('flowchart')) {
      standardized = `flowchart TD\n${standardized}`;
    }
    
    // Standardize node naming (PascalCase)
    standardized = standardized.replace(/\b[a-z]\w*/g, (match) => {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
  }
  
  if (diagramType === 'sequence') {
    // Ensure proper diagram declaration
    if (!standardized.includes('sequenceDiagram')) {
      standardized = `sequenceDiagram\n${standardized}`;
    }
    
    // Standardize participant declarations
    const participants = [...new Set(standardized.match(/\b[A-Z]\w*/g) || [])];
    let participantDeclarations = participants.map(p => `    participant ${p}`).join('\n');
    
    if (participantDeclarations) {
      standardized = standardized.replace('sequenceDiagram', `sequenceDiagram\n${participantDeclarations}`);
    }
  }
  
  return standardized;
}

function addDocumentation(code: string, diagramType: string): string {
  let documented = code;
  
  // Add header comment
  const header = `%% ${diagramType.toUpperCase()} DIAGRAM
%% Generated by Architects Suite
%% Last updated: ${new Date().toISOString().split('T')[0]}
%%

`;
  
  documented = header + documented;
  
  // Add inline comments for complex sections
  const lines = documented.split('\n');
  const documentedLines = lines.map(line => {
    const trimmedLine = line.trim();
    
    // Add comments for decision points
    if (trimmedLine.includes('{') && !trimmedLine.includes('%%')) {
      return line + ' %% Decision point';
    }
    
    // Add comments for endpoints
    if (trimmedLine.includes('[End]') || trimmedLine.includes('[Finish]')) {
      return line + ' %% Process endpoint';
    }
    
    return line;
  });
  
  return documentedLines.join('\n');
}