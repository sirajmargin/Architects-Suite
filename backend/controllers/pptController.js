// Enhanced PowerPoint controller with AI integration and S3 storage
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const s3Service = require('../utils/s3Service');
const { v4: uuidv4 } = require('uuid');

// Import AI clients only when needed to avoid circular references
let openai = null;
let anthropic = null;

// Initialize AI clients lazily
const getOpenAI = () => {
    if (!openai && process.env.OPENAI_API_KEY) {
        const { OpenAI } = require('openai');
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
};

const getAnthropic = () => {
    if (!anthropic && process.env.ANTHROPIC_API_KEY) {
        const { Anthropic } = require('@anthropic-ai/sdk');
        anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return anthropic;
};

// Check if AI-enhanced presentations are enabled
const isAIEnhancedPPTEnabled = () => {
    return process.env.FEATURE_AI_ENHANCED_PPT_ENABLED === 'true' && 
           (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
};

const generatePowerPoint = async (req, res) => {
  try {
    const { architecture, diagramXML, sessionId } = req.body;
    
    if (!architecture) {
      return res.status(400).json({ error: 'Architecture data is required' });
    }

    const presentationId = sessionId || uuidv4();
    logger.info(`Generating PowerPoint for session: ${presentationId}`);

    let enhancedContent;
    
    // Use AI to enhance presentation content if available
    if (isAIEnhancedPPTEnabled()) {
      try {
        enhancedContent = await generateAIEnhancedContent(architecture);
        logger.info('AI-enhanced presentation content generated');
      } catch (error) {
        logger.warn('AI enhancement failed, using standard content:', error.message);
        enhancedContent = generateStandardContent(architecture);
      }
    } else {
      enhancedContent = generateStandardContent(architecture);
    }

    // Clean the architecture object to avoid circular references
    const cleanArchitecture = {
      title: architecture?.title || 'Untitled Architecture',
      description: architecture?.description || '',
      components: architecture?.components || [],
      technologies: architecture?.technologies || [],
      patterns: architecture?.patterns || [],
      // Exclude any functions or circular references
    };

    // Generate PowerPoint buffer (mock implementation)
    const pptBuffer = await generatePowerPointBuffer(enhancedContent, cleanArchitecture, diagramXML);
    
    let s3Upload = null;
    let downloadUrl = `/api/ppt/download/${presentationId}`;
    
    // Upload to S3 if enabled
    if (s3Service.isAvailable()) {
      try {
        const fileName = `IT_Architecture_${presentationId}.pptx`;
        s3Upload = await s3Service.uploadPresentation(pptBuffer, fileName, {
          architectureName: architecture.title || 'Untitled Architecture',
          sessionId: presentationId,
          generatedAt: new Date().toISOString(),
          aiEnhanced: isAIEnhancedPPTEnabled()
        });
        
        if (s3Upload.success) {
          downloadUrl = s3Upload.url;
          logger.info(`PowerPoint uploaded to S3: ${s3Upload.key}`);
        }
      } catch (error) {
        logger.warn('S3 upload failed, using local storage:', error.message);
      }
    }

    res.json({
      success: true,
      message: 'PowerPoint generated successfully',
      metadata: {
        slides: enhancedContent?.slides || [],
        aiGenerated: enhancedContent?.aiGenerated || false,
        source: enhancedContent?.source || 'standard'
      },
      downloadUrl,
      sessionId: presentationId,
      s3Storage: !!s3Upload?.success,
      aiEnhanced: isAIEnhancedPPTEnabled(),
      fileSize: pptBuffer.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating PowerPoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate PowerPoint',
      details: error.message
    });
  }
};

const updateDiagram = async (req, res) => {
  try {
    const { sessionId, diagramXML } = req.body;
    
    if (!sessionId || !diagramXML) {
      return res.status(400).json({ error: 'Session ID and diagram XML are required' });
    }

    logger.info(`Updating PowerPoint diagram for session: ${sessionId}`);

    // Mock diagram update in PowerPoint
    res.json({
      success: true,
      message: 'PowerPoint diagram updated successfully',
      sessionId,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error updating PowerPoint diagram:', error);
    res.status(500).json({ 
      error: 'Failed to update PowerPoint diagram',
      details: error.message
    });
  }
};

const downloadPresentation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    logger.info(`Download requested for session: ${sessionId}`);

    // Check if file exists in S3 first
    if (s3Service.isAvailable()) {
      try {
        const fileName = `IT_Architecture_${sessionId}.pptx`;
        const key = `presentations/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;
        
        // Generate pre-signed URL for secure download
        const presignedUrl = await s3Service.getPresignedUrl(s3Service.buckets?.presentations || process.env.AWS_S3_PPT_BUCKET, key, 3600);
        
        return res.json({
          success: true,
          downloadUrl: presignedUrl,
          sessionId,
          filename: fileName,
          source: 's3',
          expiresIn: '1 hour'
        });
      } catch (error) {
        logger.warn('S3 download failed, trying local storage:', error.message);
      }
    }

    // Fallback to local file serving
    const localFilePath = path.join(__dirname, '../uploads', `IT_Architecture_${sessionId}.pptx`);
    
    if (fs.existsSync(localFilePath)) {
      res.download(localFilePath, `IT_Architecture_${sessionId}.pptx`, (error) => {
        if (error) {
          logger.error('Error serving local file:', error);
          res.status(500).json({ error: 'Failed to download file' });
        }
      });
    } else {
      res.status(404).json({
        error: 'Presentation not found',
        sessionId,
        message: 'The requested presentation file does not exist'
      });
    }

  } catch (error) {
    logger.error('Error downloading presentation:', error);
    res.status(500).json({ 
      error: 'Failed to download presentation',
      details: error.message
    });
  }
};

const uploadTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No template file uploaded' });
    }

    const templateInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    logger.info(`Template uploaded: ${templateInfo.originalName}`);

    res.json({
      success: true,
      message: 'Template uploaded successfully',
      template: templateInfo
    });

  } catch (error) {
    logger.error('Error uploading template:', error);
    res.status(500).json({ 
      error: 'Failed to upload template',
      details: error.message
    });
  }
};

/**
 * Generate AI-enhanced presentation content
 */
const generateAIEnhancedContent = async (architecture) => {
  const systemPrompt = `You are a Senior Enterprise Architect creating executive-level PowerPoint presentations.
Generate comprehensive, professional presentation content that would impress C-level executives.

Return structured content for these slides:
1. Executive Summary
2. Business Value & ROI
3. Architecture Overview
4. Technology Strategy
5. Implementation Roadmap
6. Risk Assessment
7. Success Metrics

Focus on business outcomes, strategic value, and executive-level insights.`;

  const userPrompt = `Create executive presentation content for this architecture:
Title: ${architecture.title}
Description: ${architecture.description}
Components: ${architecture.components?.map(c => c.name).join(', ')}
Technologies: ${architecture.technologies?.join(', ')}
Patterns: ${architecture.patterns?.join(', ')}`;

  try {
    let response;
    
    const openaiClient = getOpenAI();
    const anthropicClient = getAnthropic();
    
    if (openaiClient) {
      const completion = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 3000,
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      });
      response = completion.choices[0].message.content;
    } else if (anthropicClient) {
      const completion = await anthropicClient.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 3000,
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ]
      });
      response = completion.content[0].text;
    }

    return parseAIContentToSlides(response, architecture);
  } catch (error) {
    logger.error('AI content generation failed:', error);
    throw error;
  }
};

/**
 * Generate standard presentation content
 */
const generateStandardContent = (architecture) => {
  return {
    slides: [
      {
        title: 'Executive Summary',
        content: `Enterprise architecture solution: ${architecture.title || 'Untitled Architecture'}

Key Benefits:
• Scalable and maintainable design
• Modern technology stack
• Industry best practices
• Future-proof architecture`
      },
      {
        title: 'Architecture Overview',
        content: architecture.description || 'Enterprise-grade architecture solution designed for scalability and performance'
      },
      {
        title: 'System Components',
        content: architecture.components ? 
          architecture.components.map(c => `• ${c.name}: ${c.description || c.type}`).join('\n') :
          'Core system components and their responsibilities'
      },
      {
        title: 'Technology Stack',
        content: architecture.technologies ? 
          `Technologies:\n• ${architecture.technologies.join('\n• ')}` :
          'Modern, enterprise-grade technology stack'
      },
      {
        title: 'Architecture Patterns',
        content: architecture.patterns ? 
          `Design Patterns:\n• ${architecture.patterns.join('\n• ')}` :
          'Industry-standard architecture patterns and best practices'
      },
      {
        title: 'Implementation Roadmap',
        content: 'Phase 1: Foundation Setup\nPhase 2: Core Implementation\nPhase 3: Integration & Testing\nPhase 4: Deployment & Optimization'
      }
    ],
    aiGenerated: false
  };
};

/**
 * Parse AI response into structured slide content
 */
const parseAIContentToSlides = (aiResponse, architecture) => {
  // This is a simplified parser - in production, you'd want more sophisticated parsing
  const slides = [
    {
      title: 'Executive Summary',
      content: aiResponse ? aiResponse.substring(0, 500) + '...' : 'AI-generated executive summary'
    },
    {
      title: 'Architecture Overview', 
      content: architecture?.description || 'AI-generated architecture overview'
    },
    {
      title: 'Technology Strategy',
      content: architecture?.technologies ? 
        `Strategic Technology Choices:\n• ${architecture.technologies.join('\n• ')}` :
        'AI-recommended technology strategy'
    },
    {
      title: 'Implementation Approach',
      content: 'AI-optimized implementation roadmap based on industry best practices'
    }
  ];
  
  return { 
    slides, 
    aiGenerated: true, 
    source: process.env.OPENAI_API_KEY ? 'openai' : (process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'mock')
  };
};

/**
 * Generate PowerPoint buffer (mock implementation)
 */
const generatePowerPointBuffer = async (content, architecture, diagramXML) => {
  // In real implementation, this would use officegen or similar library
  // For now, return a mock buffer
  const mockPPTContent = JSON.stringify({
    metadata: {
      title: architecture?.title || 'Untitled Architecture',
      author: 'IT Architects Suite',
      createdAt: new Date().toISOString(),
      slides: content?.slides?.length || 0
    },
    slides: content?.slides || [],
    diagram: diagramXML ? 'included' : 'not included',
    aiGenerated: content?.aiGenerated || false
  }, null, 2);
  
  return Buffer.from(mockPPTContent, 'utf8');
};

module.exports = {
  generatePowerPoint,
  updateDiagram,
  downloadPresentation,
  uploadTemplate
};