# User Manual
## Architects Suite - AI-Powered Architecture Diagrams

### Getting Started

#### 1. Accessing the Application
- Open your web browser
- Navigate to `http://localhost:3000`
- You'll see the Architects Suite homepage

#### 2. Dashboard Overview
Click "Get Started" to access the main dashboard featuring:
- **Statistics Cards:** Total diagrams, shared diagrams, collaborators
- **AI Recommendations:** Suggested diagram types
- **Create New Diagram:** Quick access to diagram creation
- **Your Diagrams:** Grid/list view of existing diagrams

### Creating Architecture Diagrams

#### Method 1: AI-Powered Generation
1. **Access AI Generator:**
   - Click "AI Generate" on dashboard
   - Or visit `/diagrams/create?type=cloud-architecture`

2. **Enter Description:**
   - Type your architecture description in plain English
   - Examples:
     - "Create a microservices architecture with user and order services"
     - "Design a serverless application with API Gateway and Lambda"
     - "Build a Kubernetes deployment with load balancer"

3. **Generate Diagram:**
   - Click "Generate Architecture" or press Ctrl+Enter
   - Wait for AI processing (typically 2-5 seconds)

4. **View Results:**
   - **Presentation View:** Professional slides with overview
   - **Diagram View:** Interactive visual diagram
   - **Draw.io View:** Editable format for further customization
   - **Code View:** Generated infrastructure code

#### Method 2: Manual Creation
1. Select diagram type from dashboard:
   - **Flowchart:** Process flows and decision trees
   - **Sequence:** Time-based interactions
   - **ERD:** Database relationships
   - **Cloud:** Cloud architecture patterns

2. Use the code editor to write diagram syntax
3. Preview in real-time as you type

### Working with Generated Diagrams

#### Presentation Mode (Default)
- **Navigation:** Use Previous/Next buttons or arrow keys
- **Slides Include:**
  - Title slide with generation details
  - Component breakdown
  - Architecture diagram
  - Summary and recommendations

#### Diagram View
- **Interactive Elements:** Click on services to see details
- **Zoom:** Mouse wheel to zoom in/out
- **Pan:** Click and drag to move around

#### Draw.io Export
- **Download:** Click "Download .drawio" button
- **Edit:** Open in draw.io for advanced editing
- **Share:** Compatible with draw.io web and desktop

#### Infrastructure Code
- **View Code:** Switch to Code tab
- **Copy:** Select and copy generated code
- **Formats:** Terraform, Kubernetes YAML, CloudFormation

### Customizing Presentations

#### Upload Custom Template
1. **Access PPT View:** Switch to Presentation tab
2. **Upload Template:** Click "Upload Template" button
3. **Select File:** Choose JSON template file
4. **Apply:** Template automatically applies to current presentation

#### Template Format
```json
{
  "id": "custom",
  "name": "My Company Template",
  "slides": [
    {
      "title": "Architecture Overview",
      "layout": "title"
    },
    {
      "title": "System Components", 
      "layout": "content"
    }
  ]
}
```

### Collaboration Features

#### Sharing Diagrams
1. **Generate Share Link:** Click share button on any diagram
2. **Set Permissions:** View-only or edit access
3. **Copy Link:** Share with team members

#### Real-time Collaboration
- **Live Editing:** Multiple users can edit simultaneously
- **Cursor Tracking:** See where others are working
- **Auto-save:** Changes saved automatically

### Tips and Best Practices

#### Writing Effective Prompts
- **Be Specific:** Include service names and relationships
- **Use Keywords:** "microservices", "serverless", "load balancer"
- **Mention Scale:** "high availability", "auto-scaling"
- **Include Technologies:** "AWS", "Kubernetes", "Docker"

#### Example Prompts
```
Good: "Create a microservices e-commerce platform with user service, 
product catalog, order processing, and payment gateway, all behind 
an API gateway with separate databases"

Better: "Design a scalable e-commerce architecture using AWS services 
with ECS for microservices, RDS for databases, ElastiCache for caching, 
and CloudFront for CDN"
```

#### Diagram Organization
- **Naming Convention:** Use clear, descriptive names
- **Folder Structure:** Organize by project or team
- **Version Control:** Use descriptive commit messages
- **Documentation:** Add descriptions to complex diagrams

### Troubleshooting

#### Common Issues

**Diagram Not Generating:**
- Check internet connection
- Verify prompt is descriptive enough
- Try refreshing the page

**Export Not Working:**
- Ensure popup blockers are disabled
- Check browser download settings
- Try different export format

**Slow Performance:**
- Close unnecessary browser tabs
- Clear browser cache
- Check system resources

**Services Not Responding:**
- Verify all Docker containers are running
- Check service health at `/api/health`
- Restart services if needed

#### Getting Help
- **Documentation:** Check this user manual
- **API Reference:** See API specification
- **Support:** Contact development team
- **Community:** Join user forums

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Generate Diagram | Ctrl+Enter |
| Save Diagram | Ctrl+S |
| New Diagram | Ctrl+N |
| Export | Ctrl+E |
| Zoom In | Ctrl++ |
| Zoom Out | Ctrl+- |
| Reset Zoom | Ctrl+0 |

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- JavaScript enabled
- Local storage access
- WebSocket support (for collaboration)