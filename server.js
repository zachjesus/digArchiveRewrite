import express from 'express';
import arweaveRouter from './server/arweave.js';

const app = express();
const PORT = 3001;

app.use('/arweave', arweaveRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
