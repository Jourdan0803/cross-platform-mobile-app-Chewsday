// export default router;
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const YELP_API_TOKEN = process.env.YELP_API_TOKEN;
const GPT_API_KEY = process.env.GPT_API_KEY;

router.get('/', async (req: Request, res: Response): Promise<any> => {
    const { latitude, longitude } = req.query;

    // Validate latitude and longitude
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const yelpApiUrl = `https://api.yelp.com/v3/businesses/search?latitude=${encodeURIComponent(latitude as string)}&longitude=${encodeURIComponent(longitude as string)}&term=restaurant&sort_by=rating&limit=10`;

    try {
        // Fetch restaurant data from Yelp API
        const yelpResponse = await fetch(yelpApiUrl, {
            headers: {
                'Authorization': `Bearer ${YELP_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!yelpResponse.ok) {
            const errorText = await yelpResponse.text();
            console.error('Failed to fetch Yelp API:', yelpResponse.status, yelpResponse.statusText, errorText);
            return res.status(yelpResponse.status).json({ error: errorText });
        }

        const yelpData = await yelpResponse.json();
        const businesses = yelpData.businesses;
        // console.log("Businesses data from Yelp:", businesses);

        // Sort businesses using GPT
        const sortedIndexes = await getSortedIndexesFromGPT(businesses);

        // Arrange businesses according to sorted indexes
        const sortedBusinesses = sortedIndexes.map((index: number) => businesses[index]);

        // Send sorted businesses as response
        res.status(200).json({ businesses: sortedBusinesses });
    } catch (error) {
        console.error('Error fetching top restaurants:', error);
        res.status(500).json({ error: 'Failed to fetch top restaurants' });
    }
});

async function getSortedIndexesFromGPT(businesses: any[]): Promise<number[]> {
    const prompt = `Sort the following restaurants based on their ratings, distance, and price, and return only a JSON array of indexes for the top 5 most suitable restaurants, like [3, 0, 2, 1, 4]. Only return the array, nothing else. Data: ${JSON.stringify(businesses)}`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GPT_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant for sorting data.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 50,
        }),
    });

    const gptData = await gptResponse.json();
    console.log("GPT Response Data:", gptData);

    let sortedIndexes;
    try {
        let content = gptData.choices[0].message.content.trim();
        console.log("GPT returned content:", content);

        // Remove Markdown code block markers, if present
        content = content.replace(/```json|```/g, '').trim();

        // Parse the content as JSON and check if it is an array
        sortedIndexes = JSON.parse(content);

        if (!Array.isArray(sortedIndexes)) {
            throw new Error("GPT response is not an array");
        }
    } catch (error) {
        console.error("Error parsing GPT response:", error);
        // Default to sequential indexes if parsing fails
        sortedIndexes = Array.from({ length: businesses.length }, (_, i) => i);
    }

    console.log("Sorted indexes:", sortedIndexes);
    return sortedIndexes;
}

export default router;
