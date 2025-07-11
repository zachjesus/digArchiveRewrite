import express from 'express';
import arweaveRouter from './arweave.js';

const app = express();

app.use('/arweave', arweaveRouter);

app.listen(3001, () => {
  console.log('Server listening on port 3001');
});
