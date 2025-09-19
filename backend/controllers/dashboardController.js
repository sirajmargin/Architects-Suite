// Dashboard Controller - Analytics and Statistics for IT Architects Suite
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Get comprehensive dashboard statistics
 */
const getDashboardStats = async (req, res) => {
    try {
        logger.info('Fetching dashboard statistics...');

        // Mock comprehensive statistics - in production, get from actual databases
        const stats = {
            overview: {
                totalRequests: 1247,
                architecturesGenerated: 892,
                successRate: 94.2,
                avgProcessingTime: '8.7s',
                lastUpdated: new Date().toISOString()
            },
            
            aiToolsUsage: {
                promptAnalysis: {
                    total: 1247,
                    successful: 1183,
                    avgTime: '2.3s',
                    trends: [
                        { date: '2024-01-15', count: 45 },
                        { date: '2024-01-16', count: 52 },
                        { date: '2024-01-17', count: 48 },
                        { date: '2024-01-18', count: 61 },
                        { date: '2024-01-19', count: 58 }
                    ]
                },
                architectureGeneration: {
                    total: 892,
                    successful: 841,
                    avgTime: '5.2s',
                    patterns: {
                        'microservices': 324,
                        'cloud-native': 287,
                        'monolithic': 145,
                        'serverless': 89,
                        'hybrid': 47
                    }
                },
                diagramCreation: {
                    total: 841,
                    successful: 816,
                    avgTime: '3.1s',
                    types: {
                        'auto-detect': 345,
                        'cloud-architecture': 234,
                        'uml': 123,
                        'flowchart': 87,
                        'er-diagram': 42,
                        'bpmn': 10
                    }
                },
                powerPointGeneration: {
                    total: 623,
                    successful: 598,
                    avgTime: '4.7s',
                    templatesUsed: 156
                }
            },
            
            vectorDatabase: {
                overview: {
                    totalVectors: 841,
                    totalSessions: 367,
                    avgVectorSimilarity: 0.73,
                    storageUsed: '145.2 MB',
                    lastIndexed: new Date(Date.now() - 1000 * 60 * 23).toISOString()
                },
                ragPerformance: {
                    queriesServed: 234,
                    avgRetrievalTime: '0.8s',
                    relevanceScore: 0.87,
                    cacheHitRate: 62.3
                },
                contentBreakdown: {
                    prompts: 841,
                    architectures: 841,
                    diagrams: 816,
                    sources: 4205,
                    reasoningSteps: 4205
                },
                topQueries: [
                    { query: 'microservices API gateway', count: 43, avgRelevance: 0.92 },
                    { query: 'cloud migration strategy', count: 38, avgRelevance: 0.89 },
                    { query: 'kubernetes deployment', count: 34, avgRelevance: 0.86 },
                    { query: 'serverless architecture', count: 29, avgRelevance: 0.84 },
                    { query: 'data pipeline design', count: 25, avgRelevance: 0.81 }
                ]
            },
            
            performanceMetrics: {
                systemHealth: {
                    cpuUsage: 23.4,
                    memoryUsage: 67.8,
                    diskUsage: 34.2,
                    uptime: '7d 14h 32m',
                    status: 'healthy'
                },
                apiEndpoints: [
                    { endpoint: '/api/ai/generate-architecture', requests: 892, avgLatency: '5.2s', errorRate: 6.8 },
                    { endpoint: '/api/ai/analyze-prompt', requests: 1247, avgLatency: '2.3s', errorRate: 5.1 },
                    { endpoint: '/api/diagrams/generate', requests: 841, avgLatency: '3.1s', errorRate: 3.0 },
                    { endpoint: '/api/vector/store', requests: 841, avgLatency: '0.9s', errorRate: 1.2 },
                    { endpoint: '/api/vector/search', requests: 234, avgLatency: '0.8s', errorRate: 2.1 }
                ],
                errors: {
                    total: 89,
                    byCategory: {
                        'timeout': 34,
                        'validation': 23,
                        'ai-service': 18,
                        'network': 14
                    },
                    recentErrors: [
                        { timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'timeout', endpoint: '/api/ai/generate-architecture' },
                        { timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: 'validation', endpoint: '/api/ai/analyze-prompt' },
                        { timestamp: new Date(Date.now() - 1000 * 60 * 78).toISOString(), type: 'ai-service', endpoint: '/api/ai/generate-architecture' }
                    ]
                }
            },
            
            userActivity: {
                activeSessions: 23,
                peakConcurrentUsers: 67,
                avgSessionDuration: '28m 34s',
                bounceRate: 12.4,
                topFeatures: [
                    { feature: 'AI Architecture Generation', usage: 89.2 },
                    { feature: 'Diagram Creation', usage: 76.8 },
                    { feature: 'PowerPoint Export', usage: 62.3 },
                    { feature: 'Template Upload', usage: 45.7 },
                    { feature: 'Architecture Search', usage: 28.9 }
                ],
                geographicDistribution: [
                    { country: 'United States', users: 156, percentage: 42.5 },
                    { country: 'United Kingdom', users: 78, percentage: 21.3 },
                    { country: 'Germany', users: 45, percentage: 12.3 },
                    { country: 'Canada', users: 34, percentage: 9.3 },
                    { country: 'Australia', users: 23, percentage: 6.3 }
                ]
            }
        };

        res.json({
            success: true,
            stats,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error fetching dashboard statistics:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard statistics',
            details: error.message
        });
    }
};

