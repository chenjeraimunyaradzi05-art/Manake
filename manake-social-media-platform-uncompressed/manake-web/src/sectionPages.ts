export type SectionCard = {
  title: string
  copy: string
  image?: string
  imagePosition?: string
  meta?: string
  href?: string
}

export type SectionFaq = {
  q: string
  a: string
}

export type SectionPage = {
  slug: string
  navLabel: string
  eyebrow: string
  title: string
  intro: string
  image?: string
  imagePosition?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  stats?: Array<{ value: string; label: string }>
  cards?: SectionCard[]
  faqs?: SectionFaq[]
}

export const mediaGallery: SectionCard[] = [
  {
    title: 'Community portrait',
    copy: 'Manake community imagery from the supplied media folder.',
    image: '/images/manake/gallery/girl.jpg',
    meta: 'Photo',
  },
  {
    title: 'Great Zimbabwe',
    copy: 'Zimbabwe heritage imagery for community and national context.',
    image: '/images/manake/gallery/great-zimbabwe-ruins-zimbabwe.jpg',
    meta: 'Photo',
  },
  {
    title: 'Harare',
    copy: 'Zimbabwe city context for outreach and partner stories.',
    image: '/images/manake/gallery/harare.webp',
    meta: 'Photo',
  },
  {
    title: 'Rural landscape',
    copy: 'Local landscape imagery for prevention and outreach pages.',
    image: '/images/manake/gallery/rocks.webp',
    meta: 'Photo',
  },
  {
    title: 'Victoria Falls',
    copy: 'Zimbabwe destination imagery for national identity.',
    image: '/images/manake/gallery/top-10-tourist-attractions-in-zimbabwe-victoria-falls-3.webp',
    meta: 'Photo',
  },
  {
    title: 'Zimbabwe landscape',
    copy: 'Landscape imagery for broad Manake storytelling.',
    image: '/images/manake/gallery/shutterstock-1053675446.jpg',
    meta: 'Photo',
  },
  {
    title: 'Manake moment',
    copy: 'A supplied Manake programme and community photo.',
    image: '/images/manake/gallery/rr.webp',
    meta: 'Photo',
  },
  {
    title: 'Manake team moment',
    copy: 'A supplied Manake programme and community photo.',
    image: '/images/manake/gallery/rrr.webp',
    meta: 'Photo',
  },
  ...Array.from({ length: 27 }, (_, index) => {
    const photoNumber = String(index + 1).padStart(2, '0')

    return {
      title: `Manake programme photo ${photoNumber}`,
      copy: 'A supplied Manake photo from the local media folder.',
      image: `/images/manake/gallery/manake-photo-${photoNumber}.jpeg`,
      meta: 'Photo',
    }
  }),
]

export const mediaVideos: SectionCard[] = [
  {
    title: 'Manake video 01',
    copy: 'Supplied Manake video from the local media folder.',
    image: '/images/manake/gallery/manake-video-01.mp4',
    meta: 'Video',
  },
  {
    title: 'Manake video 02',
    copy: 'Supplied Manake video from the local media folder.',
    image: '/images/manake/gallery/manake-video-02.mp4',
    meta: 'Video',
  },
]

const admissionSteps: SectionCard[] = [
  {
    title: 'Contact us',
    copy: 'Call or WhatsApp the helpline. The first conversation is private, calm, and practical.',
    meta: 'Step 01',
  },
  {
    title: 'Assessment',
    copy: 'The team considers safety, substance use, family context, mental health, and practical needs.',
    meta: 'Step 02',
  },
  {
    title: 'Personalised plan',
    copy: 'Counselling, family support, routine, life skills, and aftercare are matched to the person.',
    meta: 'Step 03',
  },
  {
    title: 'Begin recovery',
    copy: 'The young person enters a rhythm of care, accountability, belonging, and follow-up.',
    meta: 'Step 04',
  },
]

const storyCards: SectionCard[] = [
  {
    title: 'A Vision of Hope: The Manake Story',
    copy: 'Sibongile Maonde Sokhani founded Manake as a sanctuary where young people can find healing, dignity, and purpose.',
    image: '/images/manake/center-exterior.jpg',
    imagePosition: '50% 48%',
    meta: 'Founder story',
  },
  {
    title: "From Despair to Hope: Tendai's Journey",
    copy: 'A recovery journey shaped by practical support, work readiness, and renewed confidence.',
    image: '/images/manake/community-children.jpg',
    imagePosition: '58% 42%',
    meta: 'Recovery',
  },
  {
    title: 'Rebuilding Family Bonds After Addiction',
    copy: 'Family counselling gives parents and young people a way to rebuild trust at home.',
    image: '/images/manake/counseling-session.jpg',
    imagePosition: '50% 42%',
    meta: 'Family support',
  },
  {
    title: 'Back to School: Second Chances',
    copy: 'Recovery is strongest when education, routine, and future planning return to daily life.',
    image: '/images/manake/recovery-circle.jpg',
    imagePosition: '50% 46%',
    meta: 'Education',
  },
]

