require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const locationsRouter = require('./routes/locations');
const productsRouter = require('./routes/products');
const stockRouter = require('./routes/stock');
const transfersRouter = require('./routes/transfers');

const app = express();
app.use(bodyParser.json());

app.use('/api/locations', locationsRouter);
app.use('/api/products', productsRouter);
app.use('/api/stock', stockRouter);
app.use('/api/transfers', transfersRouter);

app.get('/', (req, res) => res.send('stok-opname OK'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
