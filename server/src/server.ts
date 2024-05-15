import express, { Request, Response } from 'express';
import { fetchGraphData, selectNode, deselectNode } from './database';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// API endpoint to get graph data
app.get('/api/graph', async (req: Request, res: Response) => {
    try {
        const graphData = await fetchGraphData();
        res.json(graphData);
    } catch (error) {
        console.error('Error fetching graph data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to select a node
app.post('/api/select-node', async (req: Request, res: Response) => {
    const { nodeName } = req.body;
    try {
        await selectNode(nodeName);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error selecting node:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to deselect a node
app.post('/api/deselect-node', async (req: Request, res: Response) => {
    const { nodeName } = req.body;
    try {
        await deselectNode(nodeName);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deselecting node:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});