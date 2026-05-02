'use client'

import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from 'react'
import { mediaGallery, mediaVideos, primarySectionNav } from './sectionPages'

type IconName =
  | 'leaf'
  | 'sparkle'
  | 'shield'
  | 'chat'
  | 'phone'
  | 'users'
  | 'briefcase'
  | 'heart'
  | 'gift'
  | 'close'

type Story = {
  title: string
  tags: string[]
  copy: string
  author: string
  readTime: string
  image: string
  imagePosition: string
  views: number
  shares: number
}

type Program = {
  title: string
  copy: string
  features: string[]
  badge: string
  icon: IconName
}

type Product = {
  title: string
  copy: string
  price: string
  detail: string
  icon: IconName
}

type Person = {
  name: string
  role: string
  copy: string
  image: string
}

type Message = {
  id: number
  from: 'team' | 'visitor'
  text: string
  time: string
}

type SocialPost = {
  id: number
  author: string
  role: string
  label: string
  text: string
  image?: string
  imagePosition?: string
  reactions: string
  comments: number
}

type HelpForm = {
  name: string
  phone: string
  supportType: string
  urgency: string
  message: string
}

type Suggestion = {
  title: string
  label: string
  image: string
  imagePosition: string
}

type AssistantPrompt = {
  id: string
  label: string
  reply: string
  scrollTo?: string
  prefill?: Partial<HelpForm>
}

type PathwayTile = {
  title: string
  copy: string
  href: string
  icon: IconName
  accent: string
}

type SnippetFolder = {
  id: string
  name: string
}

type Snippet = {
  id: string
  title: string
  folderId: string
  code: string
  updatedAt: string
}

type SnippetDraft = {
  title: string
  folderId: string
  code: string
}

const phoneDisplay = '+263 77 577 2277'
const phoneHref = '+263775772277'
const email = 'info@manake.org.zw'
const location = 'Norton, Mashonaland West, Zimbabwe'
const whatsappBase = `https://wa.me/${phoneHref.replace('+', '')}`
const snippetStorageKey = 'manake-snippet-library'

const defaultSnippetFolders: SnippetFolder[] = [
  { id: 'sql-starters', name: 'SQL starters' },
]

const defaultSnippets: Snippet[] = [
  {
    id: 'starter-select-limit',
    title: 'Select table sample',
    folderId: 'sql-starters',
    code: `SELECT
  *
FROM
  < TABLE >
LIMIT
  10;`,
    updatedAt: 'Saved starter',
  },
]

const emptySnippetTemplate = `SELECT
  *
FROM
  < TABLE >
LIMIT
  10;`

const navItems = [{ label: 'Home', href: '/' }, ...primarySectionNav]

const impactStats = [
  { value: '500+', label: 'Youth helped', note: 'Lives transformed' },
  { value: '85%', label: 'Recovery continuity', note: 'Structured aftercare' },
  { value: '1,000+', label: 'Supporters', note: 'Donors and partners' },
  { value: '5', label: 'Years', note: 'Serving Zimbabwe' },
]

const admissionSteps = [
  {
    step: '01',
    title: 'Contact us',
    copy: 'Call or WhatsApp the helpline. We listen first, respond quickly, and keep the first conversation private.',
  },
  {
    step: '02',
    title: 'Assessment',
    copy: 'The team considers safety, substance use, mental health, family context, and practical needs.',
  },
  {
    step: '03',
    title: 'Personalised plan',
    copy: 'Counselling, family support, life skills, routine, and aftercare are matched to the young person.',
  },
  {
    step: '04',
    title: 'Begin recovery',
    copy: 'The person enters a rhythm of care, accountability, belonging, and longer-term follow-up.',
  },
]

const stories: Story[] = [
  {
    title: 'A Vision of Hope: The Manake Story',
    tags: ['Founder', 'Inspiration'],
    copy: 'Sibongile Maonde Sokhani founded Manake with a vision for a sanctuary where young people could find healing, dignity, and purpose.',
    author: 'Sibongile Maonde Sokhani',
    readTime: '10 min read',
    image: '/images/manake/center-exterior.jpg',
    imagePosition: '50% 48%',
    views: 1250,
    shares: 156,
  },
  {
    title: "From Despair to Hope: Tendai's Journey",
    tags: ['Recovery', 'Employment'],
    copy: 'After years of crystal meth use, Tendai is rebuilding trust, working as an electrician, and mentoring younger people.',
    author: 'Tendai M.',
    readTime: '5 min read',
    image: '/images/manake/community-children.jpg',
    imagePosition: '72% 38%',
    views: 234,
    shares: 45,
  },
  {
    title: 'Finding Purpose Through Life Skills Training',
    tags: ['Life Skills', 'Employment'],
    copy: 'Life-skills coaching helped Chipo turn routine, confidence, and practical training into a pathway back to work.',
    author: 'Chipo N.',
    readTime: '4 min read',
    image: '/images/manake/green-field-hand.jpg',
    imagePosition: '82% 46%',
    views: 189,
    shares: 32,
  },
  {
    title: 'Rebuilding Family Bonds After Addiction',
    tags: ['Family', 'Recovery'],
    copy: 'Family counselling gave Tatenda the language, patience, and accountability needed to rebuild trust at home.',
    author: 'Tatenda K.',
    readTime: '6 min read',
    image: '/images/manake/counseling-session.jpg',
    imagePosition: '76% 38%',
    views: 312,
    shares: 67,
  },
  {
    title: 'Back to School: Second Chances',
    tags: ['Education', 'Recovery'],
    copy: 'Nyasha returned to school after treatment and is planning a future in nursing.',
    author: 'Nyasha R.',
    readTime: '5 min read',
    image: '/images/manake/recovery-circle.jpg',
    imagePosition: '78% 42%',
    views: 456,
    shares: 89,
  },
  {
    title: 'Community Leader: Giving Back',
    tags: ['Community', 'Leadership'],
    copy: 'Farai now helps outreach teams identify at-risk youth early and connect them to support before things worsen.',
    author: 'Farai C.',
    readTime: '7 min read',
    image: '/images/manake/outreach-hero.jpg',
    imagePosition: '82% 42%',
    views: 278,
    shares: 56,
  },
]

