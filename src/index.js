import express from 'express';
import cors from 'cors';
import { query, pool } from './db/index.js';

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

// Get bikes by manufacturer ID
app.get('/api/manufacturers/:id/bikes', async (req, res) => {
  try {
    const manufacturerId = req.params.id;
    const queryText = `
      SELECT DISTINCT b.bike_id, b.name as bike_name, b.type, b.model_year,
             br.name as brand_name
      FROM bicycles b
      JOIN brands br ON b.brand_id = br.brand_id
      WHERE br.manufacturer_id = $1
      ORDER BY br.name, b.name`;
    
    const { rows } = await query(queryText, [manufacturerId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching manufacturer bikes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      query('SELECT COUNT(*) as count FROM manufacturers WHERE active = true'),
      query('SELECT COUNT(*) as count FROM brands WHERE active = true'),
      query('SELECT COUNT(*) as count FROM bicycles'),
      query('SELECT COUNT(*) as count FROM components')
    ]);

    res.json({
      manufacturers: parseInt(stats[0].rows[0].count),
      brands: parseInt(stats[1].rows[0].count),
      bicycles: parseInt(stats[2].rows[0].count),
      components: parseInt(stats[3].rows[0].count)
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bicycles with details
app.get('/api/admin/bicycles', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        b.*,
        br.name as brand_name,
        m.name as manufacturer_name
      FROM bicycles b
      LEFT JOIN brands br ON b.brand_id = br.brand_id
      LEFT JOIN manufacturers m ON br.manufacturer_id = m.manufacturer_id
      ORDER BY b.model_year DESC, b.name ASC
    `;
    const { rows } = await query(queryText);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching bicycles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all brands for dropdown
app.get('/api/admin/brands', async (req, res) => {
  try {
    const { rows } = await query('SELECT brand_id, name FROM brands WHERE active = true ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new bicycle
app.post('/api/admin/bicycles', async (req, res) => {
  const { name, brand_id, type, model_year, description, price, specifications } = req.body;
  try {
    const queryText = `
      INSERT INTO bicycles (name, brand_id, type, model_year, description, price, specifications)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [name, brand_id, type, model_year, description, price, specifications];
    const { rows } = await query(queryText, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating bicycle:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bicycle
app.put('/api/admin/bicycles/:id', async (req, res) => {
  const { id } = req.params;
  const { name, brand_id, type, model_year, description, price, specifications } = req.body;
  try {
    const queryText = `
      UPDATE bicycles 
      SET name = $1, brand_id = $2, type = $3, model_year = $4, 
          description = $5, price = $6, specifications = $7
      WHERE bike_id = $8
      RETURNING *
    `;
    const values = [name, brand_id, type, model_year, description, price, specifications, id];
    const { rows } = await query(queryText, values);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Bicycle not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error('Error updating bicycle:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bicycle
app.delete('/api/admin/bicycles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query('DELETE FROM bicycles WHERE bike_id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Bicycle not found' });
    } else {
      res.json({ message: 'Bicycle deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting bicycle:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all scraped bikes for review with matching database records
app.get('/api/admin/scraped-bikes', async (req, res) => {
  try {
    const queryText = `
      WITH matching_bikes AS (
        SELECT 
          b.bike_id,
          b.name as db_name,
          b.type as db_type,
          b.model_year as db_model_year,
          b.brand_id as db_brand_id,
          (
            SELECT jsonb_object_agg(
              c.category,
              jsonb_build_object(
                'name', c.name,
                'weight', c.weight,
                'material', c.material
              )
            )
            FROM components c
            WHERE c.bike_id = b.bike_id
          ) as db_components
        FROM bicycles b
      )
      SELECT 
        sr.*,
        CASE 
          WHEN sr.raw_data IS NOT NULL AND sr.raw_data::text <> '{}' 
          THEN sr.raw_data 
          ELSE NULL 
        END as raw_data,
        b.name as brand_name,
        m.manufacturer_id,
        m.name as manufacturer_name,
        mb.bike_id as matching_bike_id,
        mb.db_name,
        mb.db_type,
        mb.db_model_year,
        mb.db_components
      FROM scraped_bikes_review sr
      LEFT JOIN brands b ON sr.brand_id = b.brand_id
      LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
      LEFT JOIN matching_bikes mb ON mb.bike_id = sr.matching_bike_id
      ORDER BY 
        CASE 
          WHEN sr.status = 'pending' THEN 1
          WHEN sr.status = 'approved' THEN 2
          ELSE 3
        END,
        sr.scraped_at DESC
    `;
    
    const { rows } = await query(queryText);
    
    // Ensure raw_data is parsed JSON
    const processedRows = rows.map(row => ({
      ...row,
      raw_data: row.raw_data ? (
        typeof row.raw_data === 'string' ? JSON.parse(row.raw_data) : row.raw_data
      ) : null,
      db_components: row.db_components || null
    }));
    
    console.log('Processed rows:', processedRows); // Debug log
    res.json(processedRows);
  } catch (err) {
    console.error('Error fetching scraped bikes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update scraped bike review status
app.put('/api/admin/scraped-bikes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewed_by, review_notes, matching_bike_id } = req.body;
    
    const updateQuery = `
      UPDATE scraped_bikes_review 
      SET 
        status = $1,
        reviewed_by = $2,
        review_notes = $3,
        reviewed_at = NOW(),
        matching_bike_id = $4
      WHERE review_id = $5
      RETURNING *
    `;
    
    const { rows } = await query(updateQuery, [
      status,
      reviewed_by,
      review_notes,
      matching_bike_id,
      id
    ]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Scraped bike not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating scraped bike:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete rejected scraped bikes
app.delete('/api/admin/scraped-bikes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the bike is rejected
    const checkQuery = `
      SELECT status 
      FROM scraped_bikes_review 
      WHERE review_id = $1
    `;
    const { rows: [bike] } = await query(checkQuery, [id]);
    
    if (!bike) {
      return res.status(404).json({ error: 'Scraped bike not found' });
    }
    
    if (bike.status !== 'rejected') {
      return res.status(400).json({ error: 'Can only delete rejected bikes' });
    }
    
    // Delete the bike
    const deleteQuery = `
      DELETE FROM scraped_bikes_review 
      WHERE review_id = $1 
      RETURNING *
    `;
    await query(deleteQuery, [id]);
    
    res.json({ message: 'Scraped bike deleted successfully' });
  } catch (err) {
    console.error('Error deleting scraped bike:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to parse weight
const parseWeight = (weightStr) => {
  if (!weightStr) return null;
  // Extract number from string (e.g., "7.44 kg" -> 7.44)
  const match = weightStr.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
};

// Helper function to parse component data
const parseComponentData = (component) => {
  // If the name is a stringified object, parse it
  let parsedName = component.name;
  try {
    if (typeof component.name === 'string' && component.name.startsWith('{')) {
      const nameObj = JSON.parse(component.name.replace(/'/g, '"'));
      parsedName = nameObj.name || '';
      
      // If weight wasn't provided separately, use it from the name object
      if (!component.weight && nameObj.weight) {
        component.weight = nameObj.weight;
      }
      
      // If material wasn't provided separately, use it from the name object
      if (!component.material && nameObj.material) {
        component.material = nameObj.material;
      }
    }
  } catch (e) {
    console.warn('Failed to parse component name:', e);
  }

  return {
    name: parsedName || component.name,
    weight: parseWeight(component.weight),
    material: component.material,
    category: component.category
  };
};

// Update bicycle in database with approved changes
app.put('/api/admin/bicycles/:id/update-from-scrape', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { changes } = req.body;
    
    console.log('Received changes:', changes); // Debug log

    // Update basic bike details
    if (Object.keys(changes.basic || {}).length > 0) {
      console.log('Updating basic details:', changes.basic); // Debug log
      const updateBikeQuery = `
        UPDATE bicycles 
        SET 
          name = COALESCE($1, name),
          type = COALESCE($2, type),
          model_year = COALESCE($3, model_year)
        WHERE bike_id = $4
        RETURNING *
      `;
      const result = await client.query(updateBikeQuery, [
        changes.basic.name,
        changes.basic.type,
        changes.basic.model_year,
        id
      ]);
      console.log('Basic update result:', result.rows[0]); // Debug log
    }

    // Update components
    if (Object.keys(changes.components || {}).length > 0) {
      console.log('Processing component changes:', changes.components); // Debug log
      
      for (const component of Object.values(changes.components)) {
        // Parse and validate the component
        const processedComponent = parseComponentData(component);
        const category = processedComponent.category;

        // Validate category
        const validCategories = [
          'frame', 'wheels', 'drivetrain', 'brakes', 'fork', 'rear_shock',
          'cockpit_components', 'saddle', 'seatpost', 'pedals', 'e_bike_features'
        ];
        
        if (!validCategories.includes(category)) {
          console.warn(`Skipping invalid category: ${category}`);
          continue;
        }

        console.log(`Processing component with category ${category}:`, processedComponent); // Debug log

        // Check if component exists
        const checkQuery = `
          SELECT * FROM components 
          WHERE bike_id = $1 AND category = $2
        `;
        const { rows } = await client.query(checkQuery, [id, category]);
        const exists = rows.length > 0;

        if (exists) {
          console.log(`Updating existing component ${category}:`, processedComponent); // Debug log
          const updateComponentQuery = `
            UPDATE components 
            SET 
              name = COALESCE($1, name),
              weight = COALESCE($2, weight),
              material = COALESCE($3, material)
            WHERE bike_id = $4 AND category = $5
            RETURNING *
          `;
          const result = await client.query(updateComponentQuery, [
            processedComponent.name,
            processedComponent.weight,
            processedComponent.material,
            id,
            category
          ]);
          console.log('Component update result:', result.rows[0]); // Debug log
        } else {
          console.log(`Inserting new component ${category}:`, processedComponent); // Debug log
          const insertComponentQuery = `
            INSERT INTO components (bike_id, category, name, weight, material)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `;
          const result = await client.query(insertComponentQuery, [
            id,
            category,
            processedComponent.name,
            processedComponent.weight,
            processedComponent.material
          ]);
          console.log('Component insert result:', result.rows[0]); // Debug log
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Bicycle updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating bicycle from scrape:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
