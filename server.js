/**
 * ============================================================================
 * TIENDA WEB MÓVIL Y PANEL ADMIN: MONSE_SHOP
 * Recargas Automáticas con Transferencia Directa, Subida de Comprobantes y Panel Admin
 * ============================================================================
 */

const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para procesar fotos de comprobantes en memoria temporal
const upload = multer({ storage: multer.memoryStorage() });

// Tus credenciales oficiales
const RECARGAS_API_KEY = process.env.RECARGAS_API_KEY || 'ra_13Fv9P79r_13FV9P7dzq7';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'monse123'; // Contraseña de tu panel privado

// Tus datos bancarios directos para que el cliente transfiera
const DATOS_BANCARIOS = {
  banco: 'Mercado Pago / BBVA / Nu',
  tarjetaOCelular: 'Tu número de tarjeta o celular asociado',
  clabe: 'Tu CLABE interbancaria de 18 dígitos',
  beneficiario: 'Montserrat'
};

/**
 * Catálogo completo sincronizado con los códigos exactos (ADS...) y el 10% de bono
 */
let PRODUCTOS = {
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

// Historial de pedidos y comprobantes para tu panel de administración
let pedidosAdmin = [];

/**
 * FUNCIÓN PARA DESPACHAR A LA API DE RECARGAS AMÉRICA
 */
async function despacharApiRecargas(playerId, producto) {
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
    const textoRes = await apiRes.text();
    console.log('Respuesta API Recargas America:', textoRes);
    return { success: true, respuesta: textoRes };
  } catch (e) {
    console.error('Error al conectar con la API de recargas:', e);
    return { success: false, error: e.message };
  }
}

/**
 * 1. TIENDA PÚBLICA (GET /)
 */
