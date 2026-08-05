export type FeaturedSlide = {
  image: string;
  tag: string;
  title: string;
  description: string;
};

export type ElaboratePalette = {
  primary: { main: string; };
  secondary: { main: string; };
  background: { default: string; paper: string; };
  text: { primary: string; secondary: string; };
  custom: {
    watch: { main: string; contrastText: string; gradientStart: string; gradientEnd: string; };
    meet: { main: string; contrastText: string; gradientStart: string; gradientEnd: string; };
    manage: { main: string; contrastText: string; gradientStart: string; gradientEnd: string; };
    default: { main: string; contrastText: string; gradientStart: string; gradientEnd: string; };
  };
};

export type ChallengeUpdate = {
  id: string;
  title: string;
  summary: string;
  section: 'innovations' | 'community' | 'activities' | 'livestreams' | 'jobs' | 'learn' | 'library';
  importance: 'high' | 'normal';
  date: string;
  linkText: string;
  externalLink?: string; // If it links out entirely
};

export type ChallengeSection = {
  title: string;
  content: string;
  lockedContent?: {
    title: string;
    content: string;
    ctaText: string;
  };
};

export type LearningMaterial = {
  slug: string;
  title: string;
  type: 'article' | 'video' | 'pdf';
  thumbnailUrl: string;
  previewText: string;
  fullContent?: string; // HTML or Markdown for article, Video ID for video, URL for PDF
  isPremium: boolean;
  dateAdded: string; // ISO date string
  author?: string;
  readTime?: string; // e.g. "5 min read"
};

export type PersonTimelineEvent = {
  year: string;
  title: string;
  description: string;
};

export type PersonHighlight = {
  label: string;
  value: string;
};

export type Person = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  coverUrl?: string;
  linkedin?: string;
  twitter?: string;
  timeline?: PersonTimelineEvent[];
  highlights?: PersonHighlight[];
};

export type SubcategoryData = {
  id: string;
  title: string;
  groupName?: string;
  desc: string;
  longDesc?: string;
  imageUrl: string;
  stats?: { activeSolutions: number; capitalDeployed: string; communitySize: string; };
  updates: ChallengeUpdate[];
  learningMaterials: LearningMaterial[];
  sections: {
    innovations: ChallengeSection;
    library: ChallengeSection;
    community: ChallengeSection;
    activities: ChallengeSection;
    livestreams: ChallengeSection;
    jobs: ChallengeSection;
  };
};

export type ChallengeData = {
  id: string;
  title: string;
  desc: string; // Short description for the homepage grid
  longDesc: string; // Long description for the Challenge page hero
  imageUrl: string; // Cover image for the challenge
  stats: { activeSolutions: number; capitalDeployed: string; communitySize: string; };
  subcategories: SubcategoryData[];
};

export type TenantConfig = {
  name: string;
  domain: string;
  people: Person[];
  socialLinks?: {
    x?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
  palette: {
    light: ElaboratePalette;
    dark: ElaboratePalette;
  };
  com: {
    homepage: {
      heroHeadline: string;
      heroSubheadline: string;
      challengesTitle: string;
      challenges: ChallengeData[];
      showcaseProjects: {
        title: string;
        desc: string;
        imageUrl: string;
        link: string;
      }[];
    }
  };
  org: {
    homepage: {
      title: string;
      heroHeadline: string;
      heroSubheadline: string;
      ctaText: string;
      aboutLinkText: string;
      featuredSlideshow: FeaturedSlide[];
    };
    about: {
      title: string;
      subtitle: string;
      features: { title: string; desc: string; }[];
      ctaText: string;
    }
  };
};
