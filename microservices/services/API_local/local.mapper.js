const normalizeContractType = (type) => {
      if (!type) return 'other';
      const t = type.toLowerCase();
      if (t.includes('stage')) return 'stage';
      if (t.includes('alternance') || t.includes('apprentissage')) return 'alternance';
      if (t === 'cdi') return 'CDI';
      if (t === 'cdd') return 'CDD';
      return 'other';
};

const normalizeLevel = (experience) => {
      if (!experience) return null;
      if (experience <= 2) return 'junior';
      if (experience <= 5) return 'mid';
      return 'senior';
};

export function mapLocalJob(offre) {
      const companyName = offre.entreprise?.nom?.trim();
      if (!companyName) return null;

      return {
            externalId: `local-${offre.id}`,
            title: offre.titre?.trim() || null,
            company: companyName,
            location: offre.localisation?.ville || null,
            description: offre.description || '',
            salary_min: offre.salaire?.min || null,
            salary_max: offre.salaire?.max || null,
            contract_type: normalizeContractType(offre.type_contrat),
            remote: offre.localisation?.teletravail?.toLowerCase().includes('hybride') ||
                  offre.localisation?.teletravail?.toLowerCase().includes('remote') || false,
            level: normalizeLevel(offre.profil?.experience_annees),
            source_url: offre.entreprise?.site_web || null,
            source: 'local',
      };
}