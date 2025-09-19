// IT Architects Suite - Enhanced with Real AI Integration and Draw.io
class ITArchitectsSuiteEnhanced {
    constructor() {
        this.config = {
            apiBaseUrl: 'http://localhost:3001/api',
            drawioBaseUrl: 'https://app.diagrams.net',
            socket: null,
            sessionId: this.generateSessionId()
        };
        
        this.state = {
            currentDiagram: null,
            currentArchitecture: null,
            isProcessing: false,
            uploadedTemplate: null,
            currentDiagramXML: null
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeSocket();
        this.setupAnimations();
        this.loadUserData();
        await this.checkBackendHealth();
    }

    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/health`);
            const health = await response.json();
            
            if (health.status === 'healthy') {
                this.showNotification('✅ AI Services Connected', 'success');
                console.log('Backend services:', health.services);
            } else {
                this.showNotification('⚠️ Backend services unavailable', 'warning');
            }
        } catch (error) {
            console.warn('Backend not available, running in demo mode');
            this.showNotification('⚠️ Running in demo mode - start backend for full AI features', 'warning');
        }
    }

    initializeSocket() {
        try {
            this.config.socket = io('http://localhost:3001');
            
            this.config.socket.on('connect', () => {
                console.log('Connected to real-time server');
                this.config.socket.emit('join-session', this.config.sessionId);
            });
            
            this.config.socket.on('diagram-updated', (data) => {
                this.handleDiagramUpdate(data);
            });
            
            this.config.socket.on('ai-status', (data) => {
                this.updateAIStatus(data);
            });
            
        } catch (error) {
            console.warn('Socket.io not available, continuing without real-time features');
        }
    }

    setupEventListeners() {
        // AI Generate button with real backend integration
        const aiGenerateBtn = document.querySelector('.ai-generate-btn');
        if (aiGenerateBtn) {
            aiGenerateBtn.addEventListener('click', () => this.handleAIGeneration());
        }

        // Suggestion pills
        document.querySelectorAll('.suggestion-pill').forEach(pill => {
            pill.addEventListener('click', () => this.applySuggestion(pill.textContent));
        });

        // File upload for PowerPoint templates
        const fileInput = document.getElementById('ppt-template');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleTemplateUpload(e));
        }

        // AI-powered buttons with real functionality
        document.querySelectorAll('.ai-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAIAction(btn, e));
        });

        // Setup navigation listeners
        this.setupNavigationListeners();
    }

    setupNavigationListeners() {
        // Setup any navigation-related event listeners
        try {
            // Add any navigation functionality here if needed
            console.log('Navigation listeners setup complete');
        } catch (error) {
            console.error('Error setting up navigation listeners:', error);
        }
    }

    showLoadingState(message = 'Processing...') {
        try {
            let loadingDiv = document.getElementById('loading-overlay');
            if (!loadingDiv) {
                loadingDiv = document.createElement('div');
                loadingDiv.id = 'loading-overlay';
                loadingDiv.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                `;
                document.body.appendChild(loadingDiv);
            }
            
