/**
 * ============================================================================
 * TIENDA WEB MÓVIL: MONSE_SHOP
 * Automatización de Recargas de Free Fire en México
 * ============================================================================
 */

const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tu clave limpia de la API de Recargas América (sin puntos suspensivos)
const RECARGAS_API_KEY = process.env.RECARGAS_API_KEY || 'ra_13Fv9P79r_13FV9P7dzq7';
const MP_LINK_DIRECTO = 'https://link.mercadopago.com.mx/m0nseshop';

// Catálogo completo con todos los paquetes y el 10% de bono indicado
const PRODUCTOS = {
  '110_diamonds': { nombre: '110 Diamantes (+10%)', precio: 15, service: 'diamantes', amount: 'ADS005' },
  '310_diamonds': { nombre: '310 Diamantes (+10%)', precio: 43, service: 'diamantes', amount: 'ADS006' },
  '520_diamonds': { nombre: '520 Diamantes (+10%)', precio: 70, service: 'diamantes', amount: 'ADS007' },
  '1000_diamonds': { nombre: '1,000 Diamantes (+10%)', precio: 135, service: 'diamantes', amount: 'ADS008' },
  '2180_diamonds': { nombre: '2,180 Diamantes (+10%)', precio: 280, service: 'diamantes', amount: 'ADS009' },
  '5600_diamonds': { nombre: '5,600 Diamantes (+10%)', precio: 680, service: 'diamantes', amount: 'ADS010' },
  'card_semanal_basica': { nombre: 'Semanal Básica', precio: 9, service: 'tarjeta', amount: 'ADS001' },
  'card_semanal': { nombre: 'Tarjeta Semanal', precio: 42, service: 'tarjeta', amount: 'ADS002' },
  'card_mensual': { nombre: 'Tarjeta Mensual', precio: 160, service: 'tarjeta', amount: 'ADS003' }
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
          --alert-red: #ff3366;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: var(--bg-color); color: var(--text-white); padding-bottom: 50px; min-height: 100vh; }
        header { background: linear-gradient(135deg, #240046, #3c096c); padding: 25px 20px; text-align: center; border-bottom: 2px solid var(--neon-cyan); box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); }
        header h1 { color: var(--neon-cyan); font-size: 28px; text-shadow: 0 0 10px var(--neon-cyan); }
        header p { color: var(--text-gray); font-size: 14px; margin-top: 5px; }
        .container { max-width: 500px; margin: 20px auto; padding: 0 15px; }
        .card { background-color: var(--panel-bg); border: 1px solid var(--accent-purple); border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(157, 78, 221, 0.2); }
        .card h2 { font-size: 18px; margin-bottom: 15px; color: var(--neon-cyan); }
        label { display: block; font-size: 13px; color: var(--text-gray); margin-bottom: 5px; }
        input { width: 100%; padding: 12px; background: #0b051e; border: 1px solid var(--accent-purple); border-radius: 8px; color: #fff; font-size: 16px; margin-bottom: 10px; }
        input:focus { outline: none; border-color: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); }
        
        .aviso-id { 
          font-size: 13px; 
          color: var(--alert-red); 
          line-height: 1.5; 
          margin-bottom: 15px; 
          font-weight: bold; 
          text-align: center;
          background: rgba(255, 51, 102, 0.1);
          border: 1px dashed var(--alert-red);
          padding: 10px;
          border-radius: 8px;
          text-shadow: 0 0 8px rgba(255, 51, 102, 0.4);
        }

        .grid-productos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .prod-btn { background: #1f0d4a; border: 2px solid var(--accent-purple); border-radius: 10px; padding: 15px 10px; text-align: center; cursor: pointer; transition: 0.2s; color: white; }
        .prod-btn:hover, .prod-btn.selected { border-color: var(--neon-pink); background: #2b0e59; box-shadow: 0 0 10px var(--neon-pink); }
        .prod-btn .nombre { font-weight: bold; font-size: 13px; display: block; }
        .prod-btn .precio { color: #00f0ff; font-size: 15px; margin-top: 5px; display: block; }
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
          <div class="aviso-id">
            💖⭐ 🚨 Verifica que el ID sea el correcto, en caso de equivocarte, no me hago responsable 🚨 ⭐💖
          </div>
        </div>

        <div class="card">
          <h2>2. Selecciona tu Paquete</h2>
          <div class="grid-productos">
            <div class="prod-btn" onclick="seleccionar('110_diamonds', this)"><span class="nombre">110 Diamantes (+10%)</span><span class="precio">$15 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('310_diamonds', this)"><span class="nombre">310 Diamantes (+10%)</span><span class="precio">$43 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('520_diamonds', this)"><span class="nombre">520 Diamantes (+10%)</span><span class="precio">$70 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('1000_diamonds', this)"><span class="nombre">1,000 Diamantes (+10%)</span><span class="precio">$135 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('2180_diamonds', this)"><span class="nombre">2,180 Diamantes (+10%)</span><span class="precio">$280 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('5600_diamonds', this)"><span class="nombre">5,600 Diamantes (+10%)</span><span class="precio">$680 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('card_semanal_basica', this)"><span class="nombre">Semanal Básica</span><span class="precio">$9 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('card_semanal', this)"><span class="nombre">Tarjeta Semanal</span><span class="precio">$42 MXN</span></div>
            <div class="prod-btn" onclick="seleccionar('card_mensual', this)"><span class="nombre">Tarjeta Mensual</span><span class="precio">$160 MXN</span></div>
          </div>
        </div>

        <button class="btn-pagar" onclick="iniciarCheckout()">Continuar al Pago</button>

        <div class="soporte">
          ¿Dudas o problemas? Escríbenos al WhatsApp: <a href="https://wa.me/523521358701" target="_blank">+52 352 135 8701</a>
        </div>
      </div>

      <script>
        let productoSeleccionado = '';
        function seleccionar(id, elemento) {
          document.querySelectorAll('.prod-btn').forEach(b => b.classList.remove('selected'));
          elemento.classList.add('selected');
          productoSeleccionado = id;
        }

        function iniciarCheckout() {
          const playerId = document.getElementById('playerId').value;
          if (!playerId) { alert('Por favor ingresa tu ID de Free Fire'); return; }
          if (!productoSeleccionado) { alert('Por favor selecciona un paquete'); return; }

          window.location.href = '/checkout?playerId=' + playerId + '&prod=' + productoSeleccionado;
        }
      </script>
    </body>
    </html>
  `);
});

// Pantalla de pago: El cliente paga PRIMERO y luego presiona el botón para despachar
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
      <title>Instrucciones de Pago - Monse_shop</title>
      <style>
        :root { --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd; --neon-cyan: #00f0ff; --text-white: #fff; --text-gray: #b9b3d1; --neon-pink: #ff007f; }
        body { background-color: var(--bg-color); color: var(--text-white); padding: 20px; font-family: sans-serif; text-align: center; }
        .card { background: var(--panel-bg); border: 2px solid var(--accent-purple); border-radius: 15px; padding: 25px; max-width: 450px; margin: 20px auto; box-shadow: 0 0 20px rgba(157,78,221,0.3); }
        h2 { color: var(--neon-cyan); margin-bottom: 15px; }
        p { color: var(--text-gray); font-size: 15px; margin: 10px 0; text-align: left; }
        .precio-box { font-size: 28px; color: var(--neon-pink); font-weight: bold; margin: 15px 0; text-align: center; text-shadow: 0 0 10px rgba(255,0,127,0.5); }
        .btn-pago { display: block; width: 100%; background: linear-gradient(45deg, #7209b7, #f72585); color: white; padding: 15px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 15px; box-shadow: 0 0 15px rgba(247,37,133,0.4); text-transform: uppercase; }
        .btn-despachar { display: block; width: 100%; background: linear-gradient(45deg, #00b4d8, #0077b6); color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; margin-top: 15px; box-shadow: 0 0 15px rgba(0,240,255,0.3); text-transform: uppercase; }
        .info-pasos { background: #0b051e; border: 1px dashed var(--neon-cyan); padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 13px; color: var(--text-white); text-align: left; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Paso Final: Realiza tu Pago</h2>
        <p>ID Free Fire: <b>${playerId}</b></p>
        <p>Paquete: <b>${producto.nombre}</b></p>
        <div class="precio-box">Total: $${producto.precio} MXN</div>
        
        <div class="info-pasos">
          <b>⭐ Instrucciones:</b><br>
          1. Da clic en <b>"Pagar en Mercado Pago"</b> para transferir o depositar desde BBVA, Nu, OXXO o cualquier banco.<br>
          2. Una vez hecho tu pago, regresa aquí y presiona <b>"Ya pagué, despachar recarga"</b> para enviarla al juego al instante.
        </div>

        <a href="${MP_LINK_DIRECTO}" target="_blank" class="btn-pago">Pagar en Mercado Pago ($${producto.precio} MXN)</a>
        
        <a href="/despachar?playerId=${playerId}&prod=${prod}" class="btn-despachar">⚡ Ya pagué, despachar recarga</a>
        
        <br><a href="/" style="color: var(--text-gray); font-size: 14px; text-decoration: underline; display:inline-block; margin-top:15px;">Regresar a la tienda</a>
      </div>
    </body>
    </html>
  `);
});

// Despacho a la API de Recargas América tras confirmar el pago
app.get('/despachar', async (req, res) => {
  const { playerId, prod } = req.query;
  const producto = PRODUCTOS[prod];
  if (!producto) return res.redirect('/');

  let estadoMensaje = "¡Orden enviada con éxito a la API de Recargas América!";

  try {
    const apiRes = await fetch('https://panel.recargasamerica.com/api/v1/order', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RECARGAS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        player_id: playerId,
        service: producto.service,
        amount: producto.amount
      })
    });
    const data = await apiRes.json();
    console.log('Respuesta de API Recargas America:', data);
  } catch (e) {
    console.error('Error al conectar con la API:', e);
    estadoMensaje = "Hubo un detalle al conectar con la API. Contacta soporte con tu comprobante de pago.";
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Estado de Recarga - Monse_shop</title>
      <style>
        :root { --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd; --neon-cyan: #00f0ff; --text-white: #fff; --text-gray: #b9b3d1; }
        body { background-color: var(--bg-color); color: var(--text-white); padding: 20px; font-family: sans-serif; text-align: center; }
        .card { background: var(--panel-bg); border: 2px solid var(--accent-purple); border-radius: 15px; padding: 25px; max-width: 450px; margin: 40px auto; box-shadow: 0 0 20px rgba(157,78,221,0.3); }
        h2 { color: var(--neon-cyan); margin-bottom: 15px; text-shadow: 0 0 8px var(--neon-cyan); }
        p { color: var(--text-gray); font-size: 15px; margin: 15px 0; line-height: 1.5; }
        .btn-volver { display: inline-block; background: linear-gradient(45deg, #7209b7, #f72585); color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; box-shadow: 0 0 12px rgba(247,37,133,0.4); text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>⭐ ¡Proceso Finalizado! ⭐</h2>
        <p>ID de Jugador: <b>${playerId}</b></p>
        <p>Paquete: <b>${producto.nombre}</b></p>
        <p>${estadoMensaje}</p>
        <p><i>Gracias por tu compra en Monse_shop. ¡Tus diamantes llegarán a tu cuenta!</i></p>
        <a href="/" class="btn-volver">Hacer otra recarga</a>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Monse_shop corriendo exitosamente en el puerto ' + PORT));
    
