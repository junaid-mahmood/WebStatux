import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.get('/api/upcoming', async (req, res) => {
    try {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
            }
        };

        const response = await fetch(
            'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1',
            options
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const moviesWithGenres = await Promise.all(
            data.results.map(async (movie) => {
                const movieResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`,
                    options
                );
                
                if (!movieResponse.ok) {
                    return {
                        ...movie,
                        genre_ids: []
                    };
                }

                const details = await movieResponse.json();
                return {
                    ...movie,
                    genre_ids: details.genres.map(genre => genre.id)
                };
            })
        );
        
        data.results = moviesWithGenres;
        res.json(data);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ 
            error: 'Failed to fetch upcoming movies',
            details: error.message 
        });
    }
});

// Add this if running directly (not through Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

export default app;


