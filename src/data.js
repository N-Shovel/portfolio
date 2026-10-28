export const EMAIL = 'nimrodpala01@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/nimrod-pala-273a78342/';
export const GITHUB = 'https://github.com/N-Shovel';
export const RESUME = '/Pala_Nimrod_Resume.pdf';

export const projects = [
  {
    name: 'Scrapyard Kingdom',
    meta: 'Game',
    image: 'scrapyard.jpg',
    alt: 'Scrapyard Kingdom title screen',
    description: '3D action tower defense in plain JavaScript. Plan your maze from above, then fight in first or third person. The junkyard rebuilds itself every round.',
    stack: ['JavaScript', 'Three.js', 'Blender'],
    links: [['Play', 'https://n-shovel.github.io/scrapyard-kingdom/'], ['Code', 'https://github.com/N-Shovel/scrapyard-kingdom']],
  },
  {
    name: 'Folder Tracker',
    meta: 'Desktop app · v1.2',
    image: 'folder-tracker.png',
    contain: true,
    alt: 'Folder Tracker panel listing projects by git status',
    description: 'A floating desktop bubble that shows which project folders are on GitHub, git-only or untracked. Native C++ for Windows and Linux, about 6 MB of RAM.',
    stack: ['C++', 'Win32', 'Direct2D', 'GTK'],
    links: [['Download', 'https://github.com/N-Shovel/folder-tracker/releases/latest'], ['Code', 'https://github.com/N-Shovel/folder-tracker']],
  },
  {
    name: 'PageVoice',
    meta: 'In development',
    image: 'pagevoice.svg',
    alt: 'PageVoice: books turned into audio',
    description: 'Offline desktop app that turns EPUB, PDF and TXT books into audiobooks. It cleans up the text, reads it with a neural voice on your CPU, and exports M4B or MP3.',
    stack: ['Python', 'Kokoro TTS', 'ffmpeg'],
    links: [['Code', 'https://github.com/N-Shovel/pagevoice']],
  },
  {
    name: 'C Visualizers',
    meta: 'Education · 3 apps',
    image: 'c-ds.jpg',
    alt: 'C Data Structures Visualizer showing a binary search tree and its C code',
    description: 'Animated walkthroughs for learning C. The code highlights line by line while memory, pointers and stack frames move on screen.',
    stack: ['JavaScript', 'SVG', 'C'],
    links: [
      ['Fundamentals', 'https://n-shovel.github.io/c-fundamentals-visualizer/'],
      ['Data structures', 'https://n-shovel.github.io/c-data-structures-visualizer/'],
      ['Recursion', 'https://n-shovel.github.io/c-recursion-visualizer/'],
    ],
  },
  {
    name: 'ITE Math Lab',
    meta: 'Education',
    image: 'math-lab.jpg',
    alt: 'ITE Math Lab Venn diagram playground',
    description: 'Interactive visualizers for discrete math: Venn diagrams, truth tables, relations, matrices, number systems and counting.',
    stack: ['JavaScript', 'Canvas'],
    links: [['Live', 'https://n-shovel.github.io/ite-math-lab/'], ['Code', 'https://github.com/N-Shovel/ite-math-lab']],
  },
  {
    name: 'Stillness',
    meta: 'Creative coding',
    image: 'stillness.jpg',
    alt: 'Stillness mountain lake scene',
    description: 'A calm mountain lake drawn on canvas that follows your local time, with ambient sound synthesized live in the browser.',
    stack: ['Canvas 2D', 'Web Audio API'],
    links: [['Live', 'https://stillness-sage.vercel.app'], ['Code', 'https://github.com/N-Shovel/stillness']],
  },
];

// [name, description, optional link]
export const moreProjects = [
  ['Organization Café', 'Project leader, in development: platform for CSU student orgs with an LCO fee-status check · React, Supabase', 'https://org-cafe.vercel.app/'],
  ['SmartLib CSU', 'My first team project (a class project): CSU library platform, frontend lead · React, Express, Supabase', 'https://csu-smartlib.vercel.app/'],
  ['ITE 18 Learning Journey', '27 course activities, built and deployed by CI · Three.js, Vite, GitHub Actions', 'https://n-shovel.github.io/ite18-learning-journey/'],
  ['Orbit Synth', 'Generative music toy: planets on orbit rings play notes · Tone.js', 'https://github.com/N-Shovel/orbit-synth'],
  ['Avatar Customizer', 'Minecraft skin editor with 3D preview · TypeScript, Three.js', 'https://github.com/N-Shovel/avatar-customizer'],
];

export const skills = [
  ['Frontend', 'React, TypeScript, JavaScript, Tailwind CSS, Vite'],
  ['Backend', 'Node.js, Express, Supabase, PostgreSQL'],
  ['Systems', 'C, C++, Win32, GTK, Python (learning)'],
  ['Graphics', 'Three.js, Canvas, Web Audio, Godot'],
  ['Tools', 'Git, GitHub Actions, Vercel, Vitest'],
];
