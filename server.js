const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const { google } = require('googleapis');

const port = 3000;

app.use(express.json());
app.use(cors());

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1X4cCQUwMmTZ_Rwo7HDPZX400CMR3ZxvV1G3hMWhWUsk';

app.post('/order', async (req, res) => {
    const orderDetails = req.body;
    if (!orderDetails || Object.keys(orderDetails.items).length === 0) {
        return res.status(400).json({ message: 'No items in order.' });
    }

    try {
        const sheets = google.sheets({ version: 'v4', auth });
        const orderItems = Object.keys(orderDetails.items).map(item => `${item} (${orderDetails.items[item]})`).join(', ');

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [new Date().toLocaleString(), orderDetails.orderId, orderItems, orderDetails.total, orderDetails.paymentMethod]
                ],
            },
        });
        console.log('Order successfully saved to Google Sheet!');

        res.status(200).json({
            message: 'Order received successfully! Thank you for your order.',
            orderId: orderDetails.orderId
        });
    } catch (error) {
        console.error('Error saving to Google Sheet:', error);
        res.status(500).json({ message: 'Error placing order.' });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const sheets = google.sheets({ version: 'v4', auth });
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:E',
        });
        res.status(200).json(result.data.values);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});