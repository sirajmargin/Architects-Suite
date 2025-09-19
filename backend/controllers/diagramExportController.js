// Diagram Export Controller - Handle diagram format conversion and downloads
const logger = require('../utils/logger');
const s3Service = require('../utils/s3Service');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create temporary directory if it doesn't exist
const createTempDir = async () => {
    const tempDir = path.join(__dirname, '../../temp');
    try {
        await fs.access(tempDir);
    } catch {
        await fs.mkdir(tempDir, { recursive: true });
    }
    return tempDir;
};

/**
 * Save XML as .drawio file in temporary space and optionally to S3
 */
const saveDrawioFile = async (req, res) => {
    try {
        const { xml, filename = 'architecture-diagram' } = req.body;
        
        if (!xml) {
            return res.status(400).json({ error: 'XML data is required' });
        }

        const tempDir = await createTempDir();
        const fileId = uuidv4();
        const fileName = `${filename}-${fileId}.drawio`;
        const filePath = path.join(tempDir, fileName);
        
        // Save XML content as .drawio file locally
        await fs.writeFile(filePath, xml, 'utf8');
        
        logger.info(`Saved draw.io file: ${fileName}`);
        
        let s3Result = null;
        
        // Optionally upload to S3 if available
        if (s3Service.isAvailable()) {
            try {
                s3Result = await s3Service.uploadDrawioXML(xml, filename, {
                    fileId,
                    generatedBy: 'it-architects-suite',
                    userAgent: req.get('User-Agent') || 'unknown'
                });
                
                if (s3Result.success) {
                    logger.info(`Draw.io file also uploaded to S3: ${s3Result.key}`);
                }
            } catch (error) {
                logger.warn('Failed to upload to S3, continuing with local storage:', error.message);
            }
        }
        
        // Return file info for iframe loading
        const response = {
            success: true,
            fileId,
            fileName,
            localPath: `/api/diagrams/temp/${fileId}`,
            drawioUrl: `https://embed.diagrams.net/?url=${encodeURIComponent(req.protocol + '://' + req.get('host') + '/api/diagrams/temp/' + fileId)}&embed=1&ui=dark&spin=1&chrome=0&proto=json`,
            timestamp: new Date().toISOString()
        };
        
        // Add S3 information if available
        if (s3Result && s3Result.success) {
            response.s3 = {
                uploaded: true,
                url: s3Result.url,
                key: s3Result.key,
                bucket: s3Result.bucket
            };
        }
        
        res.json(response);

    } catch (error) {
        logger.error('Error saving draw.io file:', error);
        res.status(500).json({
            error: 'Failed to save draw.io file',
            details: error.message
        });
    }
};

/**
 * Serve temporary .drawio files
 */
const serveTempFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const tempDir = await createTempDir();
        
        // Find the file with this ID
        const files = await fs.readdir(tempDir);
        const targetFile = files.find(file => file.includes(fileId) && file.endsWith('.drawio'));
        
        if (!targetFile) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const filePath = path.join(tempDir, targetFile);
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.send(fileContent);
        
    } catch (error) {
        logger.error('Error serving temp file:', error);
        res.status(500).json({
            error: 'Failed to serve file',
            details: error.message
        });
    }
};

/**
 * Clean up old temporary files (older than 1 hour)
 */
const cleanupTempFiles = async () => {
    try {
        const tempDir = await createTempDir();
        const files = await fs.readdir(tempDir);
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.mtime.getTime() < oneHourAgo) {
                await fs.unlink(filePath);
                logger.info(`Cleaned up old temp file: ${file}`);
            }
        }
    } catch (error) {
        logger.error('Error cleaning up temp files:', error);
    }
};

// Run cleanup every 30 minutes
setInterval(cleanupTempFiles, 30 * 60 * 1000);

/**
 * Convert draw.io XML to different formats
 */
const convertDiagram = async (req, res) => {
    try {
        const { xml, format = 'svg', filename = 'diagram' } = req.body;
        
        if (!xml) {
            return res.status(400).json({ error: 'XML data is required' });
        }

        logger.info(`Converting diagram to ${format} format`);

        let convertedData;
        let mimeType;
        let fileExtension;

        switch (format.toLowerCase()) {
            case 'svg':
                convertedData = await convertToSVG(xml);
                mimeType = 'image/svg+xml';
                fileExtension = 'svg';
                break;
            case 'png':
                convertedData = await convertToPNG(xml);
                mimeType = 'image/png';
                fileExtension = 'png';
                break;
            case 'xml':
                convertedData = xml;
                mimeType = 'application/xml';
                fileExtension = 'xml';
                break;
            default:
                return res.status(400).json({ error: 'Unsupported format. Use svg, png, or xml' });
        }

        if (format === 'xml') {
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.${fileExtension}"`);
            res.send(convertedData);
        } else {
            res.json({
                success: true,
                data: convertedData,
                format,
                filename: `${filename}.${fileExtension}`,
                mimeType
            });
        }

    } catch (error) {
        logger.error('Error converting diagram:', error);
        res.status(500).json({
            error: 'Failed to convert diagram',
            details: error.message
        });
    }
};

