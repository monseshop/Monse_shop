const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const RECARGAS_API_KEY = process.env.RECARGAS_API_KEY || 'ra_13FV9P7...dzq7';
const MP_LINK_PAGO = 'https://link.mercadopago.com.mx/m0nseshop';

// Catálogo oficial de Monse_shop
const PRODUCTOS = {
  '110_diamonds': { nombre: '110 Diamantes', precio: 15, tipo: 'diamantes', cantidad: 110 },
  '341_diamonds': { nombre: '341 Diamantes', precio: 48, tipo: 'diamantes', cantidad: 341 },
  '572_diamonds': { nombre: '572 Diamantes', precio: 75, tipo: 'diamantes', cantidad: 572 },
  '1166_diamonds': { nombre: '1,166 Diamantes', precio: 129, tipo: 'diamantes', cantidad: 1166 },
  '2398_diamonds': { nombre: '2,398 Diamantes', precio: 248, tipo: 'diamantes', cantidad: 2398 },
  '6160_diamonds': { nombre: '6,160 Diamantes', precio: 620, tipo: 'diamantes', cantidad: 6160 },
  'card_basica': { nombre: 'Tarjeta Básica', precio: 9, tipo: 'tarjeta', idArticulo: 'BASICA' },
  'card_normal': { nombre: 'Tarjeta Normal', precio: 42, tipo: 'tarjeta', idArticulo: 'NORMAL' },
  'card_mensual': { nombre: 'Tarjeta Mensual', precio: 160, tipo: 'tarjeta', idArticulo: 'MENSUAL' }
};

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Monse_shop - Recargas Free Fire</title>
      <style>
        :root {
          --bg-color: #0b051e;
          --panel-bg: #160b36;
          --accent-purple: #9d4edd;
          --neon-pink: #ff007f;
          --neon-cyan: #00f0ff;
          --text-white: #ffffff;
          --text-gray: #b9b3d1;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: var(--bg-color); color: var(--text-white); padding-bottom: 50px; }
        header { background: linear-gradient(135deg, #240046, #3c096c); padding: 25px 20px; text-align: center; border-bottom: 2px solid var(--neon-cyan); box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); }
        header h1 { color: var(--neon-cyan); font-size: 28px; text-shadow: 0 0 10px var(--neon-cyan); }
        header p { color: var(--text-gray); font-size: 14px; margin-top: 5px; }
        .container { max-width: 500px; margin: 20px auto; padding: 0 15px; }
        .card { background-color: var(--panel-bg); border: 1px solid var(--accent-purple); border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(157, 78, 221, 0.2); }
        .card h2 { font-size: 18px; margin-bottom: 15px; color: var(--neon-cyan); }
        label { display: block; font-size: 13px; color: var(--text-gray); margin-bottom: 5px; }
        input { width: 100%; padding: 12px; background: #0b051e; border: 1px solid var(--accent-purple); border-radius: 8px; color: #fff; font-size: 16px; margin-bottom: 15px; }
        input:focus { outline: none; border-color: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); }
        .grid-productos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .prod-btn { background: #1f0d4a; border: 2px solid var(--accent-purple); border-radius: 10px; padding: 15px 10px; text-align: center; cursor: pointer; transition: 0.2s; color: white; }
        .prod-btn:hover, .prod-btn.selected { border-color: var(--neon-pink); background: #2b0e59; box-shadow: 0 0 10px var(--neon-pink); }
        .prod-btn .nombre { font-weight: bold; font-size: 14px; display: block; }
        .prod-btn .precio { color: #00f0ff; font-size: 16px; margin-top: 5px; display: block; }
        .btn-pagar { width: 100%; background: linear-gradient(45deg, #7209b7, #f72585); border: none; padding: 15px; border-radius: 10px; color: white; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 15px; box-shadow: 0 0 15px rgba(247, 37, 133, 0.4); text-transform: uppercase; }
        .btn-pagar:active { transform: scale(0.98); }
        .soporte { text-align: center; margin-top: 30px; font-size: 14px; color: var(--text-gray); }
        .soporte a { color: var(--neon-cyan); text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <header>
        <h1>💎 MONSE SHOP 💎</h1>
        <p>Recargas Automáticas de Free Fire en México</p>
      </header>

      <div class="container">
        <div class="card">
          <h2>1. Ingresa tu ID de Free Fire</h2>
          <label>ID de Jugador:</label>
          <input type="number" id="playerId" placeholder="Ej. 123456789" required>
        </div>

        <div class="card">
          <h2>2. Selecciona tu Paquete</h2>
          <div class="grid-productos">
            <div class="prod-btn" onclick="seleccionar('110_diamonds', '110 Diamantes', '15', this)"><span class="nombre">110 Diamantes</span><span class="precio">$15 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('341_diamonds', '341 Diamantes', '48', this)"><span class="nombre">341 Diamantes</span><span class="precio">$48 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('572_diamonds', '572 Diamantes', '75', this)"><span class="nombre">572 Diamantes</span><span class="precio">$75 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('1166_diamonds', '1,166 Diamantes', '129', this)"><span class="nombre">1,166 Diamantes</span><span class="precio">$129 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('2398_diamonds', '2,398 Diamantes', '248', this)"><span class="nombre">2,398 Diamantes</span><span class="precio">$248 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('6160_diamonds', '6,160 Diamantes', '620', this)"><span class="nombre">6,160 Diamantes</span><span class="precio">$620 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('card_basica', 'Tarjeta Básica', '9', this)"><span class="nombre">Tarjeta Básica</span><span class="precio">$9 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('card_normal', 'Tarjeta Normal', '42', this)"><span class="nombre">Tarjeta Normal</span><span class="precio">$42 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('card_mensual', 'Tarjeta Mensual', '160', this)"><span class="nombre">Tarjeta Mensual</span><span class="precio">$160 MXN</span></div>
          </div>
        </div>

        <button class="btn-pagar" onclick="iniciarPago()">Pagar con Mercado Pago</button>

        <div class="soporte">
          ¿Dudas o problemas? Escríbenos al WhatsApp: <a href="https://wa.me/523521358701" target="_blank">+52 352 135 8701</a>
        </div>
      </div>

      <script>
        let productoSeleccionado = '';
        function seleccionar(id, nombre, precio, elemento) {
          document.querySelectorAll('.prod-btn').forEach(b => b.classList.remove('selected'));
          elemento.classList.add('selected');
          productoSeleccionado = id;
        }

        function iniciarPago() {
          const playerId = document.getElementById('playerId').value;
          if (!playerId) { alert('Por favor ingresa tu ID de Free Fire'); return; }
          if (!productoSeleccionado) { alert('Por favor selecciona un paquete'); return; }

          // Redirige al checkout interno que muestra las instrucciones y botón para pagar y confirmar
          window.location.href = '/checkout?playerId=' + playerId + '&prod=' + productoSeleccionado;
        }
      </script>
    </body>
    </html>
  `);
});

// Pantalla intermedia de pago con tu link de Mercado Pago
app.get('/checkout', (req, res) => {
  const { playerId, prod } = req.query;
  const producto = PRODUCTOS[prod];
  if (!producto) return res.redirect('/');

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagar - Monse_shop</title>
      <style>
        :root { --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd; --neon-cyan: #00f0ff; --text-white: #fff; --text-gray: #b9b3d1; }
        body { background-color: var(--bg-color); color: var(--text-white); padding: 20px; font-family: sans-serif; text-align: center; }
        .card { background: var(--panel-bg); border: 2px solid var(--accent-purple); border-radius: 15px; padding: 25px; max-width: 450px; margin: 20px auto; box-shadow: 0 0 20px rgba(157,78,221,0.3); }
        h2 { color: var(--neon-cyan); margin-bottom: 15px; }
        p { color: var(--text-gray); font-size: 15px; margin: 10px 0; }
        .precio-box { font-size: 28px; color: #ff007f; font-weight: bold; margin: 15px 0; }
        .btn { display: block; width: 100%; background: linear-gradient(45deg, #00b4d8, #0077b6); color: white; padding: 15px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 15px; box-shadow: 0 0 15px rgba(0,180,216,0.4); }
        .btn-confirmar { background: linear-gradient(45deg, #7209b7, #f72585); box-shadow: 0 0 15px rgba(247,37,133,0.4); margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Paso Final de Pago</h2>
        <p>ID Free Fire: <b>${playerId}</b></p>
        <p>Paquete: <b>${producto.nombre}</b></p>
        <div class="precio-box">Pagar: $${producto.precio} MXN</div>  <p style="text-align: left; margin-top: 15px;"><b>Instrucciones:</b><br> 1. Da clic en el botón de abajo para ir a pagar en tu link oficial de Mercado Pago.<br> 2. Realiza tu pago por la cantidad exacta de <b>$${producto.precio} MXN</b>.<br>
        3. Regresa aquí y presiona <b>"Ya pagué / Recibir Diamantes"</b>.</p>

        <a href="${MP_LINK_PAGO}" target="_blank" class="btn">1. Pagar en Mercado Pago ($${producto.precio} MXN)</a>
        <a href="/ejecutar-recarga?playerId=${playerId}&prod=${prod}" class="btn btn-confirmar">2. Ya pagué / Recibir Diamantes</a>
      </div>
    </body>
    </html>
  `);
});

// Ejecuta la recarga automática en Recargas América
app.get('/ejecutar-recarga', async (req, res) => {
  const { playerId, prod } = req.query;
  const producto = PRODUCTOS[prod];

  if (producto) {
    try {
      const apiRes = await fetch('https://panel.recargasamerica.com/api/v1/recarga', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + RECARGAS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          player_id: playerId,
          service: producto.tipo,
          amount: producto.cantidad || producto.idArticulo
        })
      });
      const data = await apiRes.json();
      console.log('Respuesta Recargas America:', data);
    } catch (e) {
      console.error('Error al despachar API:', e);
    }
  }

  res.send(`
    <html lang="es"><body style="background:#0b051e; color:white; text-align:center; padding-top:50px; font-family:sans-serif;">
      <h1 style="color:#00f0ff;">¡Recarga en Proceso! 💎</h1>
      <p style="font-size:18px; margin-top:2
          