const programCards: SectionCard[] = [
  {
    title: 'Detox support',
    copy: 'Stabilisation support with referral pathways, safety planning, and comfort-focused care.',
    meta: 'Immediate care',
  },
  {
    title: 'Counselling',
    copy: 'Individual, group, and family sessions help young people process triggers and rebuild trust.',
    meta: 'Therapeutic support',
  },
  {
    title: 'Residential care',
    copy: 'A stable recovery environment with daily rhythm, peer support, and supervised routines.',
    meta: 'Safe environment',
  },
  {
    title: 'Life skills',
    copy: 'Practical training for confidence, work readiness, healthy relationships, and independent living.',
    meta: 'Reintegration',
  },
  {
    title: 'Relapse prevention',
    copy: 'Aftercare planning, coping strategies, and support circles for long-term recovery.',
    meta: 'Ongoing support',
  },
  {
    title: 'Community outreach',
    copy: 'Prevention and early intervention for schools, churches, families, and local partners.',
    meta: 'Prevention',
  },
]

const faqCards: SectionFaq[] = [
  {
    q: 'Is treatment confidential?',
    a: 'Yes. Personal information is handled privately and shared only with consent or where safety requires urgent action.',
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
]

export const sectionPages: SectionPage[] = [
  {
    slug: 'explore',
    navLabel: 'Explore',
    eyebrow: 'Explore Manake',
    title: 'Clear pathways for help, recovery, and reintegration.',
    intro: 'Start with the route that fits the situation: urgent help, recovery stories, programmes, community updates, products, or contact.',
    image: '/images/manake/outreach-hero.jpg',
    ctaLabel: 'Get Help',
    ctaHref: '/get-help',
    secondaryLabel: 'View Media',
    secondaryHref: '/media',
    cards: [
      { title: 'Get Help', copy: 'Immediate support and admissions.', href: '/get-help' },
      { title: 'Stories', copy: 'Recovery journeys and hope.', href: '/stories' },
      { title: 'Programs', copy: 'Counselling, residential care, and aftercare.', href: '/programs' },
      { title: 'Community', copy: 'Family, mentors, and outreach.', href: '/community' },
      { title: 'Products', copy: 'Practical sponsorship pathways.', href: '/products' },
      { title: 'Manake AI', copy: 'Guided support for first steps.', href: '/contact' },
    ],
  },
  {
    slug: 'about',
    navLabel: 'About',
    eyebrow: "Founder's message",
    title: 'They are not just numbers. They are our future.',
    intro: "Manake was born out of a mother's heart and a community's need. The centre restores dignity, reignites purpose, and rebuilds families.",
    image: '/images/manake/founder-event.jpg',
    imagePosition: '50% 42%',
    ctaLabel: 'Meet the Team',
    ctaHref: '/team',
    secondaryLabel: 'Read Stories',
    secondaryHref: '/stories',
    stats: [
      { value: '2019', label: 'Established' },
      { value: '500+', label: 'Lives touched' },
      { value: '100%', label: 'Commitment' },
    ],
    cards: [
      {
        title: 'A sanctuary for young people',
        copy: "Every person who walks through Manake's doors is treated with dignity, privacy, and steady care.",
      },
      {
        title: 'Family-centred recovery',
        copy: 'The work supports parents and caregivers alongside the young person, because recovery reaches the whole home.',
      },
      {
        title: 'Purpose after treatment',
        copy: 'Counselling, routine, life skills, and aftercare help young people move back into real life.',
      },
    ],
  },
  {
    slug: 'crisis-support',
    navLabel: 'Crisis',
    eyebrow: 'In crisis?',
    title: '24/7 confidential support is available.',
    intro: 'Use the helpline or WhatsApp support route for urgent situations. Keep the first message clear and practical so the team can respond quickly.',
    image: '/images/manake/outreach-hero.jpg',
    imagePosition: '52% 45%',
    ctaLabel: 'Call Helpline',
    ctaHref: 'tel:+263775772277',
    secondaryLabel: 'WhatsApp Support',
    secondaryHref: 'https://wa.me/263775772277?text=Hello%20Manake%2C%20I%20need%20urgent%20support',
    cards: [
      { title: 'Stay with the person', copy: 'If someone is unsafe, keep them near a trusted adult and seek urgent help.' },
      { title: 'Share the essentials', copy: 'Name, location, urgency, substance or behaviour involved, and a safe callback number.' },
      { title: 'Move to private care', copy: 'Sensitive details should be handled through direct contact with the Manake team.' },
    ],
  },
  {
    slug: 'admission',
    navLabel: 'Admission',
    eyebrow: 'How admission works',
    title: 'Getting help is simple.',
    intro: 'Manake guides families and young people through each step with compassion, confidentiality, and a clear sense of what happens next.',
    image: '/images/manake/gallery/manake-photo-14.jpeg',
    ctaLabel: 'Start Referral',
    ctaHref: '/get-help',
    cards: admissionSteps,
  },
  {
    slug: 'stories',
    navLabel: 'Stories',
    eyebrow: 'Real stories of transformation',
    title: 'Lives rebuilt with care, skill, and community.',
    intro: 'Every story is a testament to hope, support, second chances, and a community that refuses to give up on its young people.',
    image: '/images/manake/community-children.jpg',
    imagePosition: '50% 46%',
    ctaLabel: 'Share a Story',
    ctaHref: '/social',
    cards: storyCards,
  },
  {
    slug: 'programs',
    navLabel: 'Programs',
    eyebrow: 'Our services',
    title: 'Comprehensive care from detox support to aftercare.',
    intro: 'Manake meets young people where they are and helps them build a steadier future through structured care and follow-through.',
    image: '/images/manake/gallery/manake-photo-07.jpeg',
    imagePosition: '50% 45%',
    ctaLabel: 'Ask About Programs',
    ctaHref: '/contact',
    cards: programCards,
  },
  {
    slug: 'social',
    navLabel: 'Social',
    eyebrow: 'Social and support',
    title: 'A moderated community space for updates, encouragement, and recovery wins.',
    intro: 'The social area is prepared for posts, story sharing, community moderation, and future database-backed content.',
    image: '/images/manake/gallery/manake-photo-26.jpeg',
    imagePosition: '50% 44%',
    ctaLabel: 'Open Messaging',
    ctaHref: '/messaging',
    cards: [
      { title: 'Recovery wins', copy: 'Members can share progress, gratitude notes, and encouragement.' },
      { title: 'Moderated updates', copy: 'Posts are shaped for a safe, supportive community experience.' },
      { title: 'Database ready', copy: 'The page is ready to connect posts and comments to Neon through the Prisma models.' },
    ],
  },
  {
    slug: 'community',
    navLabel: 'Community',
    eyebrow: 'Community',
    title: 'Groups, mentors, families, and outreach partners working together.',
    intro: 'Community support connects recovery to schools, churches, families, mentors, and local partner networks.',
    image: '/images/manake/gallery/manake-photo-24.jpeg',
    ctaLabel: 'See Social',
    ctaHref: '/social',
    cards: [
      { title: 'Family circles', copy: 'Guidance for caregivers and families navigating recovery together.' },
      { title: 'Mentor groups', copy: 'Peer support and lived-experience encouragement after treatment.' },
      { title: 'Outreach partners', copy: 'Schools, churches, and community organisations can refer people early.' },
    ],
  },
  {
    slug: 'messaging',
    navLabel: 'Messaging',
    eyebrow: 'Private support',
    title: 'Confidential conversations for families and young people.',
    intro: 'Messaging is prepared for support conversations, WhatsApp handoff, and future database-backed conversation history.',
    image: '/images/manake/gallery/manake-photo-01.jpeg',
    ctaLabel: 'WhatsApp Support',
    ctaHref: 'https://wa.me/263775772277?text=Hello%20Manake%2C%20I%20need%20support',
    secondaryLabel: 'Contact Manake',
    secondaryHref: '/contact',
    cards: [
      { title: 'Private first step', copy: 'Families can ask for support without posting sensitive details publicly.' },
      { title: 'Clear triage', copy: 'Urgency, support type, and safe callback details guide the next response.' },
      { title: 'Conversation storage ready', copy: 'The Prisma schema already includes messages and conversations for Neon-backed persistence.' },
    ],
  },
  {
    slug: 'products',
    navLabel: 'Products',
    eyebrow: 'Products and sponsorship',
    title: 'Practical support that connects recovery to real life.',
    intro: 'Products and sponsorship pathways help donors support everyday needs, work readiness, and reintegration.',
    image: '/images/products/shoesmanake.jpeg',
    ctaLabel: 'Enquire',
    ctaHref: '/contact',
    cards: [
      { title: 'Recovery sandals', copy: 'Community-backed footwear enquiries linked to reintegration and skills support.', meta: 'Enquire' },
      { title: 'Work-ready boots', copy: 'Equipment support for young people entering training, apprenticeships, and work.', meta: 'Sponsor' },
      { title: 'Family care packs', copy: 'Support kits that help families stay connected through the first weeks of recovery.', meta: 'Donate' },
    ],
  },
  {
    slug: 'team',
    navLabel: 'Team',
    eyebrow: 'Team',
    title: 'Professional care with a real human face.',
    intro: "Manake's team brings leadership, counselling, outreach, family support, and reintegration care into one steady pathway.",
    image: '/images/team/manaketeam.jpeg',
    ctaLabel: 'Contact the Team',
    ctaHref: '/contact',
    cards: [
      {
        title: 'Manake Leadership Team',
        copy: 'Founding vision and programme guidance for youth recovery.',
        image: '/images/team/manaketeam.jpeg',
      },
      {
        title: 'Care and Outreach Team',
        copy: 'Counselling, referrals, and family support.',
        image: '/images/team/manake.jpeg',
      },
      {
        title: 'Community Reintegration Team',
        copy: 'Aftercare, mentoring, and community connection.',
        image: '/images/team/team.jpeg',
      },
    ],
  },
  {
    slug: 'media',
    navLabel: 'Media',
    eyebrow: 'Photos and videos',
    title: 'Manake photos and videos from the local media folder.',
    intro: 'The supplied images and MP4s are now available to the public web app as clean, deployable assets.',
    image: '/images/manake/outreach-hero.jpg',
    ctaLabel: 'Contact Manake',
    ctaHref: '/contact',
    cards: mediaGallery,
  },
  {
    slug: 'trust',
    navLabel: 'Trust',
    eyebrow: 'Why families trust Manake',
    title: 'Transparent, professional, family-centred care.',
    intro: 'Families need support that is confidential, accountable, locally grounded, and connected to long-term recovery.',
    image: '/images/manake/awards.jpg',
    cards: [
      { title: 'Qualified staff', copy: 'Support combines therapeutic care, practical guidance, and structured referral pathways.' },
      { title: 'Registered facility', copy: 'Families need a centre that feels accountable, grounded, and professionally run.' },
      { title: 'Complete confidentiality', copy: 'Every first step is handled with care and privacy.' },
      { title: 'Community partners', copy: 'Recovery is strengthened by churches, schools, families, and local organisations.' },
    ],
  },
  {
    slug: 'faq',
    navLabel: 'FAQ',
    eyebrow: 'Frequently asked questions',
    title: 'Answers for families and young people.',
    intro: 'These answers cover the first questions families commonly ask before reaching out.',
    image: '/images/manake/gallery/manake-photo-17.jpeg',
    ctaLabel: 'Ask a Question',
    ctaHref: '/contact',
    faqs: faqCards,
  },
  {
    slug: 'testimonials',
    navLabel: 'Testimonials',
    eyebrow: 'What people say',
    title: 'Words from families, graduates, and supporters.',
    intro: 'These testimonials show the human impact of patient, practical, family-centred recovery work.',
    image: '/images/manake/gallery/manake-photo-20.jpeg',
    cards: [
      { title: 'Mrs. Moyo', copy: "Manake saved my son's life. The team truly cares about each individual and their family.", meta: 'Parent of Graduate' },
      { title: 'Tendai M.', copy: 'I thought my life was over at 19. Manake showed me there is always a way back.', meta: 'Graduate' },
      { title: 'Chipo N.', copy: 'The life skills training changed everything. I did not just recover, I discovered purpose.', meta: 'Graduate and Mentor' },
    ],
  },
  {
    slug: 'get-help',
    navLabel: 'Get Help',
    eyebrow: 'Get support',
    title: 'Send a clear first message to the Manake team.',
    intro: 'Use this route for family referrals, self-referrals, school referrals, partner enquiries, and urgent support requests.',
    image: '/images/manake/outreach-hero.jpg',
    imagePosition: '52% 45%',
    ctaLabel: 'WhatsApp Referral',
    ctaHref: 'https://wa.me/263775772277?text=Hello%20Manake%2C%20I%20would%20like%20support',
    secondaryLabel: 'Call Helpline',
    secondaryHref: 'tel:+263775772277',
    cards: [
      { title: 'Family referral', copy: 'Share who needs help, the urgency, and the safest callback number.' },
      { title: 'Self-referral', copy: 'You can ask for help directly and keep the first message simple.' },
      { title: 'School or community referral', copy: 'Partners can connect at-risk young people to support early.' },
      { title: 'Donor or partner enquiry', copy: 'Supporters can ask about programmes, needs, and sponsorship routes.' },
    ],
  },
  {
    slug: 'donate',
    navLabel: 'Donate',
    eyebrow: 'Donate now',
    title: 'Support recovery work.',
    intro: 'Donations support care packs, transport help, programme needs, aftercare, and practical reintegration.',
    image: '/images/products/shoes.jpeg',
    ctaLabel: 'Pledge Support',
    ctaHref: 'mailto:info@manake.org.zw?subject=Donation%20pledge%20for%20Manake',
    cards: [
      { title: '$25', copy: 'Help with small essentials and care-pack needs.' },
      { title: '$50', copy: 'Support a family follow-up or transport need.' },
      { title: '$100', copy: 'Contribute to counselling, aftercare, and support materials.' },
      { title: '$250', copy: 'Sponsor a larger recovery or reintegration need.' },
    ],
  },
  {
    slug: 'account',
    navLabel: 'Account',
    eyebrow: 'Member access',
    title: 'Login and sign up flows are ready for backend connection.',
    intro: 'The account pages are prepared for Neon-backed users, authentication, messages, social posts, and profile data.',
    image: '/images/manake/gallery/manake-photo-05.jpeg',
    ctaLabel: 'Log In',
    ctaHref: '/auth/login',
    secondaryLabel: 'Sign Up',
    secondaryHref: '/auth/signup',
    cards: [
      { title: 'User profiles', copy: 'Prepared for email, phone, profile, mentor, and recovery fields.' },
      { title: 'Private messages', copy: 'Prepared for conversations, message status, and safe support workflows.' },
      { title: 'Social content', copy: 'Prepared for posts, likes, comments, groups, and stories.' },
    ],
  },
  {
    slug: 'contact',
    navLabel: 'Contact',
    eyebrow: 'Contact',
    title: 'Need immediate help?',
    intro: 'The helpline is available for emergencies. Use direct, private contact for urgent situations and referrals.',
    image: '/images/manake/founder-event.jpg',
    ctaLabel: 'Call Helpline',
    ctaHref: 'tel:+263775772277',
    secondaryLabel: 'WhatsApp Support',
    secondaryHref: 'https://wa.me/263775772277?text=Hello%20Manake%2C%20I%20need%20support',
    cards: [
      { title: 'Phone', copy: '+263 77 577 2277' },
      { title: 'Email', copy: 'info@manake.org.zw' },
      { title: 'Location', copy: 'Norton, Mashonaland West, Zimbabwe' },
      { title: 'Opening hours', copy: 'Available 24/7 for emergencies' },
    ],
  },
  {
    slug: 'discover',
    navLabel: 'Discover',
    eyebrow: 'Suggested for you',
    title: 'Keep exploring the Manake community.',
    intro: 'Discover stories, media, programmes, donation routes, and support options from one place.',
    image: '/images/manake/gallery/manake-photo-04.jpeg',
    ctaLabel: 'View Stories',
    ctaHref: '/stories',
    cards: [
      { title: "Maria's Recovery", copy: 'Featured story and recovery pathway.', image: '/images/products/shoesmanake.jpeg' },
      { title: 'Community Garden', copy: 'Programme and practical skills update.', image: '/images/team/team.jpeg' },
      { title: 'Emergency Fund', copy: 'Urgent support need for recovery work.', image: '/images/manake/center-exterior.jpg' },
      { title: 'Youth Support', copy: 'Popular community support pathway.', image: '/images/team/manake.jpeg' },
    ],
  },
]

export const primarySectionNav = [
  { label: 'Stories', href: '/stories' },
  { label: 'Programs', href: '/programs' },
  { label: 'Media', href: '/media' },
  { label: 'Products', href: '/products' },
  { label: 'Team', href: '/team' },
  { label: 'Social', href: '/social' },
  { label: 'Messaging', href: '/messaging' },
  { label: 'Get Help', href: '/get-help' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function getSectionPage(slug: string) {
  return sectionPages.find((page) => page.slug === slug)
}
