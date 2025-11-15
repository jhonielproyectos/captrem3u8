// server.js
const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 10000; // Render usa la variable de entorno PORT

// Función de captura, ahora acepta la URL objetivo como argumento
async function captureM3U8(targetUrl) {
    let browser, m3u8Url = null;
    
    try {
        // Ejecutar en modo Headless (true) o no-Headless (false)
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // --- Escuchar peticiones de red ---
        page.on('request', request => {
            const url = request.url();
            if (url.includes('.m3u8') && !m3u8Url) {
                m3u8Url = url;
            }
        });

        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
        
        // Esperar un tiempo máximo para que se disparen las peticiones del m3u8
        // Si el m3u8 es capturado, 'm3u8Url' tendrá el valor.
        await page.waitForTimeout(7000); 

    } catch (error) {
        console.error('Error durante la captura:', error.message);
        m3u8Url = `ERROR: ${error.message}`;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    return m3u8Url;
}

// --- Endpoint de la API ---
app.get('/sniff', async (req, res) => {
    const target = req.query.url;
    
    if (!target) {
        return res.status(400).json({ error: "Debe especificar la URL objetivo con ?url=..." });
    }
    
    console.log(`Petición recibida para: ${target}`);
    
    const resultM3U8 = await captureM3U8(target);
    
    if (resultM3U8 && !resultM3U8.startsWith('ERROR')) {
        res.json({ 
            status: "success", 
            target_url: target,
            m3u8_link: resultM3U8
        });
    } else {
        res.status(500).json({ 
            status: "failed", 
            target_url: target,
            message: "No se pudo capturar el enlace m3u8 o hubo un error.",
            error_details: resultM3U8 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