const programs: Program[] = [
  {
    title: 'Detox support',
    copy: 'Stabilisation support with referral pathways, safety planning, and comfort-focused care.',
    features: ['24/7 response', 'Safety planning', 'Clinical referral'],
    badge: 'Immediate care',
    icon: 'shield',
  },
  {
    title: 'Counselling',
    copy: 'Individual, group, and family sessions help young people process triggers and rebuild trust.',
    features: ['One-to-one therapy', 'Group sessions', 'Family meetings'],
    badge: 'Therapeutic support',
    icon: 'heart',
  },
  {
    title: 'Residential care',
    copy: 'A stable recovery environment with daily rhythm, peer support, and supervised routines.',
    features: ['Structured days', 'Recovery groups', 'Wellbeing routines'],
    badge: 'Safe environment',
    icon: 'leaf',
  },
  {
    title: 'Life skills',
    copy: 'Practical training for confidence, work readiness, healthy relationships, and independent living.',
    features: ['Mentorship', 'Financial basics', 'Work readiness'],
    badge: 'Long-term reintegration',
    icon: 'briefcase',
  },
  {
    title: 'Relapse prevention',
    copy: 'Aftercare planning, coping strategies, and support circles for long-term recovery.',
    features: ['Aftercare plan', 'Check-ins', 'Support network'],
    badge: 'Ongoing support',
    icon: 'users',
  },
  {
    title: 'Community outreach',
    copy: 'Prevention and early intervention for schools, churches, families, and local partners.',
    features: ['Awareness sessions', 'Referral guidance', 'Partner briefings'],
    badge: 'Prevention work',
    icon: 'chat',
  },
]

const products: Product[] = [
  {
    title: 'Recovery sandals',
    copy: 'Community-backed footwear enquiries linked to reintegration and skills support.',
    price: 'Enquire',
    detail: 'Useful for donor packs, graduate support, and practical everyday needs.',
    icon: 'gift',
  },
  {
    title: 'Work-ready boots',
    copy: 'Equipment support for young people stepping back into training, apprenticeships, and work.',
    price: 'Sponsor',
    detail: 'Built for transition into employment, workshops, and livelihood support.',
    icon: 'briefcase',
  },
  {
    title: 'Family care packs',
    copy: 'Support kits that help families stay connected through the first weeks of recovery.',
    price: 'Donate',
    detail: 'Can include transport help, essentials, and recovery follow-up materials.',
    icon: 'heart',
  },
]

const team: Person[] = [
  {
    name: 'Manake Leadership Team',
    role: 'Founding vision and programme guidance',
    copy: 'The centre is led with warmth, accountability, and a strong focus on dignity for young people and their families.',
    image: '/images/team/manaketeam.jpeg',
  },
  {
    name: 'Care and Outreach Team',
    role: 'Counselling, referrals, and family support',
    copy: 'A multidisciplinary support team helps families move from crisis toward structure, stability, and follow-through.',
    image: '/images/team/manake.jpeg',
  },
  {
    name: 'Community Reintegration Team',
    role: 'Aftercare, mentoring, and community connection',
    copy: 'Manake keeps recovery connected to real life through mentoring, follow-up, and practical reintegration support.',
    image: '/images/team/team.jpeg',
  },
]

const trustItems = [
  { title: 'Qualified staff', copy: 'Support combines therapeutic care, practical guidance, and structured referral pathways.', icon: 'shield' as const },
  { title: 'Registered facility', copy: 'Families need a centre that feels accountable, grounded, and professionally run.', icon: 'leaf' as const },
  { title: 'Complete confidentiality', copy: 'Every first step is handled with care and private information is treated respectfully.', icon: 'chat' as const },
  { title: 'Community partners', copy: 'Recovery is strengthened by churches, schools, families, and local organisations.', icon: 'users' as const },
  { title: 'Proven support', copy: 'Aftercare, routine, and community connection help young people sustain momentum.', icon: 'sparkle' as const },
  { title: 'Family-centered', copy: 'Healing is strongest when the wider family is guided alongside the young person.', icon: 'heart' as const },
]

const testimonials = [
  {
    quote: "Manake saved my son's life. The team truly cares about each individual and their family.",
    author: 'Mrs. Moyo',
    role: 'Parent of Graduate',
  },
  {
    quote: "I thought my life was over at 19. Manake showed me there is always a way back.",
    author: 'Tendai M.',
    role: 'Graduate',
  },
  {
    quote: 'The life skills training changed everything. I did not just recover, I discovered purpose.',
    author: 'Chipo N.',
    role: 'Graduate and Mentor',
  },
]

const faqs = [
  {
    q: 'Is treatment confidential?',
    a: 'Yes. Personal information is handled privately and shared only with explicit consent or where safety requires urgent action.',
  },
  {
    q: 'Can parents contact you first?',
    a: 'Yes. Families can speak with Manake before a young person is ready to enter formal support.',
  },
  {
    q: 'How long does recovery take?',
    a: 'Recovery is ongoing. The right plan depends on safety, substance use patterns, family context, and aftercare needs.',
  },
  {
    q: 'Do you support relapse prevention?',
    a: 'Yes. Relapse prevention, coping strategies, aftercare, and community support are part of the full pathway.',
  },
  {
    q: 'What ages do you work with?',
    a: 'Manake focuses mainly on young people and young adults, while considering each referral on its needs and safety.',
  },
  {
    q: 'How do we get started quickly?',
    a: 'The fastest route is a direct helpline call or WhatsApp message with the young person’s current situation and urgency.',
  },
]

const suggestions: Suggestion[] = [
  {
    title: "Maria's Recovery",
    label: 'Featured story',
    image: '/images/products/shoesmanake.jpeg',
    imagePosition: '58% 42%',
  },
  {
    title: 'Community Garden',
    label: 'New program',
    image: '/images/team/team.jpeg',
    imagePosition: '50% 42%',
  },
  {
    title: 'Emergency Fund',
    label: 'Urgent need',
    image: '/images/manake/center-exterior.jpg',
    imagePosition: '52% 45%',
  },
  {
    title: 'Youth Support',
    label: 'Popular',
    image: '/images/team/manake.jpeg',
    imagePosition: '50% 46%',
  },
]

const socialChannels = [
  {
    label: 'WhatsApp',
    detail: '24/7 support line',
    href: `${whatsappBase}?text=Hello%20Manake%2C%20I%20need%20support`,
    icon: 'chat' as const,
    external: true,
  },
  {
    label: 'Stories',
    detail: 'Recovery journeys',
    href: '/stories',
    icon: 'heart' as const,
    external: false,
  },
  {
    label: 'Donate',
    detail: 'Support care packs',
    href: '/donate',
    icon: 'gift' as const,
    external: false,
  },
]