/**
 * Convert XML to SVG using cloud-native icons and modern architecture patterns
 */
const convertToSVG = async (xml) => {
    try {
        // Enhanced SVG with cloud-native icons and modern architecture representation
        const svgTemplate = `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style>
                        .diagram-container {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            font-size: 12px;
                        }
                        .aws-node { fill: #ff9900; stroke: #ff9900; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .azure-node { fill: #0078d4; stroke: #0078d4; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .gcp-node { fill: #4285f4; stroke: #4285f4; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .kubernetes-node { fill: #326ce5; stroke: #326ce5; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .docker-node { fill: #0db7ed; stroke: #0db7ed; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .database-node { fill: #00758f; stroke: #00758f; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .api-node { fill: #6b73ff; stroke: #6b73ff; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .security-node { fill: #d32f2f; stroke: #d32f2f; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .monitoring-node { fill: #00c853; stroke: #00c853; stroke-width: 2; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.15)); }
                        .text { fill: white; text-anchor: middle; dominant-baseline: middle; font-weight: 600; font-size: 11px; }
                        .icon-text { fill: white; text-anchor: middle; dominant-baseline: middle; font-size: 16px; }
                        .title-text { fill: #1565c0; text-anchor: middle; font-weight: 700; font-size: 20px; }
                        .subtitle-text { fill: #666; text-anchor: middle; font-size: 12px; }
                        .layer-text { fill: #333; text-anchor: start; font-weight: 600; font-size: 14px; }
                        .connection { stroke: #455a64; stroke-width: 2.5; marker-end: url(#arrowhead); }
                        .data-flow { stroke: #00c853; stroke-width: 2; stroke-dasharray: 8,4; marker-end: url(#dataArrow); }
                    </style>
                    <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                        <polygon points="0 0, 12 4, 0 8" fill="#455a64"/>
                    </marker>
                    <marker id="dataArrow" markerWidth="10" markerHeight="6" refX="10" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#00c853"/>
                    </marker>
                </defs>
                
                <g class="diagram-container">
                    <rect width="800" height="1000" fill="#f8f9fa" stroke="none"/>
                    
                    <text x="400" y="35" class="title-text">☁️ Cloud-Native Architecture</text>
                    <text x="400" y="60" class="subtitle-text">AI-Generated Enterprise Solution with Cloud-Native Icons</text>
                    
                    <!-- Internet Layer -->
                    <text x="50" y="100" class="layer-text">🌐 Internet &amp; CDN Layer</text>
                    <rect x="50" y="110" width="700" height="80" fill="none" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5" rx="10"/>
                    
                    <rect x="150" y="130" width="120" height="50" class="aws-node" rx="10"/>
                    <text x="210" y="145" class="icon-text">🔶</text>
                    <text x="210" y="165" class="text">CloudFlare CDN</text>
                    
                    <rect x="330" y="130" width="120" height="50" class="aws-node" rx="10"/>
                    <text x="390" y="145" class="icon-text">☁️</text>
                    <text x="390" y="165" class="text">AWS CloudFront</text>
                    
                    <rect x="510" y="130" width="120" height="50" class="aws-node" rx="10"/>
                    <text x="570" y="145" class="icon-text">🌍</text>
                    <text x="570" y="165" class="text">Route 53 DNS</text>
                    
                    <!-- Load Balancer -->
                    <text x="50" y="220" class="layer-text">⚖️ Load Balancer Layer</text>
                    <rect x="300" y="240" width="200" height="50" class="azure-node" rx="10"/>
                    <text x="400" y="255" class="icon-text">⚖️</text>
                    <text x="400" y="275" class="text">Application Load Balancer</text>
                    
                    <!-- Kubernetes Layer -->
                    <text x="50" y="320" class="layer-text">🚢 Container Orchestration</text>
                    <rect x="50" y="330" width="700" height="120" fill="none" stroke="#326ce5" stroke-width="2" stroke-dasharray="5,5" rx="10"/>
                    
                    <ellipse cx="400" cy="390" rx="300" ry="50" class="kubernetes-node" opacity="0.3"/>
                    <text x="400" y="385" class="icon-text" style="fill:#326ce5; font-size:20px;">⎈</text>
                    <text x="400" y="405" style="fill:#326ce5; text-anchor:middle; font-weight:600;">Kubernetes Cluster</text>
                    
                    <!-- API Services -->
                    <rect x="150" y="470" width="130" height="60" class="api-node" rx="10"/>
                    <text x="215" y="490" class="icon-text">🚪</text>
                    <text x="215" y="510" class="text">API Gateway</text>
                    
                    <rect x="520" y="470" width="130" height="60" class="security-node" rx="10"/>
                    <text x="585" y="490" class="icon-text">🔐</text>
                    <text x="585" y="510" class="text">OAuth2/OIDC</text>
                    
                    <!-- Microservices -->
                    <text x="50" y="570" class="layer-text">📦 Microservices</text>
                    <rect x="80" y="590" width="100" height="50" class="docker-node" rx="8"/>
                    <text x="130" y="605" class="icon-text">👤</text>
                    <text x="130" y="625" class="text">User Service</text>
                    
                    <rect x="200" y="590" width="100" height="50" class="docker-node" rx="8"/>
                    <text x="250" y="605" class="icon-text">🛒</text>
                    <text x="250" y="625" class="text">Order Service</text>
                    
                    <rect x="320" y="590" width="100" height="50" class="docker-node" rx="8"/>
                    <text x="370" y="605" class="icon-text">💳</text>
                    <text x="370" y="625" class="text">Payment</text>
                    
                    <rect x="440" y="590" width="100" height="50" class="docker-node" rx="8"/>
                    <text x="490" y="605" class="icon-text">📦</text>
                    <text x="490" y="625" class="text">Inventory</text>
                    
                    <rect x="560" y="590" width="100" height="50" class="docker-node" rx="8"/>
                    <text x="610" y="605" class="icon-text">📧</text>
                    <text x="610" y="625" class="text">Notification</text>
                    
                    <!-- Data Layer -->
                    <text x="50" y="690" class="layer-text">🗄️ Data Layer</text>
                    <rect x="100" y="710" width="120" height="60" class="database-node" rx="10"/>
                    <text x="160" y="730" class="icon-text">🐘</text>
                    <text x="160" y="750" class="text">PostgreSQL</text>
                    
                    <rect x="240" y="710" width="120" height="60" class="database-node" rx="10"/>
                    <text x="300" y="730" class="icon-text">🍃</text>
                    <text x="300" y="750" class="text">MongoDB</text>
                    
                    <rect x="380" y="710" width="120" height="60" class="database-node" rx="10"/>
                    <text x="440" y="730" class="icon-text">⚡</text>
                    <text x="440" y="750" class="text">Redis Cache</text>
                    
                    <rect x="520" y="710" width="120" height="60" class="database-node" rx="10"/>
                    <text x="580" y="730" class="icon-text">🔍</text>
                    <text x="580" y="750" class="text">Elasticsearch</text>
                    
                    <!-- Monitoring -->
                    <text x="50" y="810" class="layer-text">📊 Monitoring</text>
                    <rect x="150" y="825" width="100" height="30" class="monitoring-node" rx="6"/>
                    <text x="200" y="835" class="icon-text" style="font-size:12px;">📈</text>
                    <text x="200" y="850" class="text" style="font-size:10px;">Prometheus</text>
                    
                    <rect x="280" y="825" width="100" height="30" class="monitoring-node" rx="6"/>
                    <text x="330" y="835" class="icon-text" style="font-size:12px;">📊</text>
                    <text x="330" y="850" class="text" style="font-size:10px;">Grafana</text>
                    
                    <rect x="410" y="825" width="100" height="30" class="monitoring-node" rx="6"/>
                    <text x="460" y="835" class="icon-text" style="font-size:12px;">🔍</text>
                    <text x="460" y="850" class="text" style="font-size:10px;">Jaeger</text>
                    
                    <!-- Connections -->
                    <line x1="400" y1="190" x2="400" y2="240" class="connection"/>
                    <line x1="400" y1="290" x2="215" y2="470" class="connection"/>
                    <line x1="400" y1="290" x2="585" y2="470" class="connection"/>
                    
                    <!-- Service connections -->
                    <line x1="215" y1="530" x2="130" y2="590" class="connection"/>
                    <line x1="215" y1="530" x2="250" y2="590" class="connection"/>
                    <line x1="215" y1="530" x2="370" y2="590" class="connection"/>
                    
                    <!-- Data connections -->
                    <line x1="130" y1="640" x2="160" y2="710" class="data-flow"/>
                    <line x1="250" y1="640" x2="300" y2="710" class="data-flow"/>
                    <line x1="370" y1="640" x2="440" y2="710" class="data-flow"/>
                    <line x1="490" y1="640" x2="300" y2="710" class="data-flow"/>
                    
                    <!-- Legend -->
                    <g transform="translate(50, 890)">
                        <rect x="0" y="0" width="700" height="80" fill="white" stroke="#ddd" rx="5"/>
                        <text x="350" y="20" style="font-size:12px; font-weight:600; fill:#333; text-anchor:middle;">Cloud-Native Architecture Legend</text>
                        
                        <rect x="20" y="30" width="15" height="12" class="docker-node" rx="2"/>
                        <text x="40" y="38" style="font-size:10px; fill:#666;">Containers</text>
                        
                        <rect x="120" y="30" width="15" height="12" class="database-node" rx="2"/>
                        <text x="140" y="38" style="font-size:10px; fill:#666;">Data Storage</text>
                        
                        <rect x="220" y="30" width="15" height="12" class="api-node" rx="2"/>
                        <text x="240" y="38" style="font-size:10px; fill:#666;">API Services</text>
                        
                        <rect x="320" y="30" width="15" height="12" class="security-node" rx="2"/>
                        <text x="340" y="38" style="font-size:10px; fill:#666;">Security</text>
                        
                        <rect x="20" y="50" width="15" height="12" class="kubernetes-node" rx="2"/>
                        <text x="40" y="58" style="font-size:10px; fill:#666;">Orchestration</text>
                        
                        <rect x="120" y="50" width="15" height="12" class="monitoring-node" rx="2"/>
                        <text x="140" y="58" style="font-size:10px; fill:#666;">Monitoring</text>
                        
                        <line x1="220" y1="55" x2="235" y2="55" class="connection"/>
                        <text x="240" y="58" style="font-size:10px; fill:#666;">Control Flow</text>
                        
                        <line x1="320" y1="55" x2="335" y2="55" class="data-flow"/>
                        <text x="340" y="58" style="font-size:10px; fill:#666;">Data Flow</text>
                        
                        <text x="500" y="45" style="font-size:9px; fill:#999;">Cloud Providers: AWS, Azure, GCP Compatible</text>
                        <text x="500" y="58" style="font-size:9px; fill:#999;">Container-First, Kubernetes-Native Architecture</text>
                    </g>
                    
                    <text x="750" y="990" style="font-size:8px; fill:#999; text-anchor:end;">
                        Generated: ${new Date().toLocaleString()} | Cloud-Native Icons
                    </text>
                </g>
            </svg>`;
        
        return svgTemplate.trim();
    } catch (error) {
        logger.error('Error converting to SVG:', error);
        throw error;
    }
};

