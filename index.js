const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔐 RUTA PRINCIPAL DEL PROXY
app.get('/api/proxy', async (req, res) => {
    const { fullEndpoint } = req.query;

    // ✅ Validación mínima para evitar abusos
    if (!fullEndpoint || typeof fullEndpoint !== 'string') {
        return res.status(400).json({ error: 'fullEndpoint es requerido' });
    }

    const oracleBaseUrl = 'https://iapxqy-test.fa.ocs.oraclecloud.com/fscmRestApi/resources/latest';
    const fullUrl = `${oracleBaseUrl}/${fullEndpoint}`;

    // 🧠 Extrae las credenciales del encabezado Authorization
    const authHeader = req.headers.authorization;
    console.log(fullUrl);

    try {
        const response = await axios.get(fullUrl, {
            headers: {
                'Authorization': authHeader,
                'Content-Type' : 'application/json',
                'REST-framework-version': '4',
                'Accept-Language': 'en-US',
            },
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error al consultar Oracle Fusion:', error?.response?.data || error.message);

        res.status(error.response?.status || 500).json({
            error: error.message,
            data: error.response?.data || null,
        });
    }
});

// 🔄 POST opcional (si también quieres reenvíos tipo POST)
app.post('/api/proxy', async (req, res) => {
    const { fullEndpoint, body } = req.body;
    const authHeader = req.headers.authorization;

    if (!fullEndpoint) {
        return res.status(400).json({ error: 'fullEndpoint es requerido' });
    }

    const fullUrl = `https://iapxqy-test.fa.ocs.oraclecloud.com/fscmRestApi/resources/latest/${fullEndpoint}`;

    try {
        const response = await axios.post(fullUrl, body, {
            headers: {
                'Authorization': authHeader,
                'REST-framework-version': '4',
                'Accept-Language': 'en-US',
                'Content-Type': 'application/json',
            },
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error al enviar POST a Oracle Fusion:', error?.response?.data || error.message);

        res.status(error.response?.status || 500).json({
            error: error.message,
            data: error.response?.data || null,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Oracle corriendo en http://localhost:${PORT}`);
});