const pathwayTiles: PathwayTile[] = [
  {
    title: 'Get Help',
    copy: 'Immediate support and admissions',
    href: '/get-help',
    icon: 'shield',
    accent: 'from-pink-to-purple',
  },
  {
    title: 'Stories',
    copy: 'Recovery journeys and hope',
    href: '/stories',
    icon: 'heart',
    accent: 'from-purple-to-indigo',
  },
  {
    title: 'Programs',
    copy: 'Counselling and residential care',
    href: '/programs',
    icon: 'leaf',
    accent: 'from-indigo-to-blue',
  },
  {
    title: 'Community',
    copy: 'Family, mentors, and outreach',
    href: '/community',
    icon: 'users',
    accent: 'from-blue-to-cyan',
  },
  {
    title: 'Products',
    copy: 'Practical sponsorship pathways',
    href: '/products',
    icon: 'gift',
    accent: 'from-cyan-to-emerald',
  },
  {
    title: 'Manake AI',
    copy: 'Guided support for first steps',
    href: '/contact',
    icon: 'sparkle',
    accent: 'from-emerald-to-purple',
  },
]

const resourceHighlights = ['Crisis support', 'Family guidance', 'Aftercare planning']

const assistantPrompts: AssistantPrompt[] = [
  {
    id: 'programs',
    label: 'Explain programs',
    reply:
      'Manake combines assessment, counselling, family support, structured residential care, life-skills coaching, and aftercare. The first step is a confidential conversation so the team can match the right level of support.',
    scrollTo: 'programs',
  },
  {
    id: 'referral',
    label: 'Help me refer someone',
    reply:
      'Start with who needs help, how urgent the situation is today, whether they are safe right now, and the best number for follow-up. I have nudged the referral form toward that path.',
    scrollTo: 'get-help',
    prefill: {
      supportType: 'Family referral',
      urgency: 'Today',
    },
  },
  {
    id: 'first-call',
    label: 'Prepare for the first call',
    reply:
      'Keep the first call simple: what is happening now, what substances or behaviours are involved, whether there is immediate danger, and who the safest contact person is. You do not need the full story before asking for help.',
    scrollTo: 'contact',
  },
  {
    id: 'urgent',
    label: 'Need urgent support now',
    reply:
      'If someone is unsafe, use the helpline or WhatsApp immediately. The crisis actions and contact section are the fastest routes on this page.',
    scrollTo: 'contact',
    prefill: {
      urgency: 'Today',
    },
  },
]

const initialPosts: SocialPost[] = [
  {
    id: 1,
    author: 'Tendai M.',
    role: 'Graduate',
    label: 'Recovery win',
    text: 'One year sober this month. Still learning, still showing up, and grateful for the people who kept believing in me.',
    image: '/images/products/shoesmanake.jpeg',
    imagePosition: '56% 42%',
    reactions: '1.2k',
    comments: 48,
  },
  {
    id: 2,
    author: 'Life Skills Studio',
    role: 'Programme update',
    label: 'Skills training',
    text: 'Today’s work-readiness session focused on budgeting, punctuality, and building a routine that can last after treatment.',
    reactions: '870',
    comments: 31,
  },
  {
    id: 3,
    author: 'Family Circle',
    role: 'Support group',
    label: 'Family support',
    text: 'Small steps matter. Honest conversations are starting again, and that changes everything for recovery at home.',
    image: '/images/team/manake.jpeg',
    imagePosition: '50% 45%',
    reactions: '640',
    comments: 22,
  },
]

const initialHelpForm: HelpForm = {
  name: '',
  phone: '',
  supportType: 'Family referral',
  urgency: 'Today',
  message: '',
}

