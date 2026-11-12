/**
 * ============================================================================
 * TIENDA WEB MÓVIL Y PANEL ADMIN: MONSE_SHOP
 * Recargas Automáticas con Transferencia Directa (BBVA y Nu)
 * Integración Oficial API Recargas América
 * ============================================================================
 */

const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Credenciales oficiales y configuración de puertos para Render
const RECARGAS_API_KEY = process.env.RECARGAS_API_KEY || 'ra_13Fv9P79r_13FV9P7dzq7';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'monse123';

// Datos bancarios oficiales a nombre de Montserrat Ramirez
const DATOS_BBVA = {
  banco: 'BBVA',
  tarjeta: '4152314663647124',
  beneficiario: 'Montserrat Ramirez'
};

const DATOS_NU = {
  banco: 'Nu',
  clabe: '638180010008913497',
  beneficiario: 'Montserrat Ramirez'
};

// Catálogo oficial completo (ADS001 - ADS010) con incremento del 10% en diamantes
let PRODUCTOS = {
  'card_semanal_basica': { nombre: 'Semanal Básica', precio: 9, service: 'tarjeta', amount: 'ADS001' },
  'card_semanal': { nombre: 'Tarjeta Semanal', precio: 42, service: 'tarjeta', amount: 'ADS002' },
  'card_mensual': { nombre: 'Tarjeta Mensual', precio: 160, service: 'tarjeta', amount: 'ADS003' },
  '110_diamonds': { nombre: '110 Diamantes (+10%)', precio: 15, service: 'diamantes', amount: 'ADS005' },
  '310_diamonds': { nombre: '310 Diamantes (+10%)', precio: 43, service: 'diamantes', amount: 'ADS006' },
  '520_diamonds': { nombre: '520 Diamantes (+10%)', precio: 70, service: 'diamantes', amount: 'ADS007' },
  '1000_diamonds': { nombre: '1,000 Diamantes (+10%)', precio: 135, service: 'diamantes', amount: 'ADS008' },
  '2180_diamonds': { nombre: '2,180 Diamantes (+10%)', precio: 280, service: 'diamantes', amount: 'ADS009' },
  '5600_diamonds': { nombre: '5,600 Diamantes (+10%)', precio: 680, service: 'diamantes', amount: 'ADS010' }
};

let pedidosAdmin = [];

/**
 * FUNCIÓN CENTRAL: Despacho automático hacia la API de Recargas América
 */
async function despacharApiRecargas(playerId, producto) {
  try {
    // Según la documentación oficial de la API, la autorización se envía con la clave directa
    const apiRes = await fetch('https://panel.recargasamerica.com/api/v1/order', {
      method: 'POST',
      headers: {
        'Authorization': RECARGAS_API_KEY.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        player_id: String(playerId),
        service: producto.service,
        amount: producto.amount
      })
    });
    
    const data = await apiRes.json();
    console.log('Respuesta API Recargas America:', data);
    
    if (apiRes.ok && (data.success === true || data.status === 'success' || data.id)) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || data.message || 'Error en respuesta de API' };
    }
  } catch (e) {
    console.error('Error al conectar con la API:', e);
    return { success: false, error: e.message };
  }
}

/**
 * ============================================================================
 * RUTA 1: TIENDA PÚBLICA (GET /)
 * ============================================================================
 */
