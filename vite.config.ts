import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function aiMatchPlugin(): Plugin {
  return {
    name: 'campusfind-ai-match-api',
    configureServer(server) {
      server.middlewares.use('/api/ai-match', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { lostItem, foundItem } = JSON.parse(body || '{}');

            // Strictly enforce category match
            if (!lostItem || !foundItem || lostItem.category !== foundItem.category) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ matchRecord: null, reason: 'Categories must match strictly' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ available: false, reason: 'No active Gemini API key found' }));
              return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `You are the matching evaluator for CampusFind AI, a university lost and found system.
Evaluate the similarity between this LOST item and FOUND item.
Both are strictly in the category: "${lostItem.category}".

LOST ITEM:
- Title: ${lostItem.title}
- Category: ${lostItem.category}
- Brand: ${lostItem.brand || 'N/A'}
- Model: ${lostItem.model || 'N/A'}
- Color: ${lostItem.color}
- Identifying Features: ${lostItem.identifyingFeatures}
- Campus Location: ${lostItem.campusLocation}
- Date: ${lostItem.date}
- Description: ${lostItem.description}

FOUND ITEM:
- Title: ${foundItem.title}
- Category: ${foundItem.category}
- Brand: ${foundItem.brand || 'N/A'}
- Model: ${foundItem.model || 'N/A'}
- Color: ${foundItem.color}
- Identifying Features: ${foundItem.identifyingFeatures}
- Campus Location: ${foundItem.campusLocation}
- Date: ${foundItem.date}
- Description: ${foundItem.description}

Analyze the items across:
1. Category Compatibility (always 100)
2. Brand & Model Alignment (0-100)
3. Color & Identifying Features (0-100)
4. Campus Spatiotemporal Proximity (0-100)

Return ONLY valid JSON matching this schema:
{
  "score": number (0 to 100, weighted overall match score),
  "confidence": "High" | "Medium" | "Low",
  "reasoning": "1-2 concise sentences explaining why they match or differ",
  "brandModelScore": number,
  "featureColorScore": number,
  "spatioTemporalScore": number
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json'
              }
            });

            const text = response.text || '{}';
            const parsed = JSON.parse(text);

            const matchRecord = {
              id: `match_${lostItem.id}_${foundItem.id}`,
              lostItemId: lostItem.id,
              foundItemId: foundItem.id,
              category: lostItem.category,
              score: Math.min(100, Math.max(0, parsed.score || 75)),
              matchConfidence: parsed.confidence || 'Medium',
              matchEngine: 'AI Model (Gemini)',
              breakdown: [
                {
                  name: 'Category Compatibility',
                  score: 100,
                  weight: 25,
                  details: `Verified matching ${lostItem.category}`
                },
                {
                  name: 'Brand & Model Alignment',
                  score: parsed.brandModelScore || 80,
                  weight: 25,
                  details: `${lostItem.brand || 'N/A'} vs ${foundItem.brand || 'N/A'}`
                },
                {
                  name: 'Color & Features',
                  score: parsed.featureColorScore || 75,
                  weight: 25,
                  details: 'Visual traits and signature marks comparison'
                },
                {
                  name: 'Campus Spatiotemporal',
                  score: parsed.spatioTemporalScore || 70,
                  weight: 25,
                  details: `${lostItem.campusLocation} vs ${foundItem.campusLocation}`
                }
              ],
              reasoning: parsed.reasoning || 'Evaluated via Gemini 2.5 Flash semantic comparison.',
              status: 'Unreviewed',
              createdAt: new Date().toISOString()
            };

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ matchRecord, engine: 'AI Model (Gemini)' }));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ available: false, error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aiMatchPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