function buildWhatsAppUrl(form: HelpForm) {
  const text = [
    'Hello Manake, I would like support.',
    `Name: ${form.name || 'Not provided'}`,
    `Phone: ${form.phone || 'Not provided'}`,
    `Support type: ${form.supportType}`,
    `Urgency: ${form.urgency}`,
    form.message ? `Message: ${form.message}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `${whatsappBase}?text=${encodeURIComponent(text)}`
}

function Icon({ name }: { name: IconName }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.85,
  }

  switch (name) {
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M19 4c-7 0-12 4.5-12 11 0 3.2 1.8 5 4.5 5C17 20 20 15.7 20 10c0-2.2-.3-4-.8-6Z" />
          <path {...commonProps} d="M8 20c1.2-4.6 4.3-8.2 9.5-11.5" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="m12 3 1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />
          <path {...commonProps} d="m18.5 15 1 2.6 2.5.7-2.5.7-1 2.5-.9-2.5-2.6-.7 2.6-.7.9-2.6Z" />
          <path {...commonProps} d="m5 15 .8 2 2 .6-2 .5-.8 2-.8-2-2-.5 2-.6.8-2Z" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M12 3 5.5 5.5V11c0 4.3 2.5 7.7 6.5 10 4-2.3 6.5-5.7 6.5-10V5.5L12 3Z" />
          <path {...commonProps} d="m9.5 12 1.7 1.7 3.5-3.7" />
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M5 18.5V6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v6.4A2.8 2.8 0 0 1 16.2 16H9l-4 2.5Z" />
          <path {...commonProps} d="M8.5 9.5h7M8.5 12.5h5.5" />
        </svg>
      )
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M6.8 4.8 9.5 7a1.8 1.8 0 0 1 .4 2.3l-1.2 2a13.8 13.8 0 0 0 4 4l2-1.2a1.8 1.8 0 0 1 2.3.4l2.2 2.7a1.8 1.8 0 0 1-.1 2.5l-1 1A3 3 0 0 1 15.5 21C9.7 20.4 3.6 14.3 3 8.5A3 3 0 0 1 4 5.9l1-1a1.8 1.8 0 0 1 1.8-.1Z" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M8.5 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM15.8 11a2.8 2.8 0 1 0 0-5.6" />
          <path {...commonProps} d="M3.5 20a5 5 0 0 1 10 0M14 20a4 4 0 0 1 6.5-3.1" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6" />
          <path {...commonProps} d="M4.8 6h14.4A1.8 1.8 0 0 1 21 7.8v9.4A1.8 1.8 0 0 1 19.2 19H4.8A1.8 1.8 0 0 1 3 17.2V7.8A1.8 1.8 0 0 1 4.8 6Z" />
          <path {...commonProps} d="M3 11.5h18M10 6h4" />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M12 20.5C5 16 3.5 11.3 3.5 8.3A4.3 4.3 0 0 1 7.8 4a4.8 4.8 0 0 1 4.2 2.3A4.8 4.8 0 0 1 16.2 4a4.3 4.3 0 0 1 4.3 4.3c0 3-1.5 7.7-8.5 12.2Z" />
        </svg>
      )
    case 'gift':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 9h16v11H4zM12 9v11M4 13.5h16" />
          <path {...commonProps} d="M8.7 9H7.5A2.5 2.5 0 1 1 10 6.5V9M15.3 9h1.2A2.5 2.5 0 1 0 14 6.5V9" />
        </svg>
      )
    case 'close':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="m6 6 12 12M18 6 6 18" />
        </svg>
      )
    default:
      return null
  }
}

function mediaStyle(imagePosition: string) {
  return { '--media-pos': imagePosition } as CSSProperties
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function makeSnippetId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatSnippetDate() {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function App() {
  const [helpForm, setHelpForm] = useState<HelpForm>(initialHelpForm)
  const [donation, setDonation] = useState('50')
  const [customDonation, setCustomDonation] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [postText, setPostText] = useState('')
  const [posts, setPosts] = useState(initialPosts)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'team',
      text: 'Welcome. Tell us what kind of support you need and we will guide the next step.',
      time: '09:02',
    },
    {
      id: 2,
      from: 'visitor',
      text: 'I need help for a family member.',
      time: '09:03',
    },
    {
      id: 3,
      from: 'team',
      text: 'Thank you for reaching out. Is the situation urgent today?',
      time: '09:04',
    },
  ])
  const [messageDraft, setMessageDraft] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authNotice, setAuthNotice] = useState('')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantTopic, setAssistantTopic] = useState(assistantPrompts[0].label)
  const [assistantReply, setAssistantReply] = useState(assistantPrompts[0].reply)
  const [snippetFolders, setSnippetFolders] = useState<SnippetFolder[]>(defaultSnippetFolders)
  const [snippets, setSnippets] = useState<Snippet[]>(defaultSnippets)
  const [activeSnippetFolderId, setActiveSnippetFolderId] = useState(defaultSnippetFolders[0].id)
  const [selectedSnippetId, setSelectedSnippetId] = useState(defaultSnippets[0].id)
  const [snippetDraft, setSnippetDraft] = useState<SnippetDraft>({
    title: defaultSnippets[0].title,
    folderId: defaultSnippets[0].folderId,
    code: defaultSnippets[0].code,
  })
  const [snippetNotice, setSnippetNotice] = useState('')
  const [snippetsLoaded, setSnippetsLoaded] = useState(false)

  const whatsappUrl = useMemo(() => buildWhatsAppUrl(helpForm), [helpForm])
  const donationValue = customDonation || donation
  const activeFolderSnippets = snippets.filter((snippet) => snippet.folderId === activeSnippetFolderId)
  const selectedSnippet = snippets.find((snippet) => snippet.id === selectedSnippetId)

  useEffect(() => {
    if (!shareStatus) return undefined

    const timeout = window.setTimeout(() => setShareStatus(''), 2500)

    return () => window.clearTimeout(timeout)
  }, [shareStatus])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(snippetStorageKey)
      if (!saved) {
        setSnippetsLoaded(true)
        return
      }

      const parsed = JSON.parse(saved) as {
        folders?: SnippetFolder[]
        snippets?: Snippet[]
      }

      if (!Array.isArray(parsed.folders) || !Array.isArray(parsed.snippets) || parsed.snippets.length === 0) {
        setSnippetsLoaded(true)
        return
      }

      const firstSnippet = parsed.snippets[0]
      setSnippetFolders(parsed.folders.length ? parsed.folders : defaultSnippetFolders)
      setSnippets(parsed.snippets)
      setActiveSnippetFolderId(firstSnippet.folderId)
      setSelectedSnippetId(firstSnippet.id)
      setSnippetDraft({
        title: firstSnippet.title,
        folderId: firstSnippet.folderId,
        code: firstSnippet.code,
      })
    } catch {
      setSnippetNotice('Saved snippets could not be read, so the starter snippet was loaded.')
    } finally {
      setSnippetsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!snippetsLoaded) return

    window.localStorage.setItem(
      snippetStorageKey,
      JSON.stringify({
        folders: snippetFolders,
        snippets,
      }),
    )
  }, [snippetFolders, snippets, snippetsLoaded])

  useEffect(() => {
    const nextSelectedSnippet = snippets.find((snippet) => snippet.id === selectedSnippetId)
    if (!nextSelectedSnippet) return

    setSnippetDraft({
      title: nextSelectedSnippet.title,
      folderId: nextSelectedSnippet.folderId,
      code: nextSelectedSnippet.code,
    })
  }, [selectedSnippetId, snippets])

  useEffect(() => {
    if (!snippetNotice) return undefined

    const timeout = window.setTimeout(() => setSnippetNotice(''), 2600)

    return () => window.clearTimeout(timeout)
  }, [snippetNotice])

  function updateHelpForm(field: keyof HelpForm, value: string) {
    setHelpForm((current) => ({ ...current, [field]: value }))
  }

  function handleHelpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  async function shareStory(story: Story) {
    const url = `${window.location.origin}/stories`
    const text = `${story.title} - ${story.copy}`

    try {
      if (navigator.share) {
        await navigator.share({ title: story.title, text, url })
        setShareStatus(`Shared "${story.title}"`)
      } else {
        await navigator.clipboard.writeText(`${story.title}\n${url}`)
        setShareStatus(`Copied "${story.title}" link`)
      }
    } catch {
      setShareStatus('Sharing was cancelled.')
    }
  }

  function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = postText.trim()

    if (!text) return

    setPosts((current) => [
      {
        id: Date.now(),
        author: 'You',
        role: 'Community supporter',
        label: 'New update',
        text,
        reactions: '0',
        comments: 0,
      },
      ...current,
    ])
    setPostText('')
  }

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = messageDraft.trim()

    if (!text) return

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        from: 'visitor',
        text,
        time: 'Now',
      },
      {
        id: Date.now() + 1,
        from: 'team',
        text: 'Thanks. A support worker would continue this conversation privately.',
        time: 'Now',
      },
    ])
    setMessageDraft('')
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthNotice(
      `${authMode === 'login' ? 'Login' : 'Sign up'} demo submitted. Connect this form to the backend when credentials are ready.`,
    )
  }

  function handleSnippetFolderCreate() {
    const folder: SnippetFolder = {
      id: makeSnippetId('folder'),
      name: `Folder ${snippetFolders.length + 1}`,
    }

    setSnippetFolders((current) => [...current, folder])
    setActiveSnippetFolderId(folder.id)
    setSnippetNotice('Folder created in browser storage.')
  }

  function handleSnippetCreate() {
    const snippet: Snippet = {
      id: makeSnippetId('snippet'),
      title: 'Untitled snippet',
      folderId: activeSnippetFolderId,
      code: emptySnippetTemplate,
      updatedAt: formatSnippetDate(),
    }

    setSnippets((current) => [snippet, ...current])
    setSelectedSnippetId(snippet.id)
    setSnippetDraft({
      title: snippet.title,
      folderId: snippet.folderId,
      code: snippet.code,
    })
    setSnippetNotice('Snippet created. Edit and save when ready.')
  }

  function handleSnippetSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = snippetDraft.title.trim() || 'Untitled snippet'
    const code = snippetDraft.code.trim() || emptySnippetTemplate

    setSnippets((current) =>
      current.map((snippet) =>
        snippet.id === selectedSnippetId
          ? {
              ...snippet,
              title,
              folderId: snippetDraft.folderId,
              code,
              updatedAt: formatSnippetDate(),
            }
          : snippet,
      ),
    )
    setActiveSnippetFolderId(snippetDraft.folderId)
    setSnippetNotice('Snippet saved to browser storage.')
  }

  function handleSnippetDelete() {
    const remainingSnippets = snippets.filter((snippet) => snippet.id !== selectedSnippetId)
    const nextSnippet = remainingSnippets[0]

    if (!nextSnippet) {
      const replacement = {
        ...defaultSnippets[0],
        id: makeSnippetId('snippet'),
        updatedAt: formatSnippetDate(),
      }

      setSnippets([replacement])
      setActiveSnippetFolderId(replacement.folderId)
      setSelectedSnippetId(replacement.id)
      setSnippetNotice('Last snippet was replaced with the starter snippet.')
      return
    }

    setSnippets(remainingSnippets)
    setActiveSnippetFolderId(nextSnippet.folderId)
    setSelectedSnippetId(nextSnippet.id)
    setSnippetNotice('Snippet removed from browser storage.')
  }

  function handleAssistantPrompt(prompt: AssistantPrompt) {
    setAssistantTopic(prompt.label)
    setAssistantReply(prompt.reply)
    setAssistantOpen(true)

    if (prompt.prefill) {
      setHelpForm((current) => ({
        ...current,
        ...prompt.prefill,
      }))
    }

    if (prompt.scrollTo) {
      window.setTimeout(() => scrollToSection(prompt.scrollTo as string), 120)
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <a className="brand" href="/" aria-label="Manake home">
          <span className="brand-mark">
            <Icon name="leaf" />
          </span>
          <span>
            <strong>Manake</strong>
            <small>Rehabilitation Center</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="quiet-link" href="/auth/login" onClick={() => setAuthMode('login')}>
            Login
          </a>
          <a className="quiet-link" href="/auth/signup" onClick={() => setAuthMode('signup')}>
            Sign Up
          </a>
          <a className="button button-primary button-small donate-cta" href="/donate">
            <span className="donate-label-full">Donate Now</span>
            <span className="donate-label-short">Donate</span>
          </a>
          <details className="more-menu">
            <summary>More</summary>
            <div>
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
              <a href="/auth/login" onClick={() => setAuthMode('login')}>
                Login
              </a>
              <a href="/auth/signup" onClick={() => setAuthMode('signup')}>
                Sign Up
              </a>
            </div>
          </details>
        </div>
      </header>

      <main id="main-content">
        <section className="hero section" id="home">
          <div className="hero-copy">
            <p className="eyebrow">Zimbabwe&apos;s premier youth rehabilitation center</p>
            <h1>Manake helps young people and families see the next safe step.</h1>
            <p className="hero-lead">
              Professional rehabilitation programs, life skills training, and ongoing support
              to help young people rebuild their lives with dignity and purpose.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/get-help">
                Get Help Today
              </a>
              <a className="button button-secondary" href="/get-help">
                Refer Someone
              </a>
            </div>
            <div className="contact-row">
              <a href={`tel:${phoneHref}`}>
                <Icon name="phone" />
                {phoneDisplay}
              </a>
              <a
                href={`${whatsappBase}?text=Hello%20Manake%2C%20I%20need%20help`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="chat" />
                WhatsApp Support
              </a>
            </div>
          </div>

          <div className="hero-media">
            <article className="hero-photo-card">
              <img
                src="/images/manake/center-exterior.jpg"
                alt="Manake Rehabilitation Center in Norton"
              />
              <div className="hero-photo-caption">
                <span className="hero-badge">Verified centre</span>
                <strong>Norton, Mashonaland West</strong>
                <small>Residential care, counselling, aftercare, and family support.</small>
              </div>
            </article>

            <div className="hero-panel" aria-label="Impact highlights">
              {impactStats.map((stat) => (
                <article key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                  <small>{stat.note}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section overview-section">
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-heading">
                <p className="eyebrow">Explore</p>
                <h2>Clear pathways for help, recovery, and reintegration.</h2>
              </div>
              <nav className="pathway-list" aria-label="Manake pathways">
                {pathwayTiles.map((tile) => (
                  <a className={`pathway-item ${tile.accent}`} href={tile.href} key={tile.title}>
                    <span className="pathway-item-icon">
                      <Icon name={tile.icon} />
                    </span>
                    <span className="pathway-item-copy">
                      <strong>{tile.title}</strong>
                      <small>{tile.copy}</small>
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            <div className="overview-stack">
              <div className="overview-card compact-card">
                <h3>Platform Stats</h3>
                <div className="compact-stat-list">
                  {impactStats.slice(0, 3).map((stat) => (
                    <div key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-card compact-card">
                <h3>Get Started</h3>
                <p>Complete the first referral steps and we&apos;ll guide the next move privately.</p>
                <a className="button button-primary" href="/get-help">
                  Start Referral
                </a>
              </div>

              <div className="overview-card compact-card">
                <h3>Resources</h3>
                <div className="resource-chip-list">
                  {resourceHighlights.map((resource) => (
                    <span key={resource}>{resource}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-heading">
                <p className="eyebrow">Social</p>
                <h2>Community updates</h2>
              </div>
              <div className="social-mini-stats">
                <span>My Network 0</span>
                <span>Saved Posts 0</span>
                <span>Following 0</span>
              </div>
              <div className="mini-feed">
                {initialPosts.map((post) => (
                  <article key={post.id}>
                    <div className="mini-feed-avatar">{post.author.charAt(0)}</div>
                    <div className="mini-feed-copy">
                      <p>
                        <strong>{post.author}</strong> {post.label}
                      </p>
                      <small>{post.text}</small>
                    </div>
                  </article>
                ))}
              </div>
              <a className="button button-secondary-dark" href="/social">
                Create Post
              </a>
            </div>
          </div>
        </section>

        <section className="founder-section section" id="about">
          <div className="founder-copy">
            <p className="eyebrow">Founder&apos;s message</p>
            <h2>&quot;They are not just numbers. They are our future.&quot;</h2>
            <p>
              Manake was born out of a mother&apos;s heart and a community&apos;s need. Addiction
              is not a moral failing. It is a battle for the soul, safety, and future of young
              people.
            </p>
            <p>
              Our mission is to restore dignity, reignite purpose, and rebuild families. When
              someone walks through these doors, they are not a case file. They are family.
            </p>
            <div className="mini-stats">
              <span>
                <strong>2019</strong>
                Established
              </span>
              <span>
                <strong>500+</strong>
                Lives touched
              </span>
              <span>
                <strong>100%</strong>
                Commitment
              </span>
            </div>
            <div className="founder-actions">
              <a className="button button-ghost" href="/team">
                Meet Our Team
              </a>
              <a className="button button-ghost" href="/about">
                Our Story
              </a>
            </div>
          </div>

          <figure className="founder-photo">
            <img src="/images/team/manake.jpeg" alt="Sibongile Maonde Sokhani and Manake leadership team" />
            <figcaption>
              <strong>Sibongile Maonde Sokhani and team</strong>
              <span>Founder and visionary leadership, supported by the wider Manake team.</span>
            </figcaption>
          </figure>
        </section>

        <section className="crisis-card">
          <div>
            <p className="eyebrow">In crisis? We are here for you</p>
            <h2>24/7 confidential support available.</h2>
            <p>You are not alone. Reach out now for a private and practical first step.</p>
          </div>
          <div className="split-actions">
            <a className="button button-light" href={`tel:${phoneHref}`}>
              <Icon name="phone" />
              Call Now
            </a>
            <a
              className="button button-light button-light-alt"
              href={`${whatsappBase}?text=Hello%20Manake%2C%20I%20need%20urgent%20support`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="chat" />
              WhatsApp
            </a>
          </div>
        </section>

        <section className="section" id="admission">
          <div className="section-heading center">
            <p className="eyebrow">How admission works</p>
            <h2>Getting help is simple.</h2>
            <p>
              We guide families and young people through each step with compassion, confidentiality,
              and a clear sense of what happens next.
            </p>
          </div>
          <div className="step-grid">
            {admissionSteps.map((item) => (
              <article className="step-card" key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section story-feature" id="stories">
          <div className="feature-copy">
            <p className="eyebrow">Real stories of transformation</p>
            <h2>&quot;Manake did not just help me recover. They helped me find my purpose.&quot;</h2>
            <p>
              Every story is a testament to hope, support, second chances, and the power of a
              community that refuses to give up on its young people.
            </p>
            <div className="story-meta-strip">
              <span>Tendai M., 24</span>
              <span>Now a certified electrician and business owner</span>
            </div>
            <a className="text-link" href="/stories">
              Read more success stories
            </a>
          </div>

          <article className="feature-image-card">
            <div className="media-frame">
              <img
                src="/images/manake/community-children.jpg"
                style={mediaStyle('72% 38%')}
                alt="Young people in conversation outdoors at Manake"
              />
            </div>
            <div className="feature-card-footer">
              <strong>Featured Story</strong>
              <span>Recovery, work readiness, and a restored sense of purpose.</span>
            </div>
          </article>
        </section>

        <section className="section" id="story-grid">
          <div className="section-heading">
            <div>
              <p className="eyebrow">More success stories</p>
              <h2>Lives rebuilt with care, skill, and community.</h2>
            </div>
            {shareStatus ? <p className="status-pill">{shareStatus}</p> : null}
          </div>
          <div className="story-grid">
            {stories.map((story) => (
              <article className="story-card" key={story.title}>
                <div className="media-frame">
                  <img src={story.image} style={mediaStyle(story.imagePosition)} alt={story.title} />
                </div>
                <div className="tag-row">
                  {story.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="story-card-body">
                  <h3>{story.title}</h3>
                  <p>{story.copy}</p>
                </div>
                <footer>
                  <div className="story-byline">
                    <strong>{story.author}</strong>
                    <small>{story.readTime}</small>
                  </div>
                  <div className="story-stats">
                    <span>{story.views} views</span>
                    <span>{story.shares} shares</span>
                  </div>
                  <button type="button" onClick={() => shareStory(story)}>
                    Share
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="section tinted" id="programs">
          <div className="section-heading center">
            <p className="eyebrow">Our services</p>
            <h2>Comprehensive care from detox support to aftercare.</h2>
            <p>Manake meets young people where they are and helps them build a steadier future.</p>
          </div>
          <div className="program-grid">
            {programs.map((program) => (
              <article className="program-card" key={program.title}>
                <div className="program-icon">
                  <Icon name={program.icon} />
                </div>
                <span className="program-badge">{program.badge}</span>
                <h3>{program.title}</h3>
                <p>{program.copy}</p>
                <ul>
                  {program.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section community-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Social and support</p>
              <h2>Community updates and private guidance in one place.</h2>
            </div>
            <p>
              The social feed, support chat, and AI guide are presented as part of the same help
              journey, not as separate demos floating off to the side.
            </p>
          </div>

          <div className="community-shell">
            <div className="social-panel" id="social">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Social</p>
                  <h3>Share story</h3>
                </div>
                <span className="panel-status">Moderated community space</span>
              </div>

              <div className="social-channel-row" aria-label="Manake social and support links">
                {socialChannels.map((channel) => (
                  <a
                    className="social-channel"
                    href={channel.href}
                    key={channel.label}
                    target={channel.external ? '_blank' : undefined}
                    rel={channel.external ? 'noreferrer' : undefined}
                  >
                    <span>
                      <Icon name={channel.icon} />
                    </span>
                    <strong>{channel.label}</strong>
                    <small>{channel.detail}</small>
                  </a>
                ))}
              </div>

              <form className="composer" onSubmit={handlePostSubmit}>
                <textarea
                  value={postText}
                  onChange={(event) => setPostText(event.target.value)}
                  placeholder="Share a recovery win, a gratitude note, or encouragement for the community..."
                  rows={4}
                />
                <button className="button button-primary" type="submit">
                  Post update
                </button>
              </form>

              <div className="feed-list">
                {posts.map((post) => (
                  <article className="feed-card" key={post.id}>
                    <header>
                      <div className="avatar-circle">{post.author.charAt(0)}</div>
                      <div>
                        <strong>{post.author}</strong>
                        <small>{post.role}</small>
                      </div>
                      <span className="feed-label">{post.label}</span>
                    </header>

                    <p>{post.text}</p>

                    {post.image ? (
                      <div className="media-frame feed-media">
                        <img
                          src={post.image}
                          style={mediaStyle(post.imagePosition || '50% 50%')}
                          alt=""
                        />
                      </div>
                    ) : null}

                    <footer>
                      <span>{post.reactions} reactions</span>
                      <span>{post.comments} comments</span>
                      <span>Share</span>
                    </footer>
                  </article>
                ))}
              </div>
            </div>

            <div className="community-side">
              <div className="message-panel" id="messaging">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Messaging</p>
                    <h3>Confidential support chat</h3>
                  </div>
                  <span className="panel-status">Response path ready</span>
                </div>

                <div className="chat-window">
                  {messages.map((message) => (
                    <div className={message.from === 'visitor' ? 'bubble visitor' : 'bubble'} key={message.id}>
                      <p>{message.text}</p>
                      <small>{message.time}</small>
                    </div>
                  ))}
                </div>

                <form className="chat-form" onSubmit={handleMessageSubmit}>
                  <input
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Type a private message..."
                  />
                  <button className="button button-primary" type="submit">
                    Send
                  </button>
                </form>
              </div>

              <div className="assistant-preview-card">
                <div className="assistant-preview-head">
                  <span className="assistant-icon">
                    <Icon name="sparkle" />
                  </span>
                  <div>
                    <p className="eyebrow">Manake AI</p>
                    <h3>Floating support guide</h3>
                  </div>
                </div>
                <p>
                  The assistant helps families understand programmes, prepare a first call, and move
                  into the referral form faster.
                </p>
                <button className="button button-secondary-dark" type="button" onClick={() => setAssistantOpen(true)}>
                  Open Manake AI
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section snippet-section" id="snippets">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Snippets</p>
              <h2>Save reusable SQL notes in browser storage.</h2>
            </div>
            <p>
              Create new snippets with the + button, group them in folders, and keep the starter
              query close for quick edits.
            </p>
          </div>

          <div className="snippet-workspace">
            <aside className="snippet-sidebar" aria-label="Snippet folders">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Folders</p>
                  <h3>Library</h3>
                </div>
                <button className="snippet-icon-button" type="button" onClick={handleSnippetFolderCreate} aria-label="Create folder">
                  +
                </button>
              </div>

              <div className="folder-list">
                {snippetFolders.map((folder) => (
                  <button
                    className={folder.id === activeSnippetFolderId ? 'active' : ''}
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveSnippetFolderId(folder.id)}
                  >
                    <span>{folder.name}</span>
                    <small>{snippets.filter((snippet) => snippet.folderId === folder.id).length}</small>
                  </button>
                ))}
              </div>
            </aside>

            <div className="snippet-list-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Saved snippets</p>
                  <h3>{snippetFolders.find((folder) => folder.id === activeSnippetFolderId)?.name || 'Folder'}</h3>
                </div>
                <button className="snippet-add-button" type="button" onClick={handleSnippetCreate} aria-label="Create snippet">
                  <span>+</span>
                  New snippet
                </button>
              </div>

              <div className="snippet-list">
                {activeFolderSnippets.length ? (
                  activeFolderSnippets.map((snippet) => (
                    <button
                      className={snippet.id === selectedSnippetId ? 'active' : ''}
                      key={snippet.id}
                      type="button"
                      onClick={() => setSelectedSnippetId(snippet.id)}
                    >
                      <strong>{snippet.title}</strong>
                      <small>{snippet.updatedAt}</small>
                      <code>{snippet.code.split('\n')[0]}</code>
                    </button>
                  ))
                ) : (
                  <div className="snippet-empty">
                    <strong>No snippets in this folder yet.</strong>
                    <button className="button button-primary" type="button" onClick={handleSnippetCreate}>
                      Create snippet
                    </button>
                  </div>
                )}
              </div>
            </div>

            <form className="snippet-editor" onSubmit={handleSnippetSave}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Editor</p>
                  <h3>{selectedSnippet?.title || 'Snippet'}</h3>
                </div>
                <button className="button button-secondary" type="button" onClick={handleSnippetDelete}>
                  Delete
                </button>
              </div>

              <label>
                <span>Snippet name</span>
                <input
                  value={snippetDraft.title}
                  onChange={(event) => setSnippetDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Snippet name"
                />
              </label>

              <label>
                <span>Folder</span>
                <select
                  value={snippetDraft.folderId}
                  onChange={(event) => setSnippetDraft((current) => ({ ...current, folderId: event.target.value }))}
                >
                  {snippetFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>SQL</span>
                <textarea
                  className="snippet-code"
                  value={snippetDraft.code}
                  onChange={(event) => setSnippetDraft((current) => ({ ...current, code: event.target.value }))}
                  rows={8}
                  spellCheck="false"
                />
              </label>

              <button className="button button-primary" type="submit">
                Save snippet
              </button>
              {snippetNotice ? <p className="notice">{snippetNotice}</p> : null}
            </form>
          </div>
        </section>

        <section className="section products-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Products and sponsorship</p>
              <h2>Practical support that connects recovery to real life.</h2>
            </div>
            <p>
              This keeps the products area useful and credible: practical sponsorship routes instead
              of mismatched images.
            </p>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.title}>
                <div className="product-icon">
                  <Icon name={product.icon} />
                </div>
                <span className="product-price">{product.price}</span>
                <h3>{product.title}</h3>
                <p>{product.copy}</p>
                <small>{product.detail}</small>
                <a href="/contact">Learn more</a>
              </article>
            ))}
          </div>
        </section>

        <section className="section team-section" id="team">
          <div className="section-heading center">
            <p className="eyebrow">Team</p>
            <h2>Professional care with a real human face.</h2>
            <p>These photos now lean on the stronger local assets instead of the weaker composites.</p>
          </div>
          <div className="team-grid">
            {team.map((person) => (
              <article className="team-card" key={person.name}>
                <div className="media-frame">
                  <img src={person.image} alt={person.name} />
                </div>
                <div className="team-card-body">
                  <h3>{person.name}</h3>
                  <strong>{person.role}</strong>
                  <p>{person.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section media-section" id="media">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Photos and videos</p>
              <h2>Manake moments from the local media folder.</h2>
            </div>
            <a className="text-link align-end" href="/media">
              Open media page
            </a>
          </div>

          <div className="video-showcase-grid">
            {mediaVideos.map((video) => (
              <article className="video-card" key={video.title}>
                <video controls preload="metadata" poster="/images/manake/center-exterior.jpg">
                  <source src={video.image} type="video/mp4" />
                </video>
                <div>
                  <strong>{video.title}</strong>
                  <p>{video.copy}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="media-showcase-grid">
            {mediaGallery.slice(0, 12).map((item) => (
              <article className="gallery-card" key={item.image}>
                <div className="media-frame">
                  <img src={item.image} alt={item.title} />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section trust-section">
          <div className="section-heading center">
            <p className="eyebrow">Why families trust Manake</p>
            <h2>Transparent, professional, family-centered care.</h2>
          </div>
          <div className="trust-grid">
            {trustItems.map((item) => (
              <article key={item.title}>
                <span className="trust-icon">
                  <Icon name={item.icon} />
                </span>
                <strong>{item.title}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-heading center">
            <p className="eyebrow">Frequently asked questions</p>
            <h2>Answers for families and young people.</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section testimonials-section">
          <div className="section-heading center">
            <p className="eyebrow">What people say</p>
            <h2>Words from families, graduates, and supporters.</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.author}>
                <span className="quote-mark">&quot;</span>
                <p>{item.quote}</p>
                <strong>{item.author}</strong>
                <small>{item.role}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="action-grid section" id="get-help">
          <div className="help-card">
            <p className="eyebrow">Get support</p>
            <h2>Send a clear first message to the team.</h2>
            <p>Keep sensitive details brief until the team responds privately.</p>
            <form onSubmit={handleHelpSubmit}>
              <input
                value={helpForm.name}
                onChange={(event) => updateHelpForm('name', event.target.value)}
                placeholder="Your name"
              />
              <input
                value={helpForm.phone}
                onChange={(event) => updateHelpForm('phone', event.target.value)}
                placeholder="Phone number"
              />
              <select
                value={helpForm.supportType}
                onChange={(event) => updateHelpForm('supportType', event.target.value)}
              >
                <option>Family referral</option>
                <option>I need help for myself</option>
                <option>School or community referral</option>
                <option>Partner or donor enquiry</option>
              </select>
              <select
                value={helpForm.urgency}
                onChange={(event) => updateHelpForm('urgency', event.target.value)}
              >
                <option>Today</option>
                <option>This week</option>
                <option>Planning ahead</option>
                <option>General information</option>
              </select>
              <textarea
                value={helpForm.message}
                onChange={(event) => updateHelpForm('message', event.target.value)}
                placeholder="What kind of support is needed?"
                rows={4}
              />
              <button className="button button-primary" type="submit">
                Open WhatsApp referral
              </button>
            </form>
          </div>

          <div className="donate-card" id="donate">
            <p className="eyebrow">Donate now</p>
            <h2>Support recovery work.</h2>
            <div className="amount-grid">
              {['25', '50', '100', '250'].map((amount) => (
                <button
                  className={donation === amount && !customDonation ? 'selected' : ''}
                  key={amount}
                  type="button"
                  onClick={() => {
                    setDonation(amount)
                    setCustomDonation('')
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              value={customDonation}
              onChange={(event) => setCustomDonation(event.target.value)}
              placeholder="Custom amount"
              inputMode="decimal"
            />
            <a
              className="button button-primary"
              href={`mailto:${email}?subject=Donation%20pledge%20for%20Manake&body=Hello%20Manake%2C%20I%20would%20like%20to%20pledge%20${encodeURIComponent(donationValue)}.`}
            >
              Pledge {donationValue ? `$${donationValue}` : 'support'}
            </a>
          </div>

          <div className="auth-card" id="auth">
            <div className="auth-tabs">
              <button
                className={authMode === 'login' ? 'active' : ''}
                type="button"
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                className={authMode === 'signup' ? 'active' : ''}
                type="button"
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>
            <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' ? <input placeholder="Full name" autoComplete="name" /> : null}
              <input placeholder="Email address" autoComplete="email" />
              <input
                placeholder="Password"
                type="password"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              />
              <button className="button button-primary" type="submit">
                {authMode === 'login' ? 'Log in' : 'Sign up'}
              </button>
            </form>
            {authNotice ? <p className="notice">{authNotice}</p> : null}
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="contact-copy">
            <p className="eyebrow">Contact</p>
            <h2>Need immediate help?</h2>
            <p>
              Our helpline is available 24/7 for emergencies. The contact area now looks more like
              the live Manake experience: direct, calm, and action-oriented.
            </p>
            <div className="contact-actions">
              <a className="button button-primary" href={`tel:${phoneHref}`}>
                <Icon name="phone" />
                Call Helpline
              </a>
              <a
                className="button button-secondary-dark"
                href={`${whatsappBase}?text=Hello%20Manake%2C%20I%20need%20support`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="chat" />
                WhatsApp Support
              </a>
            </div>
          </div>

          <div className="contact-panel">
            <address>
              <strong>{location}</strong>
              <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>
              <a href={`mailto:${email}`}>{email}</a>
            </address>
            <div className="contact-meta">
              <span>Opening Hours</span>
              <strong>Available 24/7 for emergencies</strong>
            </div>
          </div>
        </section>

        <section className="section discover-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Suggested for you</p>
              <h2>Keep exploring the Manake community.</h2>
            </div>
            <a className="text-link align-end" href="/stories">
              See all
            </a>
          </div>
          <div className="discover-grid">
            {suggestions.map((item) => (
              <article className="discover-card" key={item.title}>
                <div className="media-frame">
                  <img src={item.image} style={mediaStyle(item.imagePosition)} alt={item.title} />
                </div>
                <div className="discover-card-body">
                  <small>{item.label}</small>
                  <strong>{item.title}</strong>
                  <button type="button">Follow</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>Manake Rehabilitation Center</strong>
          <span>Serving Zimbabwe&apos;s youth with compassion and steady support since 2019.</span>
          <small>Developed by Munyaradzi Chenjerai</small>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/about">About</a>
          <a href="/get-help">Help</a>
          <a href="/contact">Contact</a>
          <a href="/account">Privacy</a>
          <a href="/account">Terms</a>
        </nav>
        <small>© 2026 Manake Rehabilitation Center</small>
      </footer>

      <aside className={`assistant-panel ${assistantOpen ? 'open' : ''}`} aria-hidden={!assistantOpen}>
        <div className="assistant-panel-header">
          <div>
            <p className="eyebrow">Manake AI</p>
            <strong>Manake AI support guide</strong>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close AI assistant"
            onClick={() => setAssistantOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <p className="assistant-copy">
          Quick help for families, supporters, and young people who need a calm first step.
        </p>
        <div className="assistant-prompts">
          {assistantPrompts.map((prompt) => (
            <button key={prompt.id} type="button" onClick={() => handleAssistantPrompt(prompt)}>
              {prompt.label}
            </button>
          ))}
        </div>
        <div className="assistant-reply">
          <span className="assistant-topic">{assistantTopic}</span>
          <p>{assistantReply}</p>
        </div>
        <div className="assistant-actions">
          <button type="button" className="button button-primary" onClick={() => handleAssistantPrompt(assistantPrompts[1])}>
            Get Help
          </button>
          <a className="button button-secondary-dark" href={`tel:${phoneHref}`}>
            <Icon name="phone" />
            Call
          </a>
          <a
            className="button button-secondary-dark"
            href={`${whatsappBase}?text=Hello%20Manake%2C%20I%20need%20support`}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="chat" />
            WhatsApp
          </a>
        </div>
      </aside>

      <button
        className={`assistant-fab ${assistantOpen ? 'is-open' : ''}`}
        type="button"
        onClick={() => setAssistantOpen((current) => !current)}
        aria-label="Open Manake AI"
      >
        <Icon name="sparkle" />
        <span>Manake AI</span>
      </button>
    </div>
  )
}

export default App
