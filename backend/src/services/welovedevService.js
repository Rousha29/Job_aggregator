import pool from '../config/db.js';

export const fetchJobs = async (page = 0, size = 20, q = '', contractTypes = [], remote = [], salaryMin = null) => {
  const offset = page * size;
  let query = `SELECT * FROM offers WHERE 1=1`;
  let countQuery = `SELECT COUNT(*) FROM offers WHERE 1=1`;
  let params = [];
  let paramIndex = 1;

  if (q) {
    const searchPattern = `%${q}%`;
    query += ` AND (title ILIKE $${paramIndex} OR company ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
    countQuery += ` AND (title ILIKE $${paramIndex} OR company ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
    params.push(searchPattern);
    paramIndex++;
  }

  if (contractTypes.length > 0) {
    query += ` AND contract_type = ANY($${paramIndex}::text[])`;
    countQuery += ` AND contract_type = ANY($${paramIndex}::text[])`;
    params.push(contractTypes);
    paramIndex++;
  }

  if (remote.length > 0) {
    // Mapping frontend → valeurs DB remote_policy
    const remotePolicyMap = {
      'remote': 'remote',
      'hybrid': 'hybrid',
      'onsite': 'onsite',
    };
    const remotePolicyValues = remote.map(r => remotePolicyMap[r] ?? r);
    query += ` AND remote_policy = ANY($${paramIndex}::text[])`;
    countQuery += ` AND remote_policy = ANY($${paramIndex}::text[])`;
    params.push(remotePolicyValues);
    paramIndex++;
  }

  if (salaryMin) {
    query += ` AND salary_min >= $${paramIndex}`;
    countQuery += ` AND salary_min >= $${paramIndex}`;
    params.push(salaryMin);
    paramIndex++;
  }

  query += ` ORDER BY fetched_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  const queryParams = [...params, size, offset];

  console.log('SQL:', query);
  console.log('Params:', params);

  try {
    const [res, countRes] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, params)
    ]);

    const totalCount = parseInt(countRes.rows[0].count);
    const values = res.rows.map(row => ({
      id: row.id,
      title: row.title,
      source: row.source,
      smallCompany: { companyName: row.company },
      formattedPlaces: row.location ? [row.location] : [],
      contractTypes: [mapContractBack(row.contract_type)],
      details: {
        salary: { min: row.salary_min, max: row.salary_max },
        remotePolicy: { frequency: row.remote_policy ?? (row.remote ? 'remote' : 'onsite') }
      },
      descriptionPreview: row.description,
      publishDate: row.fetched_at ? new Date(row.fetched_at).getTime() * 1000 : null,
      seoAlias: row.source_url ? row.source_url.split('/').pop() : null,
    }));

    return { values, totalCount };
  } catch (error) {
    console.error('Database error in fetchJobs:', error);
    throw error;
  }
};

const mapContractBack = (type) => {
  const map = {
    'stage': 'internship',
    'alternance': 'alternance',
    'CDI': 'permanent',
    'CDD': 'contract',
    'freelance': 'freelance',
    'Autres': 'other',
  };
  return map[type] ?? type;
};