app.get('/', (req, res) => {
  let htmlProductos = '';
  for (const [key, prod] of Object.entries(PRODUCTOS)) {
    htmlProductos += `
      <div class="prod-btn" onclick="seleccionar('${key}', this)">
        <span class="nombre">${prod.nombre}</span> <span class="precio">$${prod.precio} MXN</span>
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
        :root {
          --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd;
          --neon-pink: #ff007f; --neon-cyan: #00f0ff; --text-white: #ffffff;
          --text-gray: #b9b3d1; --alert-red: #ff3366;
        }
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

        <button class="btn-pagar" onclick="irATransferencia()">Ver Datos de Pago</button>

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
 * 2. PANTALLA DE DATOS BANCARIOS Y SUBIDA DE COMPROBANTE
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
      <title>Comprobante de Pago - Monse_shop</title>
      <style>
        :root { --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd; --neon-cyan: #00f0ff; --text-white: #fff; --text-gray: #b9b3d1; --neon-pink: #ff007f; }
        body { background-color: var(--bg-color); color: var(--text-white); padding: 20px; font-family: sans-serif; text-align: center; }
        .card { background: var(--panel-bg); border: 2px solid var(--accent-purple); border-radius: 15px; padding: 25px; max-width: 450px; margin: 20px auto; box-shadow: 0 0 20px rgba(157,78,221,0.3); text-align: left; }
        h2 { color: var(--neon-cyan); margin-bottom: 15px; text-align: center; text-shadow: 0 0 8px var(--neon-cyan); }
        p { color: var(--text-gray); font-size: 14px; margin: 8px 0; }
        .precio-box { font-size: 28px; color: var(--neon-pink); font-weight: bold; margin: 15px 0; text-align: center; text-shadow: 0 0 10px rgba(255,0,127,0.5); }
        .banco-box { background: #0b051e; border: 1px dashed var(--neon-cyan); padding: 15px; border-radius: 10px; margin: 15px 0; color: #fff; font-size: 14px; }
        .banco-box b { color: var(--neon-cyan); display: block; margin-top: 4px; font-size: 16px; }
        label { display: block; font-size: 13px; color: var(--text-gray); margin-top: 10px; }
        input[type="text"], input[type="file"] { width: 100%; padding: 10px; background: #0b051e; border: 1px solid var(--accent-purple); border-radius: 8px; color: #fff; margin-top: 5px; }
        .btn-confirmar { display: block; width: 100%; background: linear-gradient(45deg, #7209b7, #f72585); color: white; padding: 15px; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 15px rgba(247,37,133,0.4); text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Datos para Transferencia</h2>
        <p>ID Free Fire: <b>${playerId}</b></p>
        <p>Paquete: <b>${producto.nombre}</b></p> <div class="precio-box">Total a pagar: $${producto.precio} MXN</div>

        <div class="banco-box">
          <p>📱 <b>Banco / App:</b> ${DATOS_BANCARIOS.banco}</p>
          <p>💳 <b>Tarjeta / Celular:</b></p>
          <b>${DATOS_BANCARIOS.tarjetaOCelular}</b>
          <p style="margin-top:10px;">🔢 <b>CLABE Interbancaria:</b></p>
          <b>${DATOS_BANCARIOS.clabe}</b>
          <p style="margin-top:10px;">👤 <b>Beneficiario:</b> ${DATOS_BANCARIOS.beneficiario}</p>
        </div>

        <form action="/procesar-recarga" method="POST" enctype="multipart/form-data">
          <input type="hidden" name="playerId" value="${playerId}">
          <input type="hidden" name="prodKey" value="${prod}">
          
          <label>Número de referencia o folio:</label>
          <input type="text" name="referencia" placeholder="Ej. 12345678" required>

          <label>Sube foto de tu comprobante:</label>
          <input type="file" name="comprobante" accept="image/*" required>

          <button type="submit" class="btn-confirmar">Ya realicé mi transferencia</button>
        </form>

        <br><a href="/" style="color: var(--text-gray); font-size: 13px; text-decoration: underline; display:block; text-align:center;">Regresar a la tienda</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * 3. DESPACHO AUTOMÁTICO AL SUBIR COMPROBANTE Y PANTALLA DE ÉXITO
 */
app.post('/procesar-recarga', upload.single('comprobante'), async (req, res) => {
  const { playerId, prodKey, referencia } = req.body;
  const producto = PRODUCTOS[prodKey];
  if (!producto) return res.redirect('/');

  // Despacha en automático a la API de Recargas América al mandar su comprobante
  const resultado = await despacharApiRecargas(playerId, producto);
  let estadoActual = resultado.success ? '✅ Recarga Exitosa' : '❌ Error al despachar';

  // Guarda la orden, la referencia y la foto en tu panel privado de admin
  pedidosAdmin.unshift({
    id: Date.now(),
    playerId,
    producto: producto.nombre,
    precio: producto.precio,
    prodKey,
    referencia,
    tieneFoto: req.file ? 'Sí (Adjunta)' : 'No',
    estado: estadoActual,
    fecha: new Date().toLocaleString()
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Pago Exitoso - Monse_shop</title>
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
        <h2>⭐ ¡Pago Exitoso, Recarga Enviada! ⭐</h2>
        <p>ID de Jugador: <b>${playerId}</b></p>
        <p>Referencia: <b>${referencia}</b></p>
        <p>Estado: <b>Tu comprobante fue recibido y la recarga se mandó al juego en automático.</b></p>
        <p><i>Gracias por tu compra en Monse_shop. ¡Tus diamantes ya van en camino!</i></p>
        <a href="/" class="btn-volver">Hacer otra recarga</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * 4. PANEL DE ADMINISTRACIÓN PRIVADO (GET /admin?pass=monse123)
 * Tu sección secreta con el historial, la foto del comprobante y el botón de "Volver a intentar".
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
      <b>Referencia:</b> ${p.referencia} \vert{} <b>Comprobante:</b>${p.tieneFoto} <br>
      <b>Fecha:</b> ${p.fecha} <br>
      <b>Estado API:</b> <span style="color:${p.estado.includes('Exitosa') ? '#00f0ff' : '#ff3366'};">${p.estado}</span><br><br>
      
      <form action="/admin/reintentar" method="POST" style="display:inline;">
        <input type="hidden" name="pedidoId" value="${p.id}">
        <button type="submit" style="background:#00b4d8; color:#fff; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold;">🔄 Volver a intentar</button>
      </form>
    </div>
  `).join('');

  let htmlAdminProductos = '';
  for (const [key, prod] of Object.entries(PRODUCTOS)) {
    htmlAdminProductos += `
      <div style="background:#0b051e; padding:10px; margin-bottom:8px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px;">
        <div><b>${prod.nombre}</b> -$${prod.precio} MXN</div>
        <form method="POST" action="/admin/actualizar" style="display:inline; margin:0;">
          <input type="hidden" name="key" value="${key}">
          <input type="number" name="nuevoPrecio" value="${prod.precio}" style="width:60px; padding:3px; background:#160b36; color:#fff; border:1px solid #9d4edd;">
          <button type="submit" style="background:#9d4edd; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Cambiar</button>
        </form>
      </div>
    `;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"><title>Panel Admin - Monse_shop</title>
      <style>
        body { background: #0b051e; color: #fff; font-family: sans-serif; padding: 20px; text-align: center; }
        .container { max-width: 650px; margin: 0 auto; background: #160b36; padding: 25px; border-radius: 15px; border: 1px solid #9d4edd; }
        h2 { color: #00f0ff; margin-bottom: 20px; text-shadow: 0 0 8px #00f0ff; }
        h3 { color: #ff007f; margin: 20px 0 10px 0; font-size: 16px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>💎 Panel de Administración Monse_shop 💎</h2>

        
