// ---------------------------------------------------------------
// All site content lives here (blog posts live in src/content/blog).
// Anything in [BRACKETS] is a placeholder to replace.
// ---------------------------------------------------------------

export const site = {
  name: 'Sayon Ramanan',
  title: 'Sayon Ramanan',
  description:
    'Building high performance systems at the intersection of hardware and software.',
};

export const links = [
  { label: 'GitHub', href: 'https://github.com/sayon-r' },
  { label: 'LinkedIn', href: '#' }, // [LINKEDIN URL]
  { label: 'Email', href: 'mailto:[EMAIL]' },
  { label: 'Résumé', href: '/resume.pdf' }, // drop resume.pdf into /public
];

export const nav = [
  { label: 'home', href: '/' },
  { label: 'experience', href: '/experience' },
  { label: 'projects', href: '/projects' },
  { label: 'blog', href: '/blog' },
];

export const experience = [
  {
    company: 'onsemi',
    role: 'Software Engineer Intern',
    team: 'SoC Integration',
    location: 'Waterloo',
    period: 'Sep — Dec 2026',
    summary:
      'Agent-driven firmware SDKs, multi-accelerator model deployment, compiler quantization validation, and automated build and test infrastructure across SoC platforms.',
  },
  {
    company: 'Portable Intelligence',
    role: 'Machine Learning Intern',
    team: 'Software Innovation',
    location: 'Toronto',
    period: 'Jan — Apr 2026',
    summary:
      'Reinforcement learning recommendation policies and evaluation tooling for warehouse slot assignment.',
  },
];

// Featured projects render as cards with a figure.
// `figure` picks one of the diagrams in src/components/figures.
export const projects = [
  {
    id: 'P/01',
    tag: 'Raspberry Pi 5',
    name: 'On-device speculative decoding',
    summary:
      'A small draft model guesses ahead and a larger model checks its work in one pass, so a credit-card computer generates text faster.',
    todo: '[ADD SPEEDUP + MODELS.]',
    stack: 'arm neon · int8 · c++',
    href: '#',
    figure: 'specdecode',
  },
  {
    id: 'P/02',
    tag: 'Kernel',
    name: 'Flash Attention, from scratch',
    summary:
      'The forward pass rebuilt tile by tile, with an online softmax so the full attention matrix never exists, wired into a custom autograd function.',
    todo: '[ADD MEMORY / SPEED VS NAIVE.]',
    stack: 'pytorch · autograd · tiling',
    href: '#',
    figure: 'flashattn',
  },
] as const;

// Smaller projects render as compact rows under the cards.
export const smallProjects = [
  { id: 'P/03', name: '[Smaller project]', summary: '[one line on what it is]', href: '#' },
  { id: 'P/04', name: '[Smaller project]', summary: '[one line on what it is]', href: '#' },
];

export const listening = {
  track: '[Track title]',
  artist: '[Artist]',
  // Put cover images in /public/covers and reference them as '/covers/name.jpg'.
  // While a cover is null, a neutral gradient tile is shown.
  cover: null as string | null,
  shelf: [
    { title: '[Album · Artist]', cover: null as string | null, tint: ['#6b4b3a', '#22160f'] },
    { title: '[Album · Artist]', cover: null as string | null, tint: ['#c9c3b5', '#5c574d'] },
    { title: '[Album · Artist]', cover: null as string | null, tint: ['#2f4a45', '#0f1a18'] },
    { title: '[Album · Artist]', cover: null as string | null, tint: ['#552a2a', '#1a0c0c'] },
  ],
};
