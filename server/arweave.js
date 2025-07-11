import express from 'express';
import Arweave from 'arweave';
import ArDB from 'ardb';

const router = express.Router();

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

const ArDBClass = ArDB.default ? ArDB.default : ArDB;
const ardb = new ArDBClass(arweave);

router.get('/folder/:id', async (req, res) => {
    try {
        const driveId = req.params.id;
        const parentFolderId = req.query.parentFolderId;
        console.log('Searching for Drive-Id:', driveId, 'and Parent-Folder-Id:', parentFolderId);

        let tags = [];
        if (driveId) {
            tags.push({ name: 'Drive-Id', values: [driveId] });
        }
        if (parentFolderId) {
            tags.push({ name: 'Parent-Folder-Id', values: [parentFolderId] });
        }

        let txs = await ardb.search('transactions')
            .tags(tags)
            .find();

        if (txs.length === 0) {
            console.log('No results for Drive-Id and Parent-Folder-Id, trying broader query...');
            txs = await ardb.search('transactions').find();
        }

        const results = await Promise.all(
            txs.map(async tx => {
                let metadata = null;
                try {
                    const response = await fetch(`https://arweave.net/${tx.id}`);
                    if (response.ok) {
                        metadata = await response.json();
                    }
                } catch (e) {
                    metadata = null;
                }
                return {
                    id: tx.id,
                    tags: tx.tags,
                    metadata
                };
            })
        );

        res.json(results);
    } catch (error) {
        console.error('ArDB backend error:', error); 
        res.status(500).json({ error: error.message });
    }
});

router.get('/data/:txId', async (req, res) => {
    const txId = req.params.txId;
    const gateways = [
        `https://arweave.net/${txId}`,
        `https://arweave.dev/${txId}`,
        `https://arweave.live/${txId}`,
        `https://arweave.app/${txId}`,
        `https://arweave.gateway.io/${txId}`
    ];
    for (const url of gateways) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                res.redirect(url);
                return;
            }
        } catch (e) {}
    }
    res.status(404).send('File not found on any gateway');
});

export default router;