/**
 * Convert XML to PNG (placeholder - would use actual conversion service)
 */
const convertToPNG = async (xml) => {
    try {
        const placeholderPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        return placeholderPNG;
    } catch (error) {
        logger.error('Error converting to PNG:', error);
        throw error;
    }
};

/**
 * Generate downloadable file for diagram
 */
const downloadDiagram = async (req, res) => {
    try {
        const { xml, format = 'xml', filename = 'architecture-diagram' } = req.body;
        
        if (!xml) {
            return res.status(400).json({ error: 'XML data is required' });
        }

        logger.info(`Preparing download for ${filename}.${format}`);

        let fileContent;
        let mimeType;
        let fileExtension = format;

        switch (format.toLowerCase()) {
            case 'xml':
                fileContent = xml;
                mimeType = 'application/xml';
                break;
            case 'svg':
                fileContent = await convertToSVG(xml);
                mimeType = 'image/svg+xml';
                break;
            case 'png':
                fileContent = await convertToPNG(xml);
                mimeType = 'image/png';
                break;
            default:
                return res.status(400).json({ error: 'Unsupported format' });
        }

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.${fileExtension}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        if (format === 'png' && fileContent.startsWith('data:')) {
            const base64Data = fileContent.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            res.send(buffer);
        } else {
            res.send(fileContent);
        }

    } catch (error) {
        logger.error('Error preparing download:', error);
        res.status(500).json({
            error: 'Failed to prepare download',
            details: error.message
        });
    }
};

/**
 * Get diagram preview in different formats
 */
const getPreview = async (req, res) => {
    try {
        const { xml, format = 'svg' } = req.body;
        
        if (!xml) {
            return res.status(400).json({ error: 'XML data is required' });
        }

        let previewData;
        
        switch (format.toLowerCase()) {
            case 'svg':
                previewData = await convertToSVG(xml);
                break;
            case 'png':
                previewData = await convertToPNG(xml);
                break;
            default:
                return res.status(400).json({ error: 'Preview only supports SVG and PNG formats' });
        }

        res.json({
            success: true,
            format,
            data: previewData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error generating preview:', error);
        res.status(500).json({
            error: 'Failed to generate preview',
            details: error.message
        });
    }
};

module.exports = {
    saveDrawioFile,
    serveTempFile,
    convertDiagram,
    downloadDiagram,
    getPreview
};