const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/api/huespedes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM huespedes');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/huespedes/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM huespedes WHERE id_huespedes = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/huespedes', async (req, res) => {
  const { id_huespedes, nombre, telefono, edad } = req.body;
  try {
    await pool.query('INSERT INTO huespedes VALUES ($1, $2, $3, $4)', [id_huespedes, nombre, telefono, edad]);
    res.json({ mensaje: 'Huésped creado correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/huespedes/:id', async (req, res) => {
  const { nombre, telefono, edad } = req.body;
  try {
    await pool.query('UPDATE huespedes SET nombre=$1, telefono=$2, edad=$3 WHERE id_huespedes=$4', [nombre, telefono, edad, req.params.id]);
    res.json({ mensaje: 'Huésped actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/huespedes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM huespedes WHERE id_huespedes = $1', [req.params.id]);
    res.json({ mensaje: 'Huésped eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/habitaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habitaciones');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/habitaciones', async (req, res) => {
  const { id_habitaciones, n_habitacion, n_huespedes } = req.body;
  try {
    await pool.query('INSERT INTO habitaciones VALUES ($1, $2, $3)', [id_habitaciones, n_habitacion, n_huespedes]);
    res.json({ mensaje: 'Habitación creada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/habitaciones/:id', async (req, res) => {
  const { n_habitacion, n_huespedes } = req.body;
  try {
    await pool.query('UPDATE habitaciones SET n_habitacion=$1, n_huespedes=$2 WHERE id_habitaciones=$3', [n_habitacion, n_huespedes, req.params.id]);
    res.json({ mensaje: 'Habitación actualizada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/habitaciones/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM habitaciones WHERE id_habitaciones = $1', [req.params.id]);
    res.json({ mensaje: 'Habitación eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reservas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, h.nombre AS nombre_huesped, hab.n_habitacion
      FROM reservas r
      LEFT JOIN huespedes h ON r.id_huespedes = h.id_huespedes
      LEFT JOIN habitaciones hab ON r.id_habitaciones = hab.id_habitaciones
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reservas', async (req, res) => {
  const { id_reservas, n_fecha, n_hora, id_huespedes, id_habitaciones, id_pago, id_servicio } = req.body;
  try {
    await pool.query('INSERT INTO reservas VALUES ($1, $2, $3, $4, $5, $6, $7)', [id_reservas, n_fecha, n_hora, id_huespedes, id_habitaciones, id_pago, id_servicio]);
    res.json({ mensaje: 'Reserva creada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/reservas/:id', async (req, res) => {
  const { n_fecha, n_hora, id_huespedes, id_habitaciones, id_pago, id_servicio } = req.body;
  try {
    await pool.query(`UPDATE reservas SET n_fecha=$1, n_hora=$2, id_huespedes=$3, id_habitaciones=$4, id_pago=$5, id_servicio=$6 WHERE id_reservas=$7`,
      [n_fecha, n_hora, id_huespedes, id_habitaciones, id_pago, id_servicio, req.params.id]);
    res.json({ mensaje: 'Reserva actualizada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/reservas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reservas WHERE id_reservas = $1', [req.params.id]);
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));