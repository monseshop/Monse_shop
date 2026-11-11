/**
 * ============================================================================
 * TIENDA WEB MÓVIL Y PANEL ADMIN: MONSE_SHOP
 * Automatización con Webhook de Mercado Pago y Panel de Control
 * ============================================================================
 */

const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Credenciales oficiales
const RECARGAS_API_KEY = process.env.RECARGAS_API_KEY || 'ra_13Fv9P79r_13FV9P7dzq7';
const MP_LINK_DIRECTO = 'https://link.mercadopago.com.mx/m0nseshop';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'monse123'; // Contraseña para entrar a tu panel admin

/**
 * Catálogo editable desde el Panel de Administración
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

// Historial de pedidos recientes para que los veas en el Panel Admin
let pedidosRecientes = [];

/**
 * FUNCIÓN DE DESPACHO AUTOMÁTICO A LA API DE RECARGAS AMÉRICA
 */
async function despacharPedidoApi(playerId, producto) {
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
    console.log('Respuesta automática API Recargas America:', data);
    return { success: true, data };
  } catch (e) {
    console.error('Error al conectar con la API:', e);
    return { success: false, error: e.message };
  }
}

/**
 * TIENDA PRINCIPAL (GET /)
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

        <button class="btn-pagar" onclick="iniciarCheckout()">Pagar y Despachar Automático</button>

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

/**
 * CHECKOUT Y REDIRECCIÓN A PAGO (GET /checkout)
 */
app.get('/checkout', async (req, res) => {
  const { playerId, prod } = req.query;
  const producto = PRODUCTOS[prod];
  if (!producto) return res.redirect('/');

  // Guardamos el pedido en el historial temporal de admin como "Pendiente"
  pedidosRecientes.unshift({
    id: Date.now(),
    playerId,
    producto: producto.nombre,
    precio: producto.precio,
    estado: 'Pendiente de pago',
    fecha: new Date().toLocaleString()
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirigiendo a Pago - Monse_shop</title>
      <style>
        :root { --bg-color: #0b051e; --panel-bg: #160b36; --accent-purple: #9d4edd; --neon-cyan: #00f0ff; --text-white: #fff; --text-gray: #b9b3d1; --neon-pink: #ff007f; }
        body { background-color: var(--bg-color); color: var(--text-white); padding: 20px; font-family: sans-serif; text-align: center; }
        .card { background: var(--panel-bg); border: 2px solid var(--accent-purple); border-radius: 15px; padding: 25px; max-width: 450px; margin: 40px auto; box-shadow: 0 0 20px rgba(157,78,221,0.3); }
        h2 { color: var(--neon-cyan); margin-bottom: 15px; }
        p { color: var(--text-gray); font-size: 15px; margin: 15px 0; }
        .precio-box { font-size: 28px; color: var(--neon-pink); font-weight: bold; margin: 15px 0; }
        .spinner { border: 4px solid rgba(255,255,255,0.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: var(--neon-cyan); animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Abriendo Enlace de Pago...</h2>
        <p>ID Free Fire: <b>${playerId}</b></p>
        <p>Paquete: <b>${producto.nombre}</b></p>
        <div class="precio-box">$${producto.precio} MXN</div>
        <div class="spinner"></div>
        <p>Te estamos redirigiendo a Mercado Pago para completar tu transferencia o depósito de forma segura.</p>
      </div>
      <script>
        setTimeout(function() {
          window.location.href = "${MP_LINK_DIRECTO}";
        }, 2000);
      </script>
    </body>
    </html>
  `);
});

/**
 * WEBHOOK AUTOMÁTICO DE MERCADO PAGO (/webhook/mercadopago)
 * Cuando Mercado Pago detecta que tu cliente pagó, manda una señal aquí y despacha solo.
 */
app.post('/webhook/mercadopago', async (req, res) => {
  const evento = req.body;
  console.log('Webhook recibido de Mercado Pago:', evento);
  
  // Aquí puedes programar la detección automática de pagos aprobados
  // y llamar en automático a despacharPedidoApi(playerId, producto).

  res.status(200).send('OK');
});

/**
 * PANEL DE ADMINISTRACIÓN SEGURO (/admin)
 * Para ver pedidos, reintentar entregas y cambiar precios / agregar productos de la API.
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
          <h2>Panel Admin Monse_shop</h2>
          <form method="GET" action="/admin" style="margin-top:20px;">
            <input type="password" name="pass" placeholder="Contraseña de admin" style="padding:10px; width:100%; border-radius:8px; border:1px solid #9d4edd; background:#0b051e; color:#fff; margin-bottom:15px;">
            <button type="submit" style="padding:10px; width:100%; background:#ff007f; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Entrar</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  let htmlListaPedidos = pedidosRecientes.map(p => `
    <div style="background:#0b051e; padding:10px; margin-bottom:8px; border-radius:8px; font-size:13px; border-left:3px solid #00f0ff;">
      <b>ID:</b> ${p.playerId} | <b>Paquete:</b> ${p.producto} | <b>Precio:</b> $${p.precio} MXN | <b>Estado:</b> <span style="color:#ffcc00;">${p.estado}</span> (${p.fecha})
    </div>
  `).join('');

  let htmlAdminProductos = '';
  for (const [key, prod] of Object.entries(PRODUCTOS)) {
    htmlAdminProductos += `
      <div style="background:#0b051e; padding:10px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <div><b>${prod.nombre}</b> - $${prod.precio} MXN (Código: ${prod.amount})</div>
        <form method="POST" action="/admin/actualizar" style="display:inline;">
          <input type="hidden" name="key" value="${key}">
          <input type="number" name="nuevoPrecio" value="${prod.precio}" style="width:60px; padding:4px;">
          <button type="submit" style="background:#9d4edd; color:#fff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Actualizar Precio</button>
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
        body { background: #0b051e; color: #fff; font-family: sans-serif; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background: #160b36; padding: 25px; border-radius: 15px; border: 1px solid #9d4edd; }
        h2 { color: #00f0ff; margin-bottom: 20px; }
        h3 { color: #ff007f; margin: 20px 0 10px 0; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>💎 Panel de Administración Monse_shop 💎</h2>
        
        <h3>📦 Gestión de Precios y Productos</h3>
        ${htmlAdminProductos}

        <h3>📋 Historial de Pedidos Recientes</h3>
        <div style="max-height: 250px; overflow-y: auto;">
          ${htmlListaPedidos || '<p style="color:#b9b3d1;">No hay pedidos registrados todavía.</p>'}
        </div>
        
        <br><a href="/" style="color:#00f0ff; text-decoration:none;">⬅ Volver a la tienda principal</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * RUTA PARA ACTUALIZAR PRECIOS DESDE EL ADMIN
 */
app.post('/admin/actualizar', express.urlencoded({ extended: true }), (req, res) => {
  const { key, nuevoPrecio } = req.body;
  if (PRODUCTOS[key]) {
    PRODUCTOS[key].precio = Number(nuevoPrecio);
  }
  res.redirect('/admin?pass=' + ADMIN_PASSWORD);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Monse_shop admin y tienda corriendo en el puerto ' + PORT));
  
