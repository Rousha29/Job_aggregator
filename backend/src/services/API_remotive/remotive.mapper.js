export function mapRemotiveJob(job) {
      // Rejeter les offres sans nom d'entreprise valide
      const companyName = job.company_name?.trim();
      if (!companyName) {
            return null;
      }

      return {
            externalId: job.id,
            title: job.title?.trim() || null,
            company: companyName,
            location: job.candidate_required_location || null,
            description: job.description || '',
            salary_min: null,
            salary_max: null,
            contract_type: 'other',
            remote: true,
            level: null,
            source_url: job.url || null,
            source: 'remotive',
            published_at: job.publication_date ? new Date(job.publication_date) : new Date(),
      };
}