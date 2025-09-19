// Vector Database Controller with RAG Capabilities
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

// Simple in-memory vector database for development
// In production, replace with Pinecone, Chroma, or similar
class SimpleVectorDB {
    constructor() {
        this.vectors = [];
        this.dataPath = path.join(__dirname, '../data/vector-db.json');
        this.loadData();
    }

    async loadData() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            this.vectors = JSON.parse(data);
        } catch (error) {
            this.vectors = [];
            console.log('Starting with empty vector database');
        }
    }

    async saveData() {
        try {
            const dataDir = path.dirname(this.dataPath);
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(this.dataPath, JSON.stringify(this.vectors, null, 2));
        } catch (error) {
            console.error('Error saving vector data:', error);
        }
    }

    // Simple text vectorization (cosine similarity)
    textToVector(text) {
        const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
        const vector = {};
        
        words.forEach(word => {
            vector[word] = (vector[word] || 0) + 1;
        });
        
        return vector;
    }

    // Calculate cosine similarity
    cosineSimilarity(vecA, vecB) {
        const keysA = Object.keys(vecA);
        const keysB = Object.keys(vecB);
        const allKeys = [...new Set([...keysA, ...keysB])];
        
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;
        
        allKeys.forEach(key => {
            const a = vecA[key] || 0;
            const b = vecB[key] || 0;
            dotProduct += a * b;
            magnitudeA += a * a;
            magnitudeB += b * b;
        });
        
        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    }

    async store(data) {
        const vector = this.textToVector(data.originalPrompt + ' ' + data.enhancedPrompt);
        
        const entry = {
            id: `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            vector,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.vectors.push(entry);
        await this.saveData();
        
        return entry.id;
    }

    async search(query, limit = 5, threshold = 0.3) {
        const queryVector = this.textToVector(query);
        
        const similarities = this.vectors.map(entry => ({
            ...entry,
            similarity: this.cosineSimilarity(queryVector, entry.vector)
        }));
        
        return similarities
            .filter(item => item.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }
}

const vectorDB = new SimpleVectorDB();

/**
 * Store data in vector database
 */
const store = async (req, res) => {
    try {
        const {
            sessionId,
            originalPrompt,
            enhancedPrompt,
            analysis,
            architecture,
            diagramXML,
            diagramType,
            metadata
        } = req.body;

        if (!originalPrompt || !architecture) {
            return res.status(400).json({ error: 'originalPrompt and architecture are required' });
        }

        logger.info(`Storing vector data for session: ${sessionId}`);

        const vectorId = await vectorDB.store({
            sessionId,
            originalPrompt,
            enhancedPrompt,
            analysis,
            architecture,
            diagramXML,
            diagramType,
            metadata
        });

        res.json({
            success: true,
            vectorId,
            message: 'Data stored in vector database successfully'
        });

    } catch (error) {
        logger.error('Error storing in vector database:', error);
        res.status(500).json({
            error: 'Failed to store in vector database',
            details: error.message
        });
    }
};

/**
 * Search similar architectures using RAG
 */
const search = async (req, res) => {
    try {
        const { query, limit = 5, threshold = 0.3 } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query is required' });
        }

        logger.info(`Searching vector database for: ${query.substring(0, 50)}...`);

        const results = await vectorDB.search(query, limit, threshold);

        res.json({
            success: true,
            matches: results.map(result => ({
                id: result.id,
                similarity: result.similarity,
                originalPrompt: result.data.originalPrompt,
                architecture: result.data.architecture,
                diagramType: result.data.diagramType,
                timestamp: result.data.timestamp
            })),
            total: results.length
        });

    } catch (error) {
        logger.error('Error searching vector database:', error);
        res.status(500).json({
            error: 'Failed to search vector database',
            details: error.message
        });
    }
};

/**
 * Get enhanced context using RAG
 */
const getContext = async (req, res) => {
    try {
        const { prompt, maxResults = 3 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const similarResults = await vectorDB.search(prompt, maxResults, 0.4);

        const context = {
            similarArchitectures: similarResults.map(result => ({
                prompt: result.data.originalPrompt,
                architecture: result.data.architecture,
                similarity: result.similarity
            })),
            recommendations: [],
            patterns: []
        };

        // Extract patterns and recommendations from similar architectures
        if (similarResults.length > 0) {
            const allRecommendations = [];
            const allPatterns = [];
            
            similarResults.forEach(result => {
                if (result.data.architecture.recommendations) {
                    allRecommendations.push(...result.data.architecture.recommendations);
                }
                if (result.data.architecture.patterns) {
                    allPatterns.push(...result.data.architecture.patterns);
                }
            });

            // Get unique recommendations and patterns
            context.recommendations = [...new Set(allRecommendations)].slice(0, 5);
            context.patterns = [...new Set(allPatterns)].slice(0, 5);
        }

        res.json({
            success: true,
            context,
            message: `Found ${similarResults.length} similar architectures`
        });

    } catch (error) {
        logger.error('Error getting context from vector database:', error);
        res.status(500).json({
            error: 'Failed to get context',
            details: error.message
        });
    }
};

/**
 * Get database statistics
 */
const getStats = async (req, res) => {
    try {
        const stats = {
            totalVectors: vectorDB.vectors.length,
            diagramTypes: {},
            sessionCount: new Set(vectorDB.vectors.map(v => v.data.sessionId)).size,
            oldestEntry: vectorDB.vectors.length > 0 ? 
                Math.min(...vectorDB.vectors.map(v => new Date(v.timestamp).getTime())) : null,
            newestEntry: vectorDB.vectors.length > 0 ? 
                Math.max(...vectorDB.vectors.map(v => new Date(v.timestamp).getTime())) : null
        };

        // Count diagram types
        vectorDB.vectors.forEach(vector => {
            const type = vector.data.diagramType || 'unknown';
            stats.diagramTypes[type] = (stats.diagramTypes[type] || 0) + 1;
        });

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        logger.error('Error getting vector database stats:', error);
        res.status(500).json({
            error: 'Failed to get database stats',
            details: error.message
        });
    }
};

module.exports = {
    store,
    search,
    getContext,
    getStats
};