/**
 * Get real-time metrics
 */
const getRealTimeMetrics = async (req, res) => {
    try {
        const realTimeData = {
            currentLoad: {
                activeRequests: Math.floor(Math.random() * 15) + 1,
                queueLength: Math.floor(Math.random() * 5),
                avgResponseTime: (Math.random() * 3 + 2).toFixed(1) + 's'
            },
            systemHealth: {
                cpu: Math.floor(Math.random() * 30) + 15,
                memory: Math.floor(Math.random() * 20) + 60,
                disk: Math.floor(Math.random() * 10) + 30
            },
            recentActivity: [
                { time: new Date().toISOString(), action: 'Architecture Generated', user: 'user_' + Math.floor(Math.random() * 1000) },
                { time: new Date(Date.now() - 30000).toISOString(), action: 'Diagram Created', user: 'user_' + Math.floor(Math.random() * 1000) },
                { time: new Date(Date.now() - 60000).toISOString(), action: 'PowerPoint Exported', user: 'user_' + Math.floor(Math.random() * 1000) }
            ]
        };

        res.json({
            success: true,
            data: realTimeData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error fetching real-time metrics:', error);
        res.status(500).json({
            error: 'Failed to fetch real-time metrics',
            details: error.message
        });
    }
};

/**
 * Export dashboard data
 */
const exportDashboardData = async (req, res) => {
    try {
        const { format = 'json', dateRange = '7d' } = req.query;
        
        logger.info(`Exporting dashboard data in ${format} format for ${dateRange}`);

        // Get dashboard stats
        const dashboardData = await getDashboardStats({ query: { dateRange } }, { json: (data) => data });
        
        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(dashboardData.stats);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.csv"');
            res.send(csv);
        } else {
            // Return JSON
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.json"');
            res.json(dashboardData.stats);
        }

    } catch (error) {
        logger.error('Error exporting dashboard data:', error);
        res.status(500).json({
            error: 'Failed to export dashboard data',
            details: error.message
        });
    }
};

// Helper function to convert stats to CSV
const convertToCSV = (stats) => {
    const rows = [];
    rows.push(['Metric', 'Value', 'Category']);
    
    // Overview metrics
    Object.entries(stats.overview).forEach(([key, value]) => {
        rows.push([key, value, 'Overview']);
    });
    
    // AI Tools Usage
    rows.push([`AI Tools - Total Requests`, stats.aiToolsUsage.promptAnalysis.total, 'AI Tools']);
    rows.push([`AI Tools - Success Rate`, `${stats.overview.successRate}%`, 'AI Tools']);
    
    // Vector Database
    Object.entries(stats.vectorDatabase.overview).forEach(([key, value]) => {
        rows.push([`Vector DB - ${key}`, value, 'Vector Database']);
    });
    
    return rows.map(row => row.join(',')).join('\n');
};

module.exports = {
    getDashboardStats,
    getRealTimeMetrics,
    exportDashboardData
};