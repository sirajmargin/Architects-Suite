// IT Architects Suite - Enhanced Fixes and Extensions

// Add missing methods to ITArchitectsSuiteEnhanced class
(function() {
    if (typeof ITArchitectsSuiteEnhanced !== 'undefined') {
        
        // Fix 1: displayArchitectureWithDrawIO method
        ITArchitectsSuiteEnhanced.prototype.displayArchitectureWithDrawIO = async function(architecture, diagramXML) {
            try {
                console.log('Displaying architecture with draw.io integration');
                
                let diagramContainer = document.getElementById('diagram-container');
                if (!diagramContainer) {
                    const workspaceArea = document.querySelector('.workspace-area');
                    if (workspaceArea) {
                        diagramContainer = document.createElement('div');
                        diagramContainer.id = 'diagram-container';
                        diagramContainer.style.cssText = `
                            width: 100%;
                            height: 600px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            margin: 20px 0;
                            position: relative;
                            background: #f9f9f9;
                        `;
                        workspaceArea.appendChild(diagramContainer);
                    }
                }

                this.displayArchitectureSummary(architecture);
                await this.loadDiagramInDrawio(diagramXML);
                
                console.log('Architecture displayed successfully with draw.io integration');
            } catch (error) {
                console.error('Error displaying architecture with draw.io:', error);
                this.showNotification('Failed to display architecture diagram', 'error');
            }
        };

        // Fix 2: displayArchitectureSummary method
        ITArchitectsSuiteEnhanced.prototype.displayArchitectureSummary = function(architecture) {
            try {
                let summaryContainer = document.getElementById('architecture-summary');
                if (!summaryContainer) {
                    summaryContainer = document.createElement('div');
                    summaryContainer.id = 'architecture-summary';
                    summaryContainer.style.cssText = `
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    `;
                    
                    const workspaceArea = document.querySelector('.workspace-area');
                    if (workspaceArea) {
                        workspaceArea.appendChild(summaryContainer);
                    }
                }

                summaryContainer.innerHTML = `
                    <h3 style="margin-top: 0; color: #333;"><i class="fas fa-project-diagram"></i> ${architecture.title}</h3>
                    <p style="color: #666; margin-bottom: 20px;">${architecture.description}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <h4 style="color: #2196F3; margin-bottom: 10px;"><i class="fas fa-cubes"></i> Components</h4>
                            <ul style="list-style: none; padding: 0;">
                                ${architecture.components.map(comp => `
                                    <li style="padding: 8px; margin: 4px 0; background: #f5f5f5; border-radius: 4px; border-left: 3px solid #2196F3;">
                                        <strong>${comp.name}</strong> (${comp.type})<br>
                                        <small style="color: #666;">${comp.description}</small>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 style="color: #4CAF50; margin-bottom: 10px;"><i class="fas fa-lightbulb"></i> Recommendations</h4>
                            <ul style="list-style: none; padding: 0;">
                                ${(architecture.recommendations || []).map(rec => `
                                    <li style="padding: 8px; margin: 4px 0; background: #f5f5f5; border-radius: 4px; border-left: 3px solid #4CAF50;">
                                        ${rec}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    ${architecture.technologies ? `
                        <div>
                            <h4 style="color: #FF9800; margin-bottom: 10px;"><i class="fas fa-cogs"></i> Technology Stack</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${architecture.technologies.map(tech => `
                                    <span style="background: #FF9800; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${tech}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                `;
            } catch (error) {
                console.error('Error displaying architecture summary:', error);
            }
        };

        // Fix 3: generatePowerPointPresentation method
        ITArchitectsSuiteEnhanced.prototype.generatePowerPointPresentation = async function(architecture, diagramXML) {
            try {
                console.log('Generating PowerPoint presentation...');
                
                const formData = new FormData();
                formData.append('architecture', JSON.stringify(architecture));
                formData.append('diagramXML', diagramXML);
                formData.append('sessionId', this.config.sessionId);
                
                if (this.state.uploadedTemplate) {
                    formData.append('template', this.state.uploadedTemplate);
                }
                
                const response = await fetch(`${this.config.apiBaseUrl}/ppt/generate`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) throw new Error('PowerPoint generation failed');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `IT_Architecture_${new Date().toISOString().split('T')[0]}.pptx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                console.log('PowerPoint generated successfully');
                
            } catch (error) {
                console.error('PowerPoint generation failed:', error);
            }
        };

        console.log('✅ IT Architects Suite fixes applied successfully!');
    }
})();
// Enhanced AI Progress Display and Vector DB Integration

// Add to script-enhancements.js
(function() {
    if (typeof ITArchitectsSuiteEnhanced !== 'undefined') {
        
        // Enhanced updateLoadingState with ChatGPT-style progress
        ITArchitectsSuiteEnhanced.prototype.updateLoadingState = function(message, progress = null, steps = []) {
            try {
                const loadingDiv = document.getElementById('loading-overlay');
                if (loadingDiv) {
                    const progressBar = progress ? 
                        `<div style="width: 100%; background: #f0f0f0; border-radius: 10px; margin: 10px 0;">
                            <div style="width: ${progress}%; background: #2196F3; height: 8px; border-radius: 10px; transition: width 0.3s;"></div>
                        </div>` : '';
                    
                    const stepsList = steps.length > 0 ? 
                        `<div style="margin-top: 15px; text-align: left;">
                            ${steps.map((step, index) => `
                                <div style="display: flex; align-items: center; margin: 8px 0; font-size: 14px;">
                                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${step.completed ? '#4CAF50' : step.current ? '#2196F3' : '#ddd'}; margin-right: 10px; display: flex; align-items: center; justify-content: center;">
                                        ${step.completed ? '<i class="fas fa-check" style="color: white; font-size: 10px;"></i>' : (step.current ? '<i class="fas fa-spinner fa-spin" style="color: white; font-size: 10px;"></i>' : '')}
                                    </div>
                                    <span style="color: ${step.completed ? '#4CAF50' : step.current ? '#2196F3' : '#666'};">${step.text}</span>
                                </div>
                            `).join('')}
                        </div>` : '';
                    
                    loadingDiv.innerHTML = `
                        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); min-width: 400px;">
                            <div style="margin-bottom: 15px;">
                                <i class="fas fa-robot" style="font-size: 32px; color: #2196F3;"></i>
                            </div>
                            <div style="font-size: 16px; color: #333; margin-bottom: 10px;">${message}</div>
                            ${progressBar}
                            ${stepsList}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error updating loading state:', error);
            }
        };

        // Enhanced handleAIGeneration with progress steps
        const originalHandleAIGeneration = ITArchitectsSuiteEnhanced.prototype.handleAIGeneration;
        ITArchitectsSuiteEnhanced.prototype.handleAIGeneration = async function() {
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
            this.state.diagramType = document.getElementById('diagram-type')?.value || 'auto-detect';
            
            // Define processing steps for ChatGPT-style display
            const steps = [
                { text: 'Analyzing requirements', completed: false, current: false },
                { text: 'Enhancing prompt with context', completed: false, current: false },
                { text: 'Generating architecture blueprint', completed: false, current: false },
                { text: 'Creating interactive diagram', completed: false, current: false },
                { text: 'Finalizing presentation', completed: false, current: false }
            ];

            try {
                // Step 1: Enhance prompt
                steps[0].current = true;
                this.updateLoadingState('🤖 AI Chief Architect analyzing your requirements...', 10, steps);
                
                const enhancedPrompt = await this.enhancePromptWithAI(prompt);
                steps[0].completed = true;
                steps[0].current = false;
                
                // Step 2: Get architectural analysis
                steps[1].current = true;
                this.updateLoadingState('🧠 Enhancing prompt with expert knowledge...', 25, steps);
                
                const analysis = await this.getArchitecturalAnalysis(enhancedPrompt);
                steps[1].completed = true;
                steps[1].current = false;
                
                // Step 3: Generate architecture with sources and reasoning
                steps[2].current = true;
                this.updateLoadingState('🏗️ Generating enterprise-grade architecture...', 50, steps);
                
                const architectureResult = await this.generateArchitecture(enhancedPrompt, analysis);
                steps[2].completed = true;
                steps[2].current = false;
                
                // Step 4: Generate diagram
                steps[3].current = true;
                this.updateLoadingState('📊 Creating interactive diagram...', 75, steps);
                
                const diagramXML = await this.generateDiagramXML(architectureResult.architecture);
                steps[3].completed = true;
                steps[3].current = false;
                
                // Step 5: Display with sources and reasoning
                steps[4].current = true;
                this.updateLoadingState('🎨 Finalizing presentation...', 90, steps);
                
                await this.displayArchitectureWithSources(architectureResult.architecture, diagramXML, architectureResult.sources, architectureResult.reasoningSteps);
                await this.generatePowerPointPresentation(architectureResult.architecture, diagramXML);
                
                // Store in vector database with enhanced data
                await this.storeInVectorDB(prompt, enhancedPrompt, analysis, architectureResult.architecture, diagramXML, architectureResult.sources, architectureResult.reasoningSteps);
                
                steps[4].completed = true;
                steps[4].current = false;
                
                this.state.currentArchitecture = architectureResult.architecture;
                this.state.currentDiagram = diagramXML;
                
                this.updateLoadingState('✅ Architecture generated successfully!', 100, steps);
                
                setTimeout(() => {
                    this.hideLoadingState();
                    this.showNotification('🎉 Architecture generated successfully!', 'success');
                }, 1500);

            } catch (error) {
                console.error('AI Generation Error:', error);
                this.hideLoadingState();
                this.showNotification('❌ Failed to generate architecture. Please try again.', 'error');
            } finally {
                this.state.isProcessing = false;
            }
        };

        // Vector database integration with enhanced data
        ITArchitectsSuiteEnhanced.prototype.storeInVectorDB = async function(originalPrompt, enhancedPrompt, analysis, architecture, diagramXML, sources = [], reasoningSteps = []) {
            try {
                console.log('Storing enhanced data in vector database...');
                
                const vectorData = {
                    sessionId: this.config.sessionId,
                    timestamp: new Date().toISOString(),
                    originalPrompt,
                    enhancedPrompt,
                    analysis,
                    architecture,
                    diagramXML,
                    sources,
                    reasoningSteps,
                    diagramType: this.state.diagramType,
                    metadata: {
                        userAgent: navigator.userAgent,
                        url: window.location.href,
                        version: '1.0.0',
                        totalSources: sources.length,
                        avgSourceRelevance: sources.length > 0 ? Math.round(sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length) : 0
                    }
                };
                
                const response = await fetch(`${this.config.apiBaseUrl}/vector/store`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vectorData)
                });
                
                if (response.ok) {
                    console.log('Enhanced data stored in vector database successfully');
                } else {
                    console.warn('Failed to store in vector database');
                }
            } catch (error) {
                console.error('Error storing in vector database:', error);
                // Don't break the flow for vector DB errors
            }
        };

        // Display architecture with ChatGPT/Perplexity-style source attribution
        ITArchitectsSuiteEnhanced.prototype.displayArchitectureWithSources = async function(architecture, diagramXML, sources = [], reasoningSteps = []) {
            try {
                console.log('Displaying architecture with source attribution...');
                
                // Create sources section
                const sourcesHTML = sources.length > 0 ? `
                    <div class="sources-section" style="
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    ">
                        <h4 style="
                            color: #1e293b;
                            margin-bottom: 15px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-book"></i> Sources Referenced
                        </h4>
                        <div class="sources-grid" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                            gap: 15px;
                        ">
                            ${sources.map((source, index) => `
                                <div class="source-item" style="
                                    background: white;
                                    border: 1px solid #e2e8f0;
                                    border-radius: 6px;
                                    padding: 15px;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e2e8f0'">
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        justify-content: space-between;
                                        margin-bottom: 8px;
                                    ">
                                        <span style="
                                            font-weight: 600;
                                            color: #1e293b;
                                            font-size: 14px;
                                        ">${source.title}</span>
                                        <span style="
                                            background: #22c55e;
                                            color: white;
                                            padding: 2px 8px;
                                            border-radius: 12px;
                                            font-size: 12px;
                                            font-weight: 500;
                                        ">${source.relevance}%</span>
                                    </div>
                                    <p style="
                                        color: #64748b;
                                        font-size: 13px;
                                        margin-bottom: 10px;
                                        line-height: 1.4;
                                    ">${source.description}</p>
                                    <a href="${source.url}" target="_blank" style="
                                        color: #3b82f6;
                                        text-decoration: none;
                                        font-size: 12px;
                                        display: flex;
                                        align-items: center;
                                        gap: 4px;
                                    ">
                                        <i class="fas fa-external-link-alt"></i>
                                        View Source
                                    </a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : '';
                
                // Create reasoning steps section
                const reasoningHTML = reasoningSteps.length > 0 ? `
                    <div class="reasoning-section" style="
                        background: #fefce8;
                        border: 1px solid #facc15;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    ">
                        <h4 style="
                            color: #92400e;
                            margin-bottom: 15px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-brain"></i> AI Reasoning Process
                        </h4>
                        <div class="reasoning-steps">
                            ${reasoningSteps.map((step, index) => `
                                <div class="reasoning-step" style="
                                    border-left: 3px solid #facc15;
                                    padding-left: 15px;
                                    margin-bottom: 15px;
                                    position: relative;
                                ">
                                    <div style="
                                        position: absolute;
                                        left: -8px;
                                        top: 0;
                                        width: 14px;
                                        height: 14px;
                                        background: #facc15;
                                        border-radius: 50%;
                                        border: 2px solid white;
                                    "></div>
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        justify-content: space-between;
                                        margin-bottom: 5px;
                                    ">
                                        <span style="
                                            font-weight: 600;
                                            color: #92400e;
                                            font-size: 14px;
                                        ">Step ${step.step}: ${step.title}</span>
                                        <span style="
                                            color: #a3a3a3;
                                            font-size: 12px;
                                        ">${step.duration}</span>
                                    </div>
                                    <p style="
                                        color: #78716c;
                                        font-size: 13px;
                                        line-height: 1.4;
                                        margin-bottom: 8px;
                                    ">${step.description}</p>
                                    <div style="
                                        display: flex;
                                        gap: 8px;
                                        flex-wrap: wrap;
                                    ">
                                        ${step.sources.map(sourceName => `
                                            <span style="
                                                background: #fde68a;
                                                color: #92400e;
                                                padding: 2px 8px;
                                                border-radius: 10px;
                                                font-size: 11px;
                                                font-weight: 500;
                                            ">${sourceName}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : '';
                
                // Display the complete architecture with sources and enhanced diagram view
                await this.displayArchitectureWithEnhancedDrawIO(architecture, diagramXML);
                
                // Add sources and reasoning to the display
                const resultContainer = document.querySelector('.result-container') || document.querySelector('.content-area');
                if (resultContainer && (sources.length > 0 || reasoningSteps.length > 0)) {
                    const enhancedSection = document.createElement('div');
                    enhancedSection.className = 'ai-attribution-section';
                    enhancedSection.innerHTML = sourcesHTML + reasoningHTML;
                    resultContainer.appendChild(enhancedSection);
                }
                
                console.log('Architecture displayed with source attribution successfully');
            } catch (error) {
                console.error('Error displaying architecture with sources:', error);
                // Fallback to standard display
                await this.displayArchitectureWithDrawIO(architecture, diagramXML);
            }
        };

        // Enhanced draw.io display with download and SVG preview (vertical layout)
        ITArchitectsSuiteEnhanced.prototype.displayArchitectureWithEnhancedDrawIO = async function(architecture, diagramXML) {
            try {
                console.log('Displaying architecture with enhanced draw.io and SVG preview (vertical layout)...');
                
                // First, save the XML as a .drawio file in temporary space
                const tempFileResponse = await fetch('/api/diagrams/save-drawio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        xml: diagramXML,
                        filename: architecture.title || 'architecture-diagram'
                    })
                });
                
                let drawioUrl;
                if (tempFileResponse.ok) {
                    const tempFileData = await tempFileResponse.json();
                    drawioUrl = tempFileData.drawioUrl;
                    console.log('Temporary .drawio file created:', tempFileData.fileName);
                } else {
                    // Fallback to direct XML parameter
                    const encodedXML = encodeURIComponent(diagramXML);
                    drawioUrl = `https://embed.diagrams.net/?embed=1&ui=dark&spin=1&chrome=0&proto=json&xml=${encodedXML}`;
                }
                
                // Create enhanced diagram container with vertical layout
                const diagramContainer = document.getElementById('diagram-container') || this.createDiagramContainer();
                
                diagramContainer.innerHTML = `
                    <div class="enhanced-diagram-layout-vertical" style="
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        margin: 20px 0;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        overflow: hidden;
                        background: #f8fafc;
                    ">
                        <!-- Draw.io Interactive Editor -->
                        <div class="drawio-section" style="
                            position: relative;
                            background: white;
                            height: 600px;
                            border-bottom: 1px solid #e2e8f0;
                        ">
                            <div class="section-header" style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 12px 16px;
                                font-weight: 600;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                            ">
                                <span><i class="fas fa-edit"></i> Draw.io Interactive Editor (Cloud-Native Icons)</span>
                                <div class="editor-controls" style="display: flex; gap: 8px;">
                                    <button onclick="downloadDiagram('xml')" style="
                                        background: rgba(255,255,255,0.2);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        font-size: 12px;
                                        cursor: pointer;
                                    " title="Download .drawio XML">
                                        <i class="fas fa-download"></i> .drawio
                                    </button>
                                    <button onclick="downloadDiagram('svg')" style="
                                        background: rgba(255,255,255,0.2);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        font-size: 12px;
                                        cursor: pointer;
                                    " title="Download SVG with Cloud-Native Icons">
                                        <i class="fas fa-download"></i> SVG
                                    </button>
                                    <button onclick="openDrawioEditor()" style="
                                        background: rgba(255,255,255,0.2);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        font-size: 12px;
                                        cursor: pointer;
                                    " title="Edit in new window">
                                        <i class="fas fa-external-link-alt"></i> Edit
                                    </button>
                                </div>
                            </div>
                            <div id="drawio-iframe-container" style="height: calc(100% - 48px);">
                                <iframe 
                                    src="${drawioUrl}"
                                    style="width: 100%; height: 100%; border: none;"
                                    id="drawio-iframe">
                                </iframe>
                            </div>
                        </div>
                        
                        <!-- SVG Preview Section (Below Draw.io) -->
                        <div class="svg-section" style="
                            position: relative;
                            background: white;
                            height: 600px;
                        ">
                            <div class="section-header" style="
                                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                                color: white;
                                padding: 12px 16px;
                                font-weight: 600;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                            ">
                                <span><i class="fas fa-images"></i> SVG Preview (Cloud-Native Icons)</span>
                                <div class="preview-controls" style="display: flex; gap: 8px;">
                                    <button onclick="refreshSVGPreview()" style="
                                        background: rgba(255,255,255,0.2);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        font-size: 12px;
                                        cursor: pointer;
                                    " title="Refresh Preview">
                                        <i class="fas fa-sync-alt"></i> Refresh
                                    </button>
                                    <button onclick="downloadDiagram('png')" style="
                                        background: rgba(255,255,255,0.2);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        font-size: 12px;
                                        cursor: pointer;
                                    " title="Download PNG">
                                        <i class="fas fa-download"></i> PNG
                                    </button>
                                </div>
                            </div>
                            <div id="svg-preview-container" style="
                                height: calc(100% - 48px);
                                padding: 15px;
                                overflow: auto;
                                background: #fafafa;
                            ">
                                <div class="svg-loading" style="
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100%;
                                    color: #64748b;
                                    font-size: 14px;
                                ">
                                    <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>
                                    Generating Cloud-Native SVG preview...
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Generate and display SVG preview with cloud-native icons
                await this.generateSVGPreview(diagramXML);
                
                // Store current diagram data globally for download functions
                window.currentDiagramXML = diagramXML;
                window.currentArchitecture = architecture;
                
                console.log('Enhanced vertical diagram display loaded successfully with cloud-native icons');
            } catch (error) {
                console.error('Error displaying enhanced draw.io:', error);
                // Fallback to standard display
                await this.displayArchitectureWithDrawIO(architecture, diagramXML);
            }
        };

        // RAG-powered search functionality
        ITArchitectsSuiteEnhanced.prototype.searchSimilarArchitectures = async function(prompt) {
            try {
                const response = await fetch(`${this.config.apiBaseUrl}/vector/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: prompt,
                        limit: 5,
                        threshold: 0.7
                    })
                });
                
                if (response.ok) {
                    const results = await response.json();
                    return results.matches || [];
                }
                return [];
            } catch (error) {
                console.error('Error searching vector database:', error);
                return [];
            }
        };

        // Add diagram type change handler
        ITArchitectsSuiteEnhanced.prototype.setupDiagramTypeSelector = function() {
            try {
                const diagramTypeSelect = document.getElementById('diagram-type');
                if (diagramTypeSelect) {
                    diagramTypeSelect.addEventListener('change', (e) => {
                        this.state.diagramType = e.target.value;
                        console.log('Diagram type changed to:', this.state.diagramType);
                        
                        // Show notification about the selected type
                        const typeNames = {
                            'auto-detect': 'Auto-detect',
                            'cloud-architecture': 'Cloud Architecture',
                            'uml': 'UML Diagram',
                            'flowchart': 'Flowchart',
                            'er-diagram': 'ER Diagram',
                            'bpmn': 'BPMN'
                        };
                        
                        this.showNotification(`Selected diagram type: ${typeNames[e.target.value]}`, 'info');
                    });
                }
            } catch (error) {
                console.error('Error setting up diagram type selector:', error);
            }
        };

        console.log('✅ Enhanced AI progress display and vector DB integration loaded!');
        
        // Add dashboard functionality
        ITArchitectsSuiteEnhanced.prototype.initializeDashboard = function() {
            this.loadDashboardStats();
            this.setupRealTimeMetrics();
            console.log('Dashboard functionality initialized');
        };
        
        // Load comprehensive dashboard statistics
        ITArchitectsSuiteEnhanced.prototype.loadDashboardStats = async function() {
            try {
                const response = await fetch(`${this.config.apiBaseUrl}/dashboard/stats`);
                if (response.ok) {
                    const data = await response.json();
                    this.displayDashboardStats(data.stats);
                } else {
                    console.warn('Failed to load dashboard stats');
                }
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
            }
        };
        
        // Display dashboard statistics
        ITArchitectsSuiteEnhanced.prototype.displayDashboardStats = function(stats) {
            // Update overview cards
            const updateStat = (selector, value) => {
                const element = document.querySelector(selector);
                if (element) element.textContent = value;
            };
            
            updateStat('.stat-architectures .stat-number', stats.overview.architecturesGenerated);
            updateStat('.stat-success-rate .stat-number', `${stats.overview.successRate}%`);
            updateStat('.stat-avg-time .stat-number', stats.overview.avgProcessingTime);
            
            // Create detailed dashboard if it doesn't exist
            this.createDetailedDashboard(stats);
        };
        
        // Create detailed dashboard component
        ITArchitectsSuiteEnhanced.prototype.createDetailedDashboard = function(stats) {
            const dashboardHTML = `
                <div id="detailed-dashboard" class="detailed-dashboard" style="
                    display: none;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 30px;
                ">
                    <!-- AI Tools Usage Card -->
                    <div class="dashboard-card" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    ">
                        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-robot"></i> AI Tools Usage
                        </h3>
                        <div class="metric-row" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>Total Requests:</span>
                            <strong>${stats.overview.totalRequests.toLocaleString()}</strong>
                        </div>
                        <div class="metric-row" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>Success Rate:</span>
                            <strong>${stats.overview.successRate}%</strong>
                        </div>
                        <div class="metric-row" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>Avg Processing:</span>
                            <strong>${stats.overview.avgProcessingTime}</strong>
                        </div>
                        <div class="tools-breakdown" style="margin-top: 20px;">
                            <div style="font-size: 14px; margin-bottom: 10px; opacity: 0.9;">Breakdown by Tool:</div>
                            <div style="font-size: 13px; line-height: 1.6;">
                                <div>• Prompt Analysis: ${stats.aiToolsUsage.promptAnalysis.total} requests</div>
                                <div>• Architecture Gen: ${stats.aiToolsUsage.architectureGeneration.total} requests</div>
                                <div>• Diagram Creation: ${stats.aiToolsUsage.diagramCreation.total} requests</div>
                                <div>• PowerPoint Export: ${stats.aiToolsUsage.powerPointGeneration.total} requests</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Vector Database Card -->
                    <div class="dashboard-card" style="
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    ">
                        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-database"></i> Vector Database & RAG
                        </h3>
                        <div class="metric-row" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>Total Vectors:</span>
                            <strong>${stats.vectorDatabase.overview.totalVectors.toLocaleString()}</strong>
                        </div>
                        <div class="metric-row" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>Storage Used:</span>
                            <strong>${stats.vectorDatabase.overview.storageUsed}</strong>
                        </div>
                        <div class="metric-row" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>RAG Queries:</span>
                            <strong>${stats.vectorDatabase.ragPerformance.queriesServed}</strong>
                        </div>
                        <div class="metric-row" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>Relevance Score:</span>
                            <strong>${(stats.vectorDatabase.ragPerformance.relevanceScore * 100).toFixed(1)}%</strong>
                        </div>
                        <div class="content-breakdown" style="margin-top: 20px;">
                            <div style="font-size: 14px; margin-bottom: 10px; opacity: 0.9;">Content Stored:</div>
                            <div style="font-size: 13px; line-height: 1.6;">
                                <div>• Architectures: ${stats.vectorDatabase.contentBreakdown.architectures}</div>
                                <div>• Diagrams: ${stats.vectorDatabase.contentBreakdown.diagrams}</div>
                                <div>• Sources: ${stats.vectorDatabase.contentBreakdown.sources}</div>
                                <div>• Reasoning Steps: ${stats.vectorDatabase.contentBreakdown.reasoningSteps}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- System Performance Card -->
                    <div class="dashboard-card" style="
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    ">
                        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-chart-line"></i> System Performance
                        </h3>
                        <div class="performance-metrics">
                            <div class="performance-item" style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>CPU Usage</span>
                                    <strong>${stats.performanceMetrics.systemHealth.cpuUsage}%</strong>
                                </div>
                                <div style="background: rgba(255,255,255,0.3); height: 6px; border-radius: 3px;">
                                    <div style="background: white; height: 100%; width: ${stats.performanceMetrics.systemHealth.cpuUsage}%; border-radius: 3px;"></div>
                                </div>
                            </div>
                            <div class="performance-item" style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Memory Usage</span>
                                    <strong>${stats.performanceMetrics.systemHealth.memoryUsage}%</strong>
                                </div>
                                <div style="background: rgba(255,255,255,0.3); height: 6px; border-radius: 3px;">
                                    <div style="background: white; height: 100%; width: ${stats.performanceMetrics.systemHealth.memoryUsage}%; border-radius: 3px;"></div>
                                </div>
                            </div>
                            <div class="performance-item">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Disk Usage</span>
                                    <strong>${stats.performanceMetrics.systemHealth.diskUsage}%</strong>
                                </div>
                                <div style="background: rgba(255,255,255,0.3); height: 6px; border-radius: 3px;">
                                    <div style="background: white; height: 100%; width: ${stats.performanceMetrics.systemHealth.diskUsage}%; border-radius: 3px;"></div>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 20px; font-size: 13px; opacity: 0.9;">
                            <div>Uptime: ${stats.performanceMetrics.systemHealth.uptime}</div>
                            <div>Status: ${stats.performanceMetrics.systemHealth.status.toUpperCase()}</div>
                        </div>
                    </div>
                    
                    <!-- Top Queries Card -->
                    <div class="dashboard-card" style="
                        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                        color: #333;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    ">
                        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #333;">
                            <i class="fas fa-search"></i> Top RAG Queries
                        </h3>
                        <div class="top-queries" style="font-size: 14px;">
                            ${stats.vectorDatabase.topQueries.map((query, index) => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 10px 0;
                                    border-bottom: 1px solid rgba(0,0,0,0.1);
                                ">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 2px;">${query.query}</div>
                                        <div style="font-size: 12px; opacity: 0.7;">${query.count} queries • ${(query.avgRelevance * 100).toFixed(0)}% relevance</div>
                                    </div>
                                    <div style="
                                        background: rgba(0,0,0,0.1);
                                        padding: 4px 8px;
                                        border-radius: 12px;
                                        font-size: 12px;
                                        font-weight: 600;
                                    ">#${index + 1}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Add dashboard to the content area
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                const existingDashboard = document.getElementById('detailed-dashboard');
                if (existingDashboard) {
                    existingDashboard.remove();
                }
                contentArea.insertAdjacentHTML('beforeend', dashboardHTML);
            }
        };
        
        // Setup real-time metrics updates
        ITArchitectsSuiteEnhanced.prototype.setupRealTimeMetrics = function() {
            // Update metrics every 30 seconds
            setInterval(async () => {
                try {
                    const response = await fetch(`${this.config.apiBaseUrl}/dashboard/metrics`);
                    if (response.ok) {
                        const data = await response.json();
                        this.updateRealTimeMetrics(data.data);
                    }
                } catch (error) {
                    console.error('Error fetching real-time metrics:', error);
                }
            }, 30000);
        };
        
        // Update real-time metrics display
        ITArchitectsSuiteEnhanced.prototype.updateRealTimeMetrics = function(metrics) {
            // Update performance bars
            const updatePerformanceBar = (metric, value) => {
                const bar = document.querySelector(`.performance-item:nth-child(${metric}) div:last-child div`);
                if (bar) {
                    bar.style.width = value + '%';
                }
            };
            
            updatePerformanceBar(1, metrics.systemHealth.cpu);
            updatePerformanceBar(2, metrics.systemHealth.memory);
            updatePerformanceBar(3, metrics.systemHealth.disk);
        };
        
        // Add global dashboard navigation functions
        window.showDashboard = function() {
            // Hide AI diagrams section and show dashboard
            const aiWorkspace = document.querySelector('.ai-workspace-placeholder');
            const detailedDashboard = document.getElementById('detailed-dashboard');
            const mainWorkspace = document.querySelector('.main-workspace');
            const contentHeader = document.getElementById('main-content-header');
            
            if (aiWorkspace) aiWorkspace.style.display = 'none';
            if (mainWorkspace) mainWorkspace.style.display = 'none';
            if (detailedDashboard) detailedDashboard.style.display = 'grid';
            
            // Update nav active state
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-link[onclick="showDashboard()"]')?.classList.add('active');
            
            // Update page title
            if (contentHeader) {
                contentHeader.querySelector('h1').textContent = 'Analytics Dashboard';
                contentHeader.querySelector('p').textContent = 'Monitor AI tool usage, vector database performance, and system metrics';
            }
        };
        
        window.showAIDiagrams = function() {
            // Show AI diagrams section and hide dashboard
            const aiWorkspace = document.querySelector('.ai-workspace-placeholder');
            const detailedDashboard = document.getElementById('detailed-dashboard');
            const mainWorkspace = document.querySelector('.main-workspace');
            const contentHeader = document.getElementById('main-content-header');
            
            if (aiWorkspace) aiWorkspace.style.display = 'block';
            if (mainWorkspace) mainWorkspace.style.display = 'block';
            if (detailedDashboard) detailedDashboard.style.display = 'none';
            
            // Update nav active state
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-link[onclick="showAIDiagrams()"]')?.classList.add('active');
            
            // Update page title
            if (contentHeader) {
                contentHeader.querySelector('h1').textContent = 'AI Architecture Workspace';
                contentHeader.querySelector('p').textContent = 'Create, design, and validate enterprise architecture solutions with AI assistance';
            }
        };
        
        window.showArchitecturePatterns = function() {
            alert('Architecture Patterns view - Coming soon!');
        };
        
        // Add diagram viewing functionality
        window.viewDiagram = function(diagramId) {
            // Mock diagram data for demonstration
            const diagrams = {
                '1': {
                    title: 'E-Commerce Microservices',
                    description: 'Scalable microservices architecture for e-commerce platform',
                    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<mxfile>\n  <diagram name="E-Commerce" id="1">\n    <mxGraphModel>\n      <root>\n        <mxCell id="0"/>\n        <mxCell id="1" parent="0"/>\n        <mxCell id="2" value="API Gateway" vertex="1" parent="1">\n          <mxGeometry x="200" y="100" width="120" height="60" as="geometry"/>\n        </mxCell>\n      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>',
                    sources: [
                        { title: 'AWS Microservices Guide', url: 'https://aws.amazon.com/microservices/' },
                        { title: 'E-Commerce Architecture Patterns', url: 'https://microservices.io/patterns/' }
                    ]
                },
                '2': {
                    title: 'Multi-Cloud Strategy',
                    description: 'Hybrid cloud architecture spanning multiple providers',
                    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<mxfile>\n  <diagram name="Multi-Cloud" id="2">\n    <mxGraphModel>\n      <root>\n        <mxCell id="0"/>\n        <mxCell id="1" parent="0"/>\n        <mxCell id="2" value="Load Balancer" vertex="1" parent="1">\n          <mxGeometry x="200" y="100" width="120" height="60" as="geometry"/>\n        </mxCell>\n      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>',
                    sources: [
                        { title: 'Multi-Cloud Best Practices', url: 'https://cloud.google.com/architecture/multi-cloud' },
                        { title: 'Azure Arc Overview', url: 'https://azure.microsoft.com/en-us/services/azure-arc/' }
                    ]
                },
                '3': {
                    title: 'Zero Trust Security',
                    description: 'Zero trust security architecture implementation',
                    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<mxfile>\n  <diagram name="Zero-Trust" id="3">\n    <mxGraphModel>\n      <root>\n        <mxCell id="0"/>\n        <mxCell id="1" parent="0"/>\n        <mxCell id="2" value="Identity Provider" vertex="1" parent="1">\n          <mxGeometry x="200" y="100" width="120" height="60" as="geometry"/>\n        </mxCell>\n      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>',
                    sources: [
                        { title: 'Zero Trust Architecture', url: 'https://www.nist.gov/publications/zero-trust-architecture' },
                        { title: 'Microsoft Zero Trust', url: 'https://www.microsoft.com/en-us/security/business/zero-trust' }
                    ]
                },
                '4': {
                    title: 'Data Pipeline Architecture',
                    description: 'Real-time data processing and analytics pipeline',
                    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<mxfile>\n  <diagram name="Data-Pipeline" id="4">\n    <mxGraphModel>\n      <root>\n        <mxCell id="0"/>\n        <mxCell id="1" parent="0"/>\n        <mxCell id="2" value="Data Lake" vertex="1" parent="1">\n          <mxGeometry x="200" y="100" width="120" height="60" as="geometry"/>\n        </mxCell>\n      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>',
                    sources: [
                        { title: 'AWS Data Architecture', url: 'https://aws.amazon.com/big-data/datalakes-and-analytics/' },
                        { title: 'Apache Kafka Patterns', url: 'https://kafka.apache.org/documentation/' }
                    ]
                },
                '5': {
                    title: 'Hybrid Cloud Network',
                    description: 'Secure hybrid cloud networking architecture',
                    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<mxfile>\n  <diagram name="Hybrid-Cloud" id="5">\n    <mxGraphModel>\n      <root>\n        <mxCell id="0"/>\n        <mxCell id="1" parent="0"/>\n        <mxCell id="2" value="VPN Gateway" vertex="1" parent="1">\n          <mxGeometry x="200" y="100" width="120" height="60" as="geometry"/>\n        </mxCell>\n      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>',
                    sources: [
                        { title: 'Hybrid Cloud Networking', url: 'https://cloud.google.com/hybrid-connectivity' },
                        { title: 'AWS Direct Connect', url: 'https://aws.amazon.com/directconnect/' }
                    ]
                }
            };
            
            const diagram = diagrams[diagramId];
            if (diagram) {
                // Switch to AI Diagrams view
                showAIDiagrams();
                
                // Display the diagram with enhanced visualization
                setTimeout(() => {
                    if (typeof window.ITArchitectsSuite !== 'undefined') {
                        window.ITArchitectsSuite.displayArchitectureWithSources(
                            { title: diagram.title, description: diagram.description },
                            diagram.xml,
                            diagram.sources,
                            []
                        );
                    }
                }, 500);
                
                // Show notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    z-index: 10000;
                    font-family: 'Segoe UI', sans-serif;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                `;
                notification.innerHTML = `<i class="fas fa-eye"></i> Viewing: ${diagram.title}`;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 3000);
            }
        };
        
        // Initialize dashboard on load
        if (typeof ITArchitectsSuiteEnhanced !== 'undefined') {
            setTimeout(() => {
                const suite = new ITArchitectsSuiteEnhanced();
                suite.initializeDashboard();
            }, 1000);
        }
        
        // Helper methods for enhanced diagram functionality
        ITArchitectsSuiteEnhanced.prototype.loadDrawioInContainer = async function(xmlData) {
            try {
                const container = document.getElementById('drawio-iframe-container');
                if (!container) return;
                
                const iframe = document.createElement('iframe');
                const encodedXML = encodeURIComponent(xmlData);
                const drawioUrl = `${this.config.drawioBaseUrl}/?embed=1&ui=dark&spin=1&chrome=0&modified=unsavedChanges&proto=json&xml=${encodedXML}`;
                
                iframe.src = drawioUrl;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.id = 'drawio-iframe';
                
                container.innerHTML = '';
                container.appendChild(iframe);
                
                // Setup message listener for iframe communication
                this.setupDrawioIframeListener(iframe);
                
                console.log('Draw.io loaded in container');
            } catch (error) {
                console.error('Error loading draw.io in container:', error);
            }
        };
        
        // Generate SVG preview with cloud-native icons
        ITArchitectsSuiteEnhanced.prototype.generateSVGPreview = async function(xmlData) {
            try {
                console.log('Generating cloud-native SVG preview...');
                
                const response = await fetch('/api/diagrams/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        xml: xmlData,
                        format: 'svg'
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    this.displayCloudNativeSVGPreview(result.data);
                } else {
                    console.warn('Failed to generate cloud-native SVG preview');
                    this.showSVGPreviewError();
                }
            } catch (error) {
                console.error('Error generating cloud-native SVG preview:', error);
                this.showSVGPreviewError();
            }
        };
        
        // Display cloud-native SVG preview
        ITArchitectsSuiteEnhanced.prototype.displayCloudNativeSVGPreview = function(svgData) {
            const container = document.getElementById('svg-preview-container');
            if (!container) return;
            
            container.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    height: calc(100% - 60px);
                    overflow: auto;
                    border: 1px solid #e2e8f0;
                ">
                    ${svgData}
                </div>
                <div style="
                    margin-top: 10px;
                    padding: 8px 12px;
                    background: linear-gradient(135deg, #0ea5e9, #3b82f6);
                    border-radius: 6px;
                    font-size: 11px;
                    color: white;
                    text-align: center;
                    font-weight: 500;
                ">
                    <i class="fas fa-cloud"></i> 
                    Cloud-Native Architecture with AWS, Azure, GCP, Kubernetes & Docker Icons
                </div>
            `;
        };
        
        // Show SVG preview error
        ITArchitectsSuiteEnhanced.prototype.showSVGPreviewError = function() {
            const container = document.getElementById('svg-preview-container');
            if (!container) return;
            
            container.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #ef4444;
                    text-align: center;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 12px;"></i>
                    <div style="font-weight: 600; margin-bottom: 8px;">SVG Preview Unavailable</div>
                    <div style="font-size: 14px; opacity: 0.8;">Unable to generate SVG preview</div>
                    <button onclick="refreshSVGPreview()" style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        margin-top: 12px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        };
        
        // Create diagram container if it doesn't exist
        ITArchitectsSuiteEnhanced.prototype.createDiagramContainer = function() {
            let container = document.getElementById('diagram-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'diagram-container';
                const contentArea = document.querySelector('.content-area');
                if (contentArea) {
                    contentArea.appendChild(container);
                }
            }
            return container;
        };
        
        // Global functions for diagram interaction
        window.downloadDiagram = async function(format) {
            try {
                if (!window.currentDiagramXML) {
                    alert('No diagram available for download');
                    return;
                }
                
                const response = await fetch('http://localhost:3001/api/diagrams/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        xml: window.currentDiagramXML,
                        format: format,
                        filename: `architecture-diagram-${new Date().toISOString().split('T')[0]}`
                    })
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `architecture-diagram-${new Date().toISOString().split('T')[0]}.${format}`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    // Show success notification
                    const notification = document.createElement('div');
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #10b981;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        z-index: 10000;
                        font-family: 'Segoe UI', sans-serif;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    `;
                    notification.innerHTML = `<i class="fas fa-check"></i> ${format.toUpperCase()} downloaded successfully!`;
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 3000);
                } else {
                    alert(`Failed to download ${format.toUpperCase()} file`);
                }
            } catch (error) {
                console.error('Download error:', error);
                alert(`Error downloading ${format.toUpperCase()} file`);
            }
        };
        
        window.refreshSVGPreview = async function() {
            try {
                if (!window.currentDiagramXML) {
                    alert('No diagram available for preview');
                    return;
                }
                
                const container = document.getElementById('svg-preview-container');
                if (container) {
                    container.innerHTML = `
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            color: #64748b;
                            font-size: 14px;
                        ">
                            <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>
                            Refreshing cloud-native SVG preview...
                        </div>
                    `;
                }
                
                const response = await fetch('http://localhost:3001/api/diagrams/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        xml: window.currentDiagramXML,
                        format: 'svg'
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (container) {
                        container.innerHTML = `
                            <div style="
                                background: white;
                                border-radius: 8px;
                                padding: 20px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                height: calc(100% - 40px);
                                overflow: auto;
                            ">
                                ${result.data}
                            </div>
                        `;
                    }
                } else {
                    throw new Error('Failed to refresh preview');
                }
            } catch (error) {
                console.error('Refresh error:', error);
                const container = document.getElementById('svg-preview-container');
                if (container) {
                    container.innerHTML = `
                        <div style="
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            color: #ef4444;
                            text-align: center;
                        ">
                            <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 12px;"></i>
                            <div style="font-weight: 600; margin-bottom: 8px;">Refresh Failed</div>
                            <div style="font-size: 14px; opacity: 0.8;">Unable to refresh SVG preview</div>
                        </div>
                    `;
                }
            }
        };
        
        window.openDrawioEditor = function() {
            try {
                if (!window.currentDiagramXML) {
                    alert('No diagram available for editing');
                    return;
                }
                
                const encodedXML = encodeURIComponent(window.currentDiagramXML);
                const editUrl = `https://embed.diagrams.net/?embed=1&ui=dark&spin=1&chrome=0&proto=json&xml=${encodedXML}`;
                window.open(editUrl, 'drawio-editor', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            } catch (error) {
                console.error('Error opening editor:', error);
                alert('Failed to open draw.io editor');
            }
        };
        
        // Enhanced Navigation Functions for Layout Reorganization
        window.showDashboard = function() {
            console.log('Switching to Dashboard view...');
            
            // Hide AI workspace elements
            const aiWorkspace = document.querySelector('.ai-workspace-placeholder');
            const mainWorkspace = document.querySelector('.main-workspace');
            const aiWorkspaceCard = document.getElementById('ai-workspace-card');
            const detailedDashboard = document.getElementById('detailed-dashboard');
            const contentHeader = document.getElementById('main-content-header');
            
            if (aiWorkspace) aiWorkspace.style.display = 'none';
            if (mainWorkspace) mainWorkspace.style.display = 'none';
            if (aiWorkspaceCard) aiWorkspaceCard.style.display = 'none';
            
            // Show dashboard
            if (detailedDashboard) {
                detailedDashboard.style.display = 'grid';
            } else {
                // Create dashboard if it doesn't exist
                console.log('Creating dashboard...');
                if (typeof ITArchitectsSuiteEnhanced !== 'undefined' && window.architectsSuite) {
                    window.architectsSuite.initializeDashboard();
                }
            }
            
            // Update navigation active state
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const dashboardLink = document.querySelector('.nav-link[onclick="showDashboard()"]');
            if (dashboardLink) dashboardLink.classList.add('active');
            
            // Update page header for dashboard
            if (contentHeader) {
                const h1 = contentHeader.querySelector('h1');
                const p = contentHeader.querySelector('p');
                
                if (!h1) {
                    const headerHTML = `
                        <h1>Analytics Dashboard</h1>
                        <p>Monitor AI tool usage, vector database performance, and system metrics</p>
                    `;
                    contentHeader.innerHTML = headerHTML + contentHeader.innerHTML;
                } else {
                    h1.textContent = 'Analytics Dashboard';
                    if (p) p.textContent = 'Monitor AI tool usage, vector database performance, and system metrics';
                }
            }
            
            console.log('Dashboard view activated');
        };
        
        window.showAIDiagrams = function() {
            console.log('Switching to AI Diagrams view...');
            
            // Show AI workspace elements
            const aiWorkspace = document.querySelector('.ai-workspace-placeholder');
            const mainWorkspace = document.querySelector('.main-workspace');
            const aiWorkspaceCard = document.getElementById('ai-workspace-card');
            const detailedDashboard = document.getElementById('detailed-dashboard');
            const contentHeader = document.getElementById('main-content-header');
            
            if (aiWorkspace) aiWorkspace.style.display = 'block';
            if (mainWorkspace) mainWorkspace.style.display = 'block';
            if (aiWorkspaceCard) aiWorkspaceCard.style.display = 'block';
            
            // Hide dashboard
            if (detailedDashboard) detailedDashboard.style.display = 'none';
            
            // Update navigation active state
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const aiDiagramsLink = document.querySelector('.nav-link[onclick="showAIDiagrams()"]');
            if (aiDiagramsLink) aiDiagramsLink.classList.add('active');
            
            // Reset page header for AI Diagrams (header removed as requested)
            if (contentHeader) {
                const h1 = contentHeader.querySelector('h1');
                const p = contentHeader.querySelector('p');
                
                // Remove title and subtitle if they exist
                if (h1) h1.remove();
                if (p) p.remove();
            }
            
            console.log('AI Diagrams view activated');
        };
        
        // Diagram viewing functionality for sourced diagrams
        window.viewDiagram = function(diagramId) {
            console.log('Viewing diagram with ID:', diagramId);
            
            // Mock diagram data with sources and reasoning - in production this would come from backend
            const mockDiagrams = {
                '1': {
                    title: 'E-Commerce Microservices Architecture',
                    description: 'Scalable microservices architecture for e-commerce platform with event-driven communication',
                    xml: '<mxGraphModel><!-- E-commerce microservices XML --></mxGraphModel>',
                    sources: [
                        {
                            title: 'AWS Well-Architected Framework',
                            description: 'Best practices for cloud architecture design and implementation',
                            url: 'https://aws.amazon.com/architecture/well-architected/',
                            relevance: 95
                        },
                        {
                            title: 'Microservices.io Patterns',
                            description: 'Comprehensive microservices architecture patterns and practices',
                            url: 'https://microservices.io/patterns/',
                            relevance: 92
                        },
                        {
                            title: 'Event-Driven Architecture Guide',
                            description: 'Event-driven communication patterns for distributed systems',
                            url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html',
                            relevance: 88
                        }
                    ],
                    reasoningSteps: [
                        {
                            step: 1,
                            title: 'Requirements Analysis',
                            description: 'Analyzed e-commerce requirements including scalability, fault tolerance, and data consistency needs',
                            duration: '0.8s',
                            sources: ['AWS Well-Architected Framework', 'Domain-Driven Design']
                        },
                        {
                            step: 2,
                            title: 'Service Decomposition',
                            description: 'Identified core business domains and decomposed into cohesive microservices',
                            duration: '1.2s',
                            sources: ['Microservices.io Patterns', 'DDD Principles']
                        },
                        {
                            step: 3,
                            title: 'Communication Design',
                            description: 'Selected event-driven patterns for loose coupling between services',
                            duration: '0.9s',
                            sources: ['Event-Driven Architecture Guide', 'Apache Kafka Documentation']
                        }
                    ]
                },
                '2': {
                    title: 'Multi-Cloud Strategy Architecture',
                    description: 'Hybrid cloud architecture spanning AWS, Azure, and GCP for high availability',
                    xml: '<mxGraphModel><!-- Multi-cloud strategy XML --></mxGraphModel>',
                    sources: [
                        {
                            title: 'Multi-Cloud Architecture Best Practices',
                            description: 'Strategic approaches to multi-cloud deployment and management',
                            url: 'https://cloud.google.com/architecture/multicloud',
                            relevance: 96
                        },
                        {
                            title: 'Cloud Provider Comparison',
                            description: 'Comparative analysis of AWS, Azure, and GCP services',
                            url: 'https://azure.microsoft.com/en-us/overview/multicloud/',
                            relevance: 89
                        }
                    ],
                    reasoningSteps: [
                        {
                            step: 1,
                            title: 'Provider Analysis',
                            description: 'Evaluated strengths and capabilities of major cloud providers',
                            duration: '1.1s',
                            sources: ['Multi-Cloud Architecture Best Practices']
                        },
                        {
                            step: 2,
                            title: 'Risk Assessment',
                            description: 'Analyzed vendor lock-in risks and mitigation strategies',
                            duration: '0.7s',
                            sources: ['Cloud Provider Comparison']
                        }
                    ]
                }
                // Add more mock diagrams as needed
            };
            
            const diagram = mockDiagrams[diagramId];
            if (!diagram) {
                console.error('Diagram not found:', diagramId);
                alert('Diagram not found');
                return;
            }
            
            // Switch to AI Diagrams view
            showAIDiagrams();
            
            // Display the selected diagram with sources and reasoning
            if (typeof ITArchitectsSuiteEnhanced !== 'undefined' && window.architectsSuite) {
                window.architectsSuite.displayArchitectureWithSources(
                    {
                        title: diagram.title,
                        description: diagram.description,
                        components: [],
                        recommendations: []
                    },
                    diagram.xml,
                    diagram.sources,
                    diagram.reasoningSteps
                );
            }
            
            // Show notification
            console.log('Loaded diagram:', diagram.title);
        };
        
        // Add click handlers for diagram items
        document.addEventListener('DOMContentLoaded', function() {
            // Add click handlers to sourced diagram items
            const diagramItems = document.querySelectorAll('.diagram-item[data-diagram-id]');
            diagramItems.forEach(item => {
                item.addEventListener('click', function() {
                    const diagramId = this.getAttribute('data-diagram-id');
                    if (diagramId) {
                        viewDiagram(diagramId);
                    }
                });
            });
            
            console.log('Enhanced navigation and diagram viewing functionality loaded');
        });
    }
})();
