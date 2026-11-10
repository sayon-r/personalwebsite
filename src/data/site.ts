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
  { label: 'linkedin', href: 'https://www.linkedin.com/in/sayonramanan/' },
  { label: 'email', href: 'mailto:sayon.ramanan@uwaterloo.ca' },
  { label: 'résumé', href: '/resume' },
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
      'Two LLMs on a single Raspberry Pi 5, a draft and a target on separate CPU cores, with hand-tuned INT8 matmul kernels written in ARM NEON intrinsics and benchmarked against llama.cpp. Grouped quantization cuts the weights’ memory footprint by 75%.',
    stack: 'c++ · arm neon · quantization',
    href: 'https://github.com/sayon-r/On-Device-Spec-Decoding',
    figure: 'specdecode',
  },
  {
    name: 'Flash Attention, from scratch',
    tag: 'Kernel',
    summary:
      'A tiled forward pass that streams KV blocks through an online softmax, so the N×N score matrix is never materialized while still matching standard attention exactly. A custom autograd backward pass recomputes scores in tiles, keeping training memory linear in sequence length.',
    stack: 'python · pytorch · numpy',
    href: 'https://github.com/sayon-r/Flash-Attention-Transformer',
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
