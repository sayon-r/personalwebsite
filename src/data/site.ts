// ---------------------------------------------------------------
// All site content lives here (blog posts live in src/content/blog).
// Anything in [BRACKETS] is a placeholder to replace.
// Colors are one of: lav, mint, peach, butter, sky, pink.
// ---------------------------------------------------------------

export type Pastel = 'lav' | 'mint' | 'peach' | 'butter' | 'sky' | 'pink';

export const site = {
  name: 'Sayon Ramanan',
  description:
    'Building high performance systems at the intersection of hardware and software.',
};

// Small line under the name on the home page.
// To show the emblem, put the image in /public (e.g. public/uwaterloo.png)
// and set `emblem` to its path ('/uwaterloo.png').
export const school = {
  program: 'computer engineering',
  name: 'uwaterloo',
  href: 'https://uwaterloo.ca',
  emblem: null as string | null,
};

export const links = [
  { label: 'github', href: 'https://github.com/sayon-r' },
  { label: 'linkedin', href: '#' }, // [LINKEDIN URL]
  { label: 'email', href: 'mailto:[EMAIL]' },
  { label: 'résumé', href: '/resume.pdf' }, // drop resume.pdf into /public
];

// `color` tints the binary page counter beside the name in the header.
export const pages = [
  { key: 'home', label: 'home', href: '/', color: 'lav' },
  { key: 'experience', label: 'experience', href: '/experience', color: 'butter' },
  { key: 'projects', label: 'projects', href: '/projects', color: 'mint' },
  { key: 'blog', label: 'blog', href: '/blog', color: 'pink' },
] as const;

export type PageKey = (typeof pages)[number]['key'];

export const experience: {
  company: string; role: string; team: string; location: string;
  period: string; summary: string; color: Pastel;
}[] = [
  {
    company: 'onsemi',
    role: 'Software Engineer Intern',
    team: 'SoC Integration',
    location: 'Waterloo',
    period: 'Sep — Dec 2026',
    summary:
      'Agent-driven firmware SDKs, multi-accelerator model deployment, compiler quantization validation, and automated build and test infrastructure across SoC platforms.',
    color: 'butter',
  },
  {
    company: 'Portable Intelligence',
    role: 'Machine Learning Intern',
    team: 'Software Innovation',
    location: 'Toronto',
    period: 'Jan — Apr 2026',
    summary:
      'Reinforcement learning recommendation policies and evaluation tooling for warehouse slot assignment.',
    color: 'sky',
  },
];

// `figure` picks a glyph from src/components/figures.
export const projects = [
  {
    name: 'On-device speculative decoding',
    tag: 'Raspberry Pi 5',
    summary:
      'A small draft model guesses ahead and a larger model checks its work in one pass, so a credit-card computer generates text faster. [Add speedup + models.]',
    stack: 'arm neon · int8 · c++',
    href: '#',
    figure: 'specdecode',
  },
  {
    name: 'Flash Attention, from scratch',
    tag: 'Kernel',
    summary:
      'The forward pass rebuilt tile by tile, with an online softmax so the full attention matrix never exists, wired into a custom autograd function. [Add memory / speed vs naive.]',
    stack: 'pytorch · autograd · tiling',
    href: '#',
    figure: 'flashattn',
  },
] as const;

export const listening = {
  track: '[Track title]',
  artist: '[Artist]',
  // Put covers in /public/covers and reference them as '/covers/name.jpg'.
  // While a cover is null, a pastel tile is shown.
  cover: null as string | null,
  shelf: [
    { title: '[Album · Artist]', cover: null as string | null, color: 'mint' as Pastel },
    { title: '[Album · Artist]', cover: null as string | null, color: 'peach' as Pastel },
    { title: '[Album · Artist]', cover: null as string | null, color: 'butter' as Pastel },
    { title: '[Album · Artist]', cover: null as string | null, color: 'pink' as Pastel },
  ],
};