            loadingDiv.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div style="margin-bottom: 15px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2196F3;"></i>
                    </div>
                    <div style="font-size: 16px; color: #333;">${message}</div>
                </div>
            `;
            loadingDiv.style.display = 'flex';
        } catch (error) {
            console.error('Error showing loading state:', error);
        }
    }

    hideLoadingState() {
        try {
            const loadingDiv = document.getElementById('loading-overlay');
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Error hiding loading state:', error);
        }

        // Architecture pattern selection
        document.querySelectorAll('.template-item[data-pattern]').forEach(item => {
            item.addEventListener('click', () => this.selectArchitecturePattern(item));
        });

        // Navigation and other UI elements
        this.setupNavigationListeners();
        this.setupCardHoverEffects();
    }

    async handleAIGeneration() {
        const prompt = document.querySelector('.ai-prompt')?.value?.trim();
        
        if (!prompt) {
            this.showNotification('Please enter an architecture description', 'warning');
            return;
        }

        if (prompt.length < 20) {
            this.showNotification('Please provide a more detailed description', 'warning');
            return;
        }

        this.state.isProcessing = true;
        this.showLoadingState('🤖 AI Chief Architect analyzing your requirements...');

        try {
            // Step 1: Enhance prompt if user is a beginner
            const enhancedPrompt = await this.enhancePromptWithAI(prompt);
            
            // Step 2: Get expert architectural analysis
            const analysis = await this.getArchitecturalAnalysis(enhancedPrompt);
            
            // Step 3: Generate specific architecture recommendation
            const architecture = await this.generateArchitecture(enhancedPrompt, analysis);
            
            // Step 4: Generate draw.io XML diagram
            const diagramXML = await this.generateDiagramXML(architecture);
            
            // Step 5: Display the architecture with draw.io integration
            await this.displayArchitectureWithDrawIO(architecture, diagramXML);
            
            // Step 6: Generate PowerPoint presentation
            await this.generatePowerPointPresentation(architecture, diagramXML);
            
            this.state.currentArchitecture = architecture;
            this.state.currentDiagram = diagramXML;
            
            this.showNotification('🎉 Architecture generated successfully!', 'success');

        } catch (error) {
            console.error('AI Generation Error:', error);
            this.showNotification('❌ Failed to generate architecture. Please try again.', 'error');
        } finally {
            this.state.isProcessing = false;
            this.hideLoadingState();
        }
    }

    async enhancePromptWithAI(originalPrompt) {
        try {
            this.updateLoadingState('🧠 Enhancing prompt with expert knowledge...');
            
            const response = await fetch(`${this.config.apiBaseUrl}/ai/enhance-prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalPrompt,
                    userLevel: 'beginner'
                })
            });

            if (!response.ok) throw new Error('Failed to enhance prompt');
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Enhanced prompt:', result.enhancedPrompt);
                return result.enhancedPrompt;
            }
            
            return originalPrompt;
            
        } catch (error) {
            console.warn('Prompt enhancement failed, using original');
            return originalPrompt;
        }
    }

    async getArchitecturalAnalysis(prompt) {
        try {
            this.updateLoadingState('👨‍💼 Chief Solutions Architect analyzing requirements...');
            
            const response = await fetch(`${this.config.apiBaseUrl}/ai/analyze-prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    context: {
                        timestamp: new Date().toISOString(),
                        sessionId: this.config.sessionId
                    }
                })
            });

            if (!response.ok) throw new Error('Analysis failed');
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Architectural Analysis:', result.analysis);
                return result.analysis;
            }
            
            throw new Error('Invalid analysis response');
            
        } catch (error) {
            console.error('Analysis failed:', error);
            return this.getMockAnalysis(prompt);
        }
    }

    async generateArchitecture(prompt, analysis) {
        try {
            this.updateLoadingState('🏗️ Generating enterprise-grade architecture...');
            
            const response = await fetch(`${this.config.apiBaseUrl}/ai/suggest-architecture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    analysis,
                    requirements: {
                        wellArchitected: document.querySelector('input[type="checkbox"]').checked,
                        security: document.querySelectorAll('input[type="checkbox"]')[1].checked,
                        costOptimization: document.querySelectorAll('input[type="checkbox"]')[2].checked
                    }
                })
            });

            if (!response.ok) throw new Error('Architecture generation failed');
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Generated Architecture:', result.architecture);
                return result.architecture;
            }
            
            throw new Error('Invalid architecture response');
            
        } catch (error) {
            console.error('Architecture generation failed:', error);
            return this.getMockArchitecture(prompt);
        }
    }

    // Generate diagram XML based on architecture
    async generateDiagramXML(architecture) {
        try {
            console.log('Generating diagram XML for architecture:', architecture);
            const response = await fetch(`${this.config.apiBaseUrl}/diagrams/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    architecture: architecture,
                    format: 'xml',
                    sessionId: this.config.sessionId
                })
            });

            if (!response.ok) throw new Error('Diagram generation failed');
            const result = await response.json();

            if (result.success && result.xml) {
                this.state.currentDiagramXML = result.xml;
                console.log('Generated diagram XML successfully');
                return result.xml;
            }

            throw new Error('Invalid diagram XML response');
        } catch (error) {
            console.error('Diagram XML generation failed:', error);
            return this.getMockDiagramXML();
        }
    }

    // Load diagram in draw.io iframe
    async loadDiagramInDrawio(xmlData) {
        try {
            const diagramContainer = document.getElementById('diagram-container');
            const iframe = document.createElement('iframe');
            
            // Configure draw.io iframe with XML data
            const drawioUrl = `${this.config.drawioBaseUrl}/?embed=1&ui=kennedy&spin=1&modified=unsavedChanges&proto=json`;
            iframe.src = drawioUrl;
            iframe.style.width = '100%';
            iframe.style.height = '600px';
            iframe.style.border = 'none';
            iframe.id = 'drawio-iframe';
            
            // Clear container and add iframe
            diagramContainer.innerHTML = '';
            diagramContainer.appendChild(iframe);
            
            // Wait for iframe to load
            iframe.onload = () => {
                setTimeout(() => {
                    // Send XML data to draw.io
                    const message = {
                        action: 'load',
                        xml: xmlData,
                        autosave: 1
                    };
                    iframe.contentWindow.postMessage(JSON.stringify(message), '*');
                }, 1000);
            };
            
            // Add edit button
            this.addEditButton(diagramContainer, xmlData);
            
            console.log('Diagram loaded in draw.io iframe');
        } catch (error) {
            console.error('Failed to load diagram in draw.io:', error);
            this.showNotification('Failed to load diagram in draw.io', 'error');
        }
    }

    // Add edit button for draw.io diagram
    addEditButton(container, xmlData) {
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit Diagram';
        editButton.className = 'edit-btn';
        editButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #2196F3;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        editButton.addEventListener('click', () => {
            this.openDrawioEditor(xmlData);
        });
        
        container.style.position = 'relative';
        container.appendChild(editButton);
    }

    // Open draw.io in new window for editing
    openDrawioEditor(xmlData) {
        try {
            const editUrl = `${this.config.drawioBaseUrl}/?client=1&edit=_blank`;
            const editorWindow = window.open(editUrl, 'drawio-editor', 'width=1200,height=800');
            
            // Wait for window to load then send XML
            editorWindow.onload = () => {
                setTimeout(() => {
                    const message = {
                        action: 'load',
                        xml: xmlData,
                        autosave: 1
                    };
                    editorWindow.postMessage(JSON.stringify(message), '*');
                }, 2000);
            };
            
            // Listen for changes from draw.io editor
            this.setupDrawioMessageListener(editorWindow);
            
            console.log('Opened draw.io editor in new window');
        } catch (error) {
            console.error('Failed to open draw.io editor:', error);
            this.showNotification('Failed to open draw.io editor', 'error');
        }
    }

    // Setup message listener for draw.io changes
    setupDrawioMessageListener(editorWindow) {
        window.addEventListener('message', (event) => {
            if (event.source === editorWindow) {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.event === 'save' || data.event === 'autosave') {
                        console.log('Received diagram update from draw.io');
                        this.handleDiagramUpdate(data.xml);
                    }
                    
                    if (data.event === 'exit') {
                        editorWindow.close();
                    }
                } catch (error) {
                    console.error('Error processing draw.io message:', error);
                }
            }
        });
    }

    // Handle diagram updates from draw.io
    async handleDiagramUpdate(newXML) {
        try {
            console.log('Handling diagram update...');
            this.state.currentDiagramXML = newXML;
            
            // Update the iframe with new XML
            const iframe = document.getElementById('drawio-iframe');
            if (iframe) {
                const message = {
                    action: 'load',
                    xml: newXML
                };
                iframe.contentWindow.postMessage(JSON.stringify(message), '*');
            }
            
            // Update PowerPoint with new diagram
            if (this.state.currentArchitecture) {
                await this.updatePowerPointWithDiagram(newXML);
            }
            
            // Emit to other connected clients via Socket.IO
            if (this.config.socket) {
                this.config.socket.emit('diagram-updated', {
                    sessionId: this.config.sessionId,
                    xml: newXML
                });
            }
            
            this.showNotification('Diagram updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to handle diagram update:', error);
            this.showNotification('Failed to update diagram', 'error');
        }
    }

    // Generate PowerPoint presentation
    async generatePowerPoint(architecture, diagramXML) {
        try {
            console.log('Generating PowerPoint presentation...');
            this.showProcessingStatus('Generating presentation...');
            
            const formData = new FormData();
            formData.append('architecture', JSON.stringify(architecture));
            formData.append('diagramXML', diagramXML);
            formData.append('sessionId', this.config.sessionId);
            
            // Add template if uploaded
            if (this.state.uploadedTemplate) {
                formData.append('template', this.state.uploadedTemplate);
            }
            
            const response = await fetch(`${this.config.apiBaseUrl}/ppt/generate`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('PowerPoint generation failed');
            
            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `IT_Architecture_${new Date().toISOString().split('T')[0]}.pptx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('PowerPoint generated and downloaded!', 'success');
            this.hideProcessingStatus();
            
        } catch (error) {
            console.error('PowerPoint generation failed:', error);
            this.showNotification('Failed to generate PowerPoint', 'error');
            this.hideProcessingStatus();
        }
    }

    // Update PowerPoint with new diagram
    async updatePowerPointWithDiagram(diagramXML) {
        try {
            console.log('Updating PowerPoint with new diagram...');
            
            const response = await fetch(`${this.config.apiBaseUrl}/ppt/update-diagram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.config.sessionId,
                    diagramXML: diagramXML
                })
            });
            
            if (!response.ok) throw new Error('PowerPoint update failed');
            
            const result = await response.json();
            if (result.success) {
                console.log('PowerPoint updated with new diagram');
            }
            
        } catch (error) {
            console.error('Failed to update PowerPoint:', error);
        }
    }

    // Handle template upload
    handleTemplateUpload(file) {
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            this.state.uploadedTemplate = file;
            document.getElementById('template-status').textContent = `Template: ${file.name}`;
            this.showNotification('Template uploaded successfully!', 'success');
        } else {
            this.showNotification('Please upload a valid PowerPoint template (.pptx)', 'error');
        }
    }

    // Setup Socket.IO for real-time updates
    initializeSocket() {
        try {
            if (typeof io !== 'undefined') {
                this.config.socket = io('http://localhost:3001');
                
                this.config.socket.on('connect', () => {
                    console.log('Connected to real-time server');
                    this.config.socket.emit('join-session', this.config.sessionId);
                });
                
                this.config.socket.on('diagram-updated', (data) => {
                    if (data.sessionId !== this.config.sessionId) {
                        console.log('Received diagram update from another user');
                        this.loadDiagramInDrawio(data.xml);
                    }
                });
                
                this.config.socket.on('disconnect', () => {
                    console.log('Disconnected from real-time server');
                });
            }
        } catch (error) {
            console.error('Failed to initialize Socket.IO:', error);
        }
    }

    // Mock data fallback methods (for development/testing)
    getMockArchitecture(prompt) {
        return {
            title: 'Sample IT Architecture',
            description: `Architecture for: ${prompt}`,
            components: [
                { name: 'Frontend Layer', type: 'presentation', description: 'User interface and client applications' },
                { name: 'API Gateway', type: 'integration', description: 'Centralized entry point for all client requests' },
                { name: 'Business Logic Layer', type: 'business', description: 'Core business rules and processing' },
                { name: 'Data Layer', type: 'data', description: 'Database and data storage systems' }
            ],
            recommendations: [
                'Implement microservices architecture for scalability',
                'Use cloud-native technologies for better resilience',
                'Apply security best practices at every layer'
            ]
        };
    }

    getMockDiagramXML() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="IT Architecture" id="sample">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="2" value="Frontend" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="3" value="API Gateway" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="300" y="100" width="120" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="4" value="Business Logic" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="500" y="100" width="120" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="5" value="Database" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="300" y="250" width="120" height="60" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
    }

    // Utility functions
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ff9800';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
        }
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    showProcessingStatus(message) {
        let statusDiv = document.getElementById('processing-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'processing-status';
            statusDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                z-index: 10001;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
            `;
            document.body.appendChild(statusDiv);
        }
        
        statusDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
            </div>
            <div>${message}</div>
        `;
        statusDiv.style.display = 'block';
    }

    hideProcessingStatus() {
        const statusDiv = document.getElementById('processing-status');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }

    // Setup animations and UI enhancements
    setupAnimations() {
        // Add hover effects and animations
        const style = document.createElement('style');
        style.textContent = `
            .card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            .btn {
                transition: all 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .edit-btn:hover {
                background: #1976D2 !important;
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }

    // Handle suggestion pills
    applySuggestion(suggestion) {
        try {
            const promptInput = document.querySelector('.ai-prompt');
            if (promptInput) {
                promptInput.value = suggestion;
                this.showNotification(`Applied suggestion: ${suggestion}`, 'success');
            }
        } catch (error) {
            console.error('Error applying suggestion:', error);
        }
    }

    // Handle AI action buttons
    async handleAIAction(button, event) {
        try {
            event.preventDefault();
            const action = button.getAttribute('data-action') || button.textContent.toLowerCase();
            
            this.showLoadingState(`Processing ${action}...`);
            
            // Add specific AI actions based on button type
            switch (action) {
                case 'analyze':
                    await this.analyzeUserPrompt();
                    break;
                case 'generate':
                    await this.handleAIGeneration();
                    break;
                case 'enhance':
                    await this.enhancePrompt();
                    break;
                default:
                    await this.handleAIGeneration();
            }
            
            this.hideLoadingState();
        } catch (error) {
            console.error('Error handling AI action:', error);
            this.hideLoadingState();
            this.showNotification('AI action failed', 'error');
        }
    }

    // Load user data (placeholder)
    loadUserData() {
        try {
            // Load any saved user preferences or session data
            console.log('User data loaded');
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Analyze user prompt
    async analyzeUserPrompt() {
        try {
            const promptInput = document.querySelector('.ai-prompt');
            if (!promptInput || !promptInput.value.trim()) {
                this.showNotification('Please enter a prompt first', 'warning');
                return;
            }

            const prompt = promptInput.value.trim();
            console.log('Analyzing prompt:', prompt);

            const response = await fetch(`${this.config.apiBaseUrl}/ai/analyze-prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error('Analysis failed');
            const result = await response.json();

            if (result.success) {
                this.displayAnalysisResults(result.analysis);
                this.showNotification('Prompt analyzed successfully!', 'success');
            }
        } catch (error) {
            console.error('Error analyzing prompt:', error);
            this.showNotification('Analysis failed', 'error');
        }
    }

    // Display analysis results
    displayAnalysisResults(analysis) {
        const resultsContainer = document.getElementById('analysis-results') || this.createAnalysisContainer();
        resultsContainer.innerHTML = `
            <h3>AI Analysis Results</h3>
            <div class="analysis-content">
                <p><strong>Analysis:</strong> ${analysis.analysis}</p>
                <p><strong>Confidence:</strong> ${(analysis.confidence * 100).toFixed(1)}%</p>
                ${analysis.recommendations ? `
                    <div class="recommendations">
                        <strong>Recommendations:</strong>
                        <ul>
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        resultsContainer.style.display = 'block';
    }

    // Create analysis container if it doesn't exist
    createAnalysisContainer() {
        const container = document.createElement('div');
        container.id = 'analysis-results';
        container.style.cssText = `
            margin: 20px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #2196F3;
            display: none;
        `;
        
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.appendChild(container);
        return container;
    }

    // Enhance user prompt
    async enhancePrompt() {
        try {
            const promptInput = document.querySelector('.ai-prompt');
            if (!promptInput || !promptInput.value.trim()) {
                this.showNotification('Please enter a prompt first', 'warning');
                return;
            }

            const originalPrompt = promptInput.value.trim();
            console.log('Enhancing prompt:', originalPrompt);

            const response = await fetch(`${this.config.apiBaseUrl}/ai/enhance-prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ originalPrompt })
            });

            if (!response.ok) throw new Error('Enhancement failed');
            const result = await response.json();

            if (result.success) {
                promptInput.value = result.enhancedPrompt;
                this.showNotification('Prompt enhanced successfully!', 'success');
                
                // Show enhancement details
                if (result.enhancements && result.enhancements.length > 0) {
                    const enhancementInfo = result.enhancements.join(', ');
                    this.showNotification(`Enhancements: ${enhancementInfo}`, 'info');
                }
            }
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            this.showNotification('Enhancement failed', 'error');
        }
    }

    // Handle template upload
    handleTemplateUpload(event) {
        try {
            const file = event.target.files[0];
            if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
                this.state.uploadedTemplate = file;
                const statusElement = document.getElementById('template-status');
                if (statusElement) {
                    statusElement.textContent = `Template: ${file.name}`;
                }
                this.showNotification('Template uploaded successfully!', 'success');
                console.log('Template uploaded:', file.name);
            } else {
                this.showNotification('Please upload a valid PowerPoint template (.pptx)', 'error');
            }
        } catch (error) {
            console.error('Error uploading template:', error);
            this.showNotification('Template upload failed', 'error');
        }
    }

    // Select architecture pattern
    selectArchitecturePattern(item) {
        try {
            const pattern = item.getAttribute('data-pattern');
            const promptInput = document.querySelector('.ai-prompt');
            if (promptInput && pattern) {
                promptInput.value = `Create a ${pattern} architecture for my application`;
                this.showNotification(`Selected ${pattern} pattern`, 'success');
            }
        } catch (error) {
            console.error('Error selecting architecture pattern:', error);
        }
    }

    // Setup card hover effects
    setupCardHoverEffects() {
        try {
            document.querySelectorAll('.card, .template-item').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-2px)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
            });
        } catch (error) {
            console.error('Error setting up card hover effects:', error);
        }
    }

    // Update AI status
    updateAIStatus(data) {
        try {
            console.log('AI Status Update:', data);
            // Update any AI status indicators in the UI
            const statusElement = document.querySelector('.ai-status');
            if (statusElement) {
                statusElement.textContent = data.status || 'Ready';
            }
        } catch (error) {
            console.error('Error updating AI status:', error);
        }
    }

    // Update loading state with progress
    updateLoadingState(message, progress = null) {
        try {
            const loadingDiv = document.getElementById('loading-overlay');
            if (loadingDiv) {
                const progressBar = progress ? 
                    `<div style="width: 100%; background: #f0f0f0; border-radius: 10px; margin: 10px 0;">
                        <div style="width: ${progress}%; background: #2196F3; height: 8px; border-radius: 10px; transition: width 0.3s;"></div>
                    </div>` : '';
                
                loadingDiv.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="margin-bottom: 15px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2196F3;"></i>
                        </div>
                        <div style="font-size: 16px; color: #333; margin-bottom: 10px;">${message}</div>
                        ${progressBar}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error updating loading state:', error);
        }
    }

    // Get mock analysis for fallback
    getMockAnalysis(prompt) {
        const keywords = prompt.toLowerCase();
        
        let analysis = {
            businessContext: 'Enterprise-grade solution analysis',
            technicalRequirements: [],
            recommendedPatterns: [],
            technologyStack: [],
            keyConsiderations: [],
            implementationApproach: 'Phased implementation recommended',
            riskAssessment: 'Low to medium risk with proper planning'
        };

        // Intelligent analysis based on keywords
        if (keywords.includes('microservice') || keywords.includes('api')) {
            analysis.technicalRequirements = [
                'Service decomposition strategy',
                'API gateway implementation',
                'Inter-service communication',
                'Data consistency management'
            ];
            analysis.recommendedPatterns = [
                'Microservices Architecture',
                'API Gateway Pattern',
                'Circuit Breaker Pattern',
                'Event-Driven Architecture'
            ];
            analysis.technologyStack = [
                'Docker/Kubernetes for containerization',
                'Spring Boot/Node.js for services',
                'Redis/RabbitMQ for messaging',
                'PostgreSQL for data persistence'
            ];
        } else if (keywords.includes('cloud') || keywords.includes('aws') || keywords.includes('azure')) {
            analysis.technicalRequirements = [
                'Cloud-native architecture design',
                'Auto-scaling capabilities',
                'Multi-region deployment',
                'Cloud security implementation'
            ];
            analysis.recommendedPatterns = [
                'Cloud-Native Architecture',
                'Serverless Pattern',
                'Multi-Cloud Strategy',
                'Infrastructure as Code'
            ];
            analysis.technologyStack = [
                'AWS/Azure cloud services',
                'Terraform for IaC',
                'Lambda/Azure Functions',
                'CloudWatch/Application Insights'
            ];
        } else if (keywords.includes('web') || keywords.includes('frontend')) {
            analysis.technicalRequirements = [
                'Responsive design implementation',
                'Progressive Web App features',
                'Cross-browser compatibility',
                'Performance optimization'
            ];
            analysis.recommendedPatterns = [
                'Single Page Application',
                'Progressive Web App',
                'Component-Based Architecture',
                'JAMstack Architecture'
            ];
            analysis.technologyStack = [
                'React/Vue.js framework',
                'TypeScript for type safety',
                'Webpack/Vite for bundling',
                'Jest for testing'
            ];
        } else {
            // Default enterprise architecture
            analysis.technicalRequirements = [
                'Scalable system design',
                'Security implementation',
                'Performance optimization',
                'Maintainable codebase'
            ];
            analysis.recommendedPatterns = [
                'Layered Architecture',
                'Model-View-Controller',
                'Repository Pattern',
                'Dependency Injection'
            ];
            analysis.technologyStack = [
                'Enterprise framework',
                'Relational database',
                'Caching layer',
                'Monitoring tools'
            ];
        }

        analysis.keyConsiderations = [
            'Security: Implement zero-trust architecture',
            'Scalability: Design for horizontal scaling',
            'Performance: Optimize for sub-second response times',
            'Maintainability: Follow clean code principles',
            'Cost: Implement cost monitoring and optimization'
        ];

        return analysis;
    }
}

// Initialize the enhanced IT Architects Suite
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.itArchitectsSuite = new ITArchitectsSuiteEnhanced();
        console.log('IT Architects Suite Enhanced initialized successfully');
    } catch (error) {
        console.error('Failed to initialize IT Architects Suite:', error);
    }
});