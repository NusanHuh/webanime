const express = require('express');
const cors = require('cors');
const { AnimeWallpaper, AnimeSource } = require('anime-wallpaper');
const path = require('path');
const axios = require('axios');

const app = express();
const wallpaper = new AnimeWallpaper();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function checkImage(url) {
    try {
        const response = await axios.head(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    
    try {
        const result = await wallpaper.search({ title: query }, AnimeSource.WallHaven);
        const validImages = [];
        
        for (const img of result) {
            if (await checkImage(img.image)) {
                validImages.push(img);
            }
        }
        
        res.json(validImages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});