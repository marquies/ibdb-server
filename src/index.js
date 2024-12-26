import express from 'express';
import cors from 'cors';
import { query } from './db/index.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all bicycles with optional type filter
app.get('/api/bicycles', async (req, res) => {
  try {
    const { type } = req.query;
    
    let queryText = 'SELECT * FROM bicycles';
    const queryParams = [];

    if (type) {
      queryText += ' WHERE type = $1';
      queryParams.push(type);
    }

    const { rows } = await query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching bicycles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bicycle by ID with all its components
app.get('/api/bicycles/:id', async (req, res) => {
  try {
    const bikeId = req.params.id;
    
    // Get bicycle details
    const bikeResult = await query('SELECT * FROM bicycles WHERE bike_id = $1', [bikeId]);
    
    if (bikeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bicycle not found' });
    }

    // Get all components for the bicycle
    const componentsResult = await query('SELECT * FROM components WHERE bike_id = $1', [bikeId]);
    
    // Get detailed component information
    const detailedComponents = await Promise.all(
      componentsResult.rows.map(async (component) => {
        const detailsResult = await query(
          `SELECT * FROM ${component.category} WHERE component_id = $1`,
          [component.component_id]
        );
        return {
          ...component,
          details: detailsResult.rows[0] || null
        };
      })
    );
    
    const bicycle = {
      ...bikeResult.rows[0],
      components: detailedComponents
    };
    
    res.json(bicycle);
  } catch (err) {
    console.error('Error fetching bicycle details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get components by category
app.get('/api/components/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = [
      'wheels', 'drivetrain', 'brakes', 'forks', 'rear_shocks',
      'cockpit_components', 'saddle', 'seatpost', 'pedals', 'e_bike_features'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid component category' });
    }

    const componentsResult = await query('SELECT * FROM components WHERE category = $1', [category]);

    // Get detailed information for each component
    const detailedComponents = await Promise.all(
      componentsResult.rows.map(async (component) => {
        const detailsResult = await query(
          `SELECT * FROM ${category} WHERE component_id = $1`,
          [component.component_id]
        );
        return {
          ...component,
          details: detailsResult.rows[0] || null
        };
      })
    );

    res.json(detailedComponents);
  } catch (err) {
    console.error('Error fetching components:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all manufacturers
app.get('/api/manufacturers', async (req, res) => {
  try {
    const queryText = 'SELECT * FROM manufacturers WHERE active = true ORDER BY name';
    const { rows } = await query(queryText);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching manufacturers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all brands with their current manufacturers
app.get('/api/brands', async (req, res) => {
  try {
    const queryText = `
      SELECT b.*, m.name as manufacturer_name, m.country as manufacturer_country
      FROM brands b
      LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
      WHERE b.active = true
      ORDER BY b.name`;
    const { rows } = await query(queryText);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get brand history
app.get('/api/brands/:id/history', async (req, res) => {
  try {
    const brandId = req.params.id;
    const queryText = `
      SELECT 
        bh.*,
        old_m.name as old_manufacturer_name,
        new_m.name as new_manufacturer_name
      FROM brand_history bh
      LEFT JOIN manufacturers old_m ON bh.old_manufacturer_id = old_m.manufacturer_id
      LEFT JOIN manufacturers new_m ON bh.new_manufacturer_id = new_m.manufacturer_id
      WHERE bh.brand_id = $1
      ORDER BY bh.change_date DESC`;
    const { rows } = await query(queryText, [brandId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching brand history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
