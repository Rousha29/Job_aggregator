import { fetchRemotiveJobs } from "./remotive.service.js";
import pool from "../config/db.js";

const normalizeRemotive = (raw) => {
  // Rejeter les offres sans nom d'entreprise valide
  const companyName = raw.company_name?.trim();
  if (!companyName) {
    return null;
  }

  return {
    external_id: raw.id,
    title: raw.title,
    description: raw.description,
    company: companyName,
    location: raw.candidate_required_location,
    contract_type: "other", // Remotive souvent moins précis
    salary_min: null,
    salary_max: null,
    remote: true,
    level: null,
    source_url: raw.url,
  };
};

export const ingestRemotiveJobs = async () => {
  const jobs = await fetchRemotiveJobs();

  let ingested = 0;
  for (const raw of jobs) {
    const o = normalizeRemotive(raw);
    
    // Rejeter les offres sans nom d'entreprise valide
    if (!o) {
      continue;
    }

    await pool.query(
      `INSERT INTO offers (
        external_id, title, description, company, location,
        contract_type, salary_min, salary_max, remote,
        level, source_url, fetched_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
      ON CONFLICT (external_id) DO UPDATE SET
        title=$2, description=$3, company=$4, location=$5,
        contract_type=$6, salary_min=$7, salary_max=$8,
        remote=$9, level=$10, source_url=$11, fetched_at=NOW()`,
      [
        o.external_id, o.title, o.description, o.company, o.location,
        o.contract_type, o.salary_min, o.salary_max, o.remote,
        o.level, o.source_url
      ]
    );

    ingested++;
  }

  return { ingested };
};