app.get('/', (req, res) => {
  let htmlProductos = '';
  for (const [key, prod] of Object.entries(PRODUCTOS)) {
    htmlProductos += `
      <div class="prod-btn" onclick="seleccionar('${key}', this)">
        <span class="nombre">${prod.nombre}</span>
        <span class="precio">$${prod.precio} MXN</span>
      </div>
    `;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Monse_shop - Recargas Free Fire</title>
      <style>
        :root { --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd; --neon-pink: #ff007f; --neon-cyan: #00f0ff; --text-white: #ffffff; --text-gray: #b9b3d1; --alert-red: #ff3366; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
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
        .aviso-id { font-size: 13px; color: var(--alert-red); line-height: 1.5; margin-bottom: 15px; font-weight: bold; text-align: center; background: rgba(255, 51, 102, 0.1); border: 1px dashed var(--alert-red); padding: 10px; border-radius: 8px; text-shadow: 0 0 8px rgba(255, 51, 102, 0.4); }
        .grid-productos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .prod-btn { background: #1f0d4a; border: 2px solid var(--accent-purple); border-radius: 10px; padding: 15px 10px; text-align: center; cursor: pointer; transition: 0.2s; color: white; }
        .prod-btn:hover, .prod-btn.selected { border-color: var(--neon-pink); background: #2b0e59; box-shadow: 0 0 10px var(--neon-pink); }
        .prod-btn .nombre { font-weight: bold; font-size: 13px; display: block; }
        .prod-btn .precio { color: #00f0ff; font-size: 15px; margin-top: 5px; display: block; }
        .btn-pagar { width: 100%; background: linear-gradient(45deg, #7209b7, #f72585); border: none; padding: 15px; border-radius: 10px; color: white; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 15px; box-shadow: 0 0 15px rgba(247, 37, 133, 0.4); text-transform: uppercase; }
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
            ${htmlProductos}
          </div>
        </div>

        <button class="btn-pagar" onclick="irATransferencia()">Continuar al Pago</button>

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

        function irATransferencia() {
          const playerId = document.getElementById('playerId').value;
          if (!playerId) { alert('Por favor ingresa tu ID de Free Fire'); return; }
          if (!productoSeleccionado) { alert('Por favor selecciona un paquete'); return; }
          window.location.href = '/transferencia?playerId=' + playerId + '&prod=' + productoSeleccionado;
        }
      </script>
    </body>
    </html>
  `);
});

/**
 * ============================================================================
 * RUTA 2: PASARELA DE DATOS BANCARIOS Y REFERENCIA (GET /transferencia)
 * ============================================================================
 */
app.get('/transferencia', (req, res) => {
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
        .card { background: var(--panel-bg); border: 2px solid var(--accent-purple); border-radius: 15px; padding: 25px; max-width: 450px; margin: 20px auto; box-shadow: 0 0 20px rgba(157,78,221,0.3); text-align: left; }
        h2 { color: var(--neon-cyan); margin-bottom: 15px; text-align: center; text-shadow: 0 0 8px var(--neon-cyan); }
        p { color: var(--text-gray); font-size: 14px; margin: 8px 0; }
        .precio-box { font-size: 28px; color: var(--neon-pink); font-weight: bold; margin: 15px 0; text-align: center; text-shadow: 0 0 10px rgba(255,0,127,0.5); }
        .banco-box { background: #0b051e; border: 1px dashed var(--neon-cyan); padding: 12px; border-radius: 10px; margin: 10px 0; color: #fff; font-size: 13px; }
        .banco-box b { color: var(--neon-cyan); display: block; margin-top: 3px; font-size: 15px; }
        label { display: block; font-size: 13px; color: var(--text-gray); margin-top: 10px; }
        input[type="text"] { width: 100%; padding: 10px; background: #0b051e; border: 1px solid var(--accent-purple); border-radius: 8px; color: #fff; margin-top: 5px; }
        .btn-confirmar { display: block; width: 100%; background: linear-gradient(45deg, #7209b7, #f72585); color: white; padding: 15px; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 15px rgba(247,37,133,0.4); text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Instrucciones de Pago</h2>
        <p>ID Free Fire: <b>${playerId}</b></p>
        <p>Paquete: <b>${producto.nombre}</b></p>
        <div class="precio-box">Total a pagar: $${producto.precio} MXN</div>

        <div class="banco-box">
          <p>🌷 <b>DEPÓSITO BBVA</b> 🌷</p>
          <p>💳 Tarjeta: <b>${DATOS_BBVA.tarjeta}</b></p>
          <p>👩‍💻 Beneficiario: ${DATOS_BBVA.beneficiario}</p>
        </div>

        <div class="banco-box">
          <p>🌷 <b>TRANSFERENCIA Nu</b> 🌷</p>
          <p>💳 CLABE: <b>${DATOS_NU.clabe}</b></p>
          <p>👩‍💻 Beneficiario: ${DATOS_NU.beneficiario}</p>
        </div>

        <form action="/procesar-recarga" method="POST">
          <input type="hidden" name="playerId" value="${playerId}">
          <input type="hidden" name="prodKey" value="${prod}">
          
          <label>Número de referencia o folio:</label>
          <input type="text" name="referencia" placeholder="Ej. 12345678" required>

          <button type="submit" class="btn-confirmar">Ya realicé mi transferencia</button>
        </form>

        <br><a href="/" style="color: var(--text-gray); font-size: 13px; text-decoration: underline; display:block; text-align:center;">Regresar a la tienda</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * ============================================================================
 * RUTA 3: PROCESAMIENTO Y REGISTRO DE PEDIDOS (POST /procesar-recarga)
 * ============================================================================
 */
app.post('/procesar-recarga', async (req, res) => {
  const { playerId, prodKey, referencia } = req.body;
  const producto = PRODUCTOS[prodKey];
  if (!producto) return res.redirect('/');

  const fechaHoraActual = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

  const resultado = await despacharApiRecargas(playerId, producto);
  let estadoActual = resultado.success ? '✅ Recarga Exitosa' : '❌ Error al despachar';

  pedidosAdmin.unshift({
    id: Date.now(),
    playerId,
    producto: producto.nombre,
    precio: producto.precio,
    prodKey,
    referencia,
    estado: estadoActual,
    errorDetalle: resultado.error || 'Ninguno',
    fechaHora: fechaHoraActual
  });

  if (resultado.success) {
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Pago Confirmado - Monse_shop</title>
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
          <h2>⭐ ¡Pago Confirmado! ⭐</h2>
          <p>ID de Jugador: <b>${playerId}</b></p>
          <p>Referencia / Folio: <b>${referencia}</b></p>
          <p>Fecha y Hora: <b>${fechaHoraActual}</b></p>
          <p>Estado: <b style="color:#00f0ff;">Diamantes enviados a su cuenta exitosamente al minuto.</b></p>
          <p><i>Gracias por tu compra en Monse_shop. ¡Tu recarga se procesó de inmediato!</i></p>
          <a href="/" class="btn-volver">Hacer otra recarga</a>
        </div>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Aviso de Soporte - Monse_shop</title>
        <style>
          :root { --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd; --neon-cyan: #00f0ff; --text-white: #fff; --text-gray: #b9b3d1; --alert-red: #ff3366; }
          body { background-color: var(--bg-color); color: var(--text-white); padding: 20px; font-family: sans-serif; text-align: center; }
          .card { background: var(--panel-bg); border: 2px solid var(--alert-red); border-radius: 15px; padding: 25px; max-width: 450px; margin: 40px auto; box-shadow: 0 0 20px rgba(255,51,102,0.3); }
          h2 { color: var(--alert-red); margin-bottom: 15px; text-shadow: 0 0 8px var(--alert-red); }
          p { color: var(--text-gray); font-size: 15px; margin: 15px 0; line-height: 1.5; }
          .btn-whatsapp { display: inline-block; background: #25d366; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; box-shadow: 0 0 12px rgba(37,211,102,0.4); text-transform: uppercase; }
          .btn-volver { display: block; background: #9d4edd; color: white; padding: 10px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>⚠️ Aviso Importante / Error al Enviar ⚠️</h2>
          <p>Tu referencia (<b>${referencia}</b>) se ha guardado con éxito a las <b>${fechaHoraActual}</b>, pero hubo un detalle al procesar el envío automático.</p>
          <p style="color: #ff3366; font-size: 13px;"><b>Motivo:</b> ${resultado.error}</p>
          <p>Por favor, <b>contacta a soporte</b> inmediatamente para liberar tus diamantes.</p>
          
          <a href="https://wa.me/523521358701?text=Hola%2C%20hice%20una%20recarga%20con%20referencia%20${referencia}%20y%20mi%20ID%20es%20${playerId}%2C%20necesito%20soporte" class="btn-whatsapp" target="_blank">💬 Contactar a Soporte (WhatsApp)</a>
          <br>
          <a href="/" class="btn-volver">Regresar a la tienda</a>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * ============================================================================
 * RUTA 4: PANEL DE ADMINISTRACIÓN PRIVADO (/admin?pass=monse123)
 * ============================================================================
 */
app.get('/admin', (req, res) => {
  const { pass } = req.query;
  if (pass !== ADMIN_PASSWORD) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><title>Login Admin</title></head>
      <body style="background:#0b051e; color:#fff; text-align:center; padding-top:50px; font-family:sans-serif;">
        <div style="background:#160b36; max-width:350px; margin:0 auto; padding:30px; border-radius:15px; border:1px solid #9d4edd;">
          <h2>Panel Privado Monse_shop</h2>
          <form method="GET" action="/admin" style="margin-top:20px;">
            <input type="password" name="pass" placeholder="Contraseña de admin" style="padding:10px; width:100%; border-radius:8px; border:1px solid #9d4edd; background:#0b051e; color:#fff; margin-bottom:15px;">
            <button type="submit" style="padding:10px; width:100%; background:#ff007f; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Entrar</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  let htmlPedidos = pedidosAdmin.map(p => `
    <div style="background:#0b051e; padding:12px; margin-bottom:10px; border-radius:8px; border-left:4px solid ${p.estado.includes('Exitosa') ? '#00f0ff' : '#ff3366'}; font-size:13px; text-align:left;">
      <b>ID Free Fire:</b> ${p.playerId} <br>
      <b>Paquete:</b> ${p.producto} ($${p.precio} MXN) <br>
      <b>Folio / Referencia:</b> <span style="color:#00f0ff; font-weight:bold;">${p.referencia}</span> <br>
      <b>Fecha y Hora:</b> ${p.fechaHora} <br>
      <b>Estado API:</b> <span style="color:${p.estado.includes('Exitosa') ? '#00f0ff' : '#ff3366'};">${p.estado}</span> <br>
      ${p.errorDetalle !== 'Ninguno' ? `<span style="color:#ffcc00; font-size:11px;">Error: ${p.errorDetalle}</span><br>` : ''}
      <br>
      <form action="/admin/reintentar" method="POST" style="display:inline;">
        <input type="hidden" name="pedidoId" value="${p.id}">
        <button type="submit" style="background:#00b4d8; color:#fff; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold;">🔄 Volver a intentar</button>
      </form>
    </div>
  `).join('');

  let htmlAdminProductos = '';
  for (const [key, prod] of Object.entries(PRODUCTOS)) {
    htmlAdminProductos += `
      <div style="background:#0b051e; padding:10px; margin-bottom:8px; border-radius:8px; display:flex; justify-co
