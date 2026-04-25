import { FormEvent, useMemo, useState } from 'react'

type Story = {
  title: string
  tags: string[]
  copy: string
  author: string
  readTime: string
  image: string
  views: number
  shares: number
}

type Program = {
  title: string
  copy: string
  features: string[]
  image: string
  accent: string
}

type Product = {
  title: string
  copy: string
  price: string
  image: string
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
}

type HelpForm = {
  name: string
  phone: string
  supportType: string
  urgency: string
  message: string
}

const phoneDisplay = '+263 77 577 2277'
const phoneHref = '+263775772277'
const email = 'info@manake.org.zw'
const location = 'Norton, Mashonaland West, Zimbabwe'
const whatsappBase = `https://wa.me/${phoneHref.replace('+', '')}`

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Stories', href: '#stories' },
  { label: 'Programs', href: '#programs' },
  { label: 'Products', href: '#products' },
  { label: 'Team', href: '#team' },
  { label: 'Social', href: '#social' },
  { label: 'Messaging', href: '#messaging' },
  { label: 'Get Help', href: '#get-help' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

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
    copy: 'Call or WhatsApp the helpline. We listen first and keep the conversation private.',
  },
  {
    step: '02',
    title: 'Assessment',
    copy: 'The team considers safety, substance use, mental health, family context, and practical needs.',
  },
  {
    step: '03',
    title: 'Personalised plan',
    copy: 'Counselling, family support, peer groups, life skills, and relapse prevention are shaped around the person.',
  },
  {
    step: '04',
    title: 'Begin recovery',
    copy: 'The young person enters a rhythm of care, accountability, community, and ongoing follow-up.',
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
    views: 1250,
    shares: 156,
  },
  {
    title: "From Despair to Hope: Tendai's Journey",
    tags: ['Recovery', 'Employment'],
    copy: "At 19, Tendai thought his life was over. Today, he is rebuilding trust, working as an electrician, and mentoring younger people.",
    author: 'Tendai M.',
    readTime: '5 min read',
    image: '/images/manake/graduation-ceremony-01.jpg',
    views: 234,
    shares: 45,
  },
  {
    title: 'Finding Purpose Through Life Skills Training',
    tags: ['Life Skills', 'Employment'],
    copy: 'Chipo discovered a passion for cooking during life skills training and now mentors other young women in recovery.',
    author: 'Chipo N.',
    readTime: '4 min read',
    image: '/images/manake/community-children.jpg',
    views: 189,
    shares: 32,
  },
  {
    title: 'Rebuilding Family Bonds After Addiction',
    tags: ['Family', 'Recovery'],
    copy: "Through family counselling, Tatenda learned how to rebuild trust and speak honestly with the people closest to him.",
    author: 'Tatenda K.',
    readTime: '6 min read',
    image: '/images/manake/professional-support.jpg',
    views: 312,
    shares: 67,
  },
  {
    title: 'Back to School: Second Chances',
    tags: ['Education', 'Recovery'],
    copy: 'Nyasha returned to school after treatment and is planning a future in nursing.',
    author: 'Nyasha R.',
    readTime: '5 min read',
    image: '/images/manake/cultural-youth.jpg',
    views: 456,
    shares: 89,
  },
  {
    title: 'Community Leader: Giving Back',
    tags: ['Community', 'Leadership'],
    copy: 'Farai now helps outreach teams identify at-risk youth earlier and connect them to help.',
    author: 'Farai C.',
    readTime: '7 min read',
    image: '/images/manake/outreach-booth.jpg',
    views: 278,
    shares: 56,
  },
]

const programs: Program[] = [
  {
    title: 'Detox support',
    copy: 'Stabilisation support with medical referral pathways, safety planning, and comfort-focused care.',
    features: ['24/7 response', 'Safety planning', 'Clinical referral'],
    image: '/images/manake/recovery-risk-room.jpg',
    accent: 'Rose',
  },
  {
    title: 'Counselling',
    copy: 'Individual, group, and family sessions that help young people process triggers and rebuild trust.',
    features: ['One-to-one therapy', 'Group sessions', 'Family meetings'],
    image: '/images/manake/professional-support.jpg',
    accent: 'Lavender',
  },
  {
    title: 'Residential care',
    copy: 'A stable recovery environment with daily rhythm, peer support, and supervised routines.',
    features: ['Structured days', 'Recovery groups', 'Wellbeing routines'],
    image: '/images/manake/recovery-circle.jpg',
    accent: 'Blue',
  },
  {
    title: 'Life skills',
    copy: 'Practical training for confidence, work readiness, healthy relationships, and independent living.',
    features: ['Mentorship', 'Financial basics', 'Work readiness'],
    image: '/images/manake/team-group-community.jpg',
    accent: 'Peach',
  },
  {
    title: 'Relapse prevention',
    copy: 'Aftercare planning, coping strategies, and support circles for long-term recovery.',
    features: ['Aftercare plan', 'Check-ins', 'Support network'],
    image: '/images/manake/green-field-hand.jpg',
    accent: 'Mauve',
  },
  {
    title: 'Community outreach',
    copy: 'Prevention and early intervention for schools, families, churches, and local partners.',
    features: ['Awareness sessions', 'Referral guidance', 'Partner briefings'],
    image: '/images/manake/outreach-hero.jpg',
    accent: 'Terracotta',
  },
]

const products: Product[] = [
  {
    title: 'Recovery support sandals',
    copy: 'Community-made footwear supporting skills training and reintegration activities.',
    price: 'Enquire',
    image: '/images/manake/product-sandal.jpg',
  },
  {
    title: 'Work-ready boots',
    copy: 'Durable boots connected to vocational training and youth enterprise support.',
    price: 'Enquire',
    image: '/images/manake/product-boot.jpg',
  },
]

const team: Person[] = [
  {
    name: 'Sibongile Maonde Sokhani',
    role: 'Founder and Visionary',
    copy: "Manake was born out of a mother's heart and a community's need to restore dignity and purpose.",
    image: '/images/manake/professional-team.jpg',
  },
  {
    name: 'Care Team',
    role: 'Counselling and Recovery Support',
    copy: 'A multidisciplinary team focused on safety, family support, structured care, and aftercare.',
    image: '/images/manake/team-group.jpg',
  },
  {
    name: 'Community Partners',
    role: 'Outreach and Reintegration',
    copy: 'Local partners help young people reconnect to school, work, service, and community life.',
    image: '/images/manake/team-group-candid.jpg',
  },
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
    quote: "The life skills training was a turning point. I did not just recover, I discovered purpose.",
    author: 'Chipo N.',
    role: 'Graduate and Mentor',
  },
]

const faqs = [
  {
    q: 'Is treatment confidential?',
    a: 'Yes. Personal information is treated privately and shared only with explicit consent or where safety requires urgent action.',
  },
  {
    q: 'Can parents contact you first?',
    a: 'Yes. Families can speak with Manake before a young person is ready to begin formal support.',
  },
  {
    q: 'How long does recovery take?',
    a: 'Recovery is a continuing process. The right plan depends on safety, substance use patterns, family context, and aftercare needs.',
  },
  {
    q: 'Do you support relapse prevention?',
    a: 'Yes. Relapse prevention, coping strategies, aftercare, and community support are central to the recovery pathway.',
  },
]

const suggestions = [
  { title: "Maria's Recovery", label: 'Featured Story', image: '/images/manake/graduation-ceremony-02.jpg' },
  { title: 'Community Garden', label: 'New Program', image: '/images/manake/green-field-01.jpg' },
  { title: 'Emergency Fund', label: 'Urgent Need', image: '/images/manake/street-support.jpg' },
  { title: 'Youth Support', label: 'Popular', image: '/images/manake/cultural-dance.jpg' },
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

function App() {
  const [helpForm, setHelpForm] = useState<HelpForm>(initialHelpForm)
  const [donation, setDonation] = useState('50')
  const [customDonation, setCustomDonation] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [postText, setPostText] = useState('')
  const [posts, setPosts] = useState([
    'Today I am grateful for a second chance and people who keep showing up.',
    'Family meeting went well. Small steps, honest words, better days.',
  ])
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'team', text: 'Welcome. Tell us what kind of support you need and we will guide the next step.' },
    { id: 2, from: 'visitor', text: 'I need help for a family member.' },
    { id: 3, from: 'team', text: 'Thank you for reaching out. Is this urgent today?' },
  ])
  const [messageDraft, setMessageDraft] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authNotice, setAuthNotice] = useState('')

  const whatsappUrl = useMemo(() => buildWhatsAppUrl(helpForm), [helpForm])
  const donationValue = customDonation || donation

  function updateHelpForm(field: keyof HelpForm, value: string) {
    setHelpForm((current) => ({ ...current, [field]: value }))
  }

  function handleHelpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  async function shareStory(story: Story) {
    const url = `${window.location.origin}${window.location.pathname}#stories`
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
    if (!postText.trim()) return
    setPosts((current) => [postText.trim(), ...current])
    setPostText('')
  }

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = messageDraft.trim()
    if (!text) return
    setMessages((current) => [
      ...current,
      { id: Date.now(), from: 'visitor', text },
      { id: Date.now() + 1, from: 'team', text: 'Thanks. A support worker would pick this up and continue privately.' },
    ])
    setMessageDraft('')
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthNotice(`${authMode === 'login' ? 'Login' : 'Sign up'} demo submitted. Connect this form to the backend when credentials are ready.`)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="Manake home">
          <span className="brand-mark">M</span>
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
          <a className="quiet-link" href="#auth" onClick={() => setAuthMode('login')}>
            Login
          </a>
          <a className="quiet-link" href="#auth" onClick={() => setAuthMode('signup')}>
            Sign Up
          </a>
          <a className="button button-primary button-small" href="#donate">
            Donate Now
          </a>
          <details className="more-menu">
            <summary>More</summary>
            <div>
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
              <a href="#auth" onClick={() => setAuthMode('login')}>
                Login
              </a>
              <a href="#auth" onClick={() => setAuthMode('signup')}>
                Sign Up
              </a>
            </div>
          </details>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">Zimbabwe's premier youth rehabilitation center</p>
            <h1>A safe path to recovery for young people in Zimbabwe.</h1>
            <p>
              Professional rehabilitation programs, life skills training, and ongoing support
              to help young people rebuild their lives with dignity and purpose.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#get-help">
                Get Help Today
              </a>
              <a className="button button-secondary" href="#contact">
                Refer Someone
              </a>
            </div>
            <div className="contact-row">
              <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>
              <a href={`${whatsappBase}?text=Hello%20Manake%2C%20I%20need%20help`} target="_blank" rel="noreferrer">
                WhatsApp Support
              </a>
            </div>
          </div>

          <div className="hero-panel" aria-label="Impact highlights">
            {impactStats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
                <small>{stat.note}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="founder-section section" id="about">
          <div className="founder-photo">
            <img src="/images/manake/professional-team.jpg" alt="Sibongile Maonde Sokhani and the Manake team" />
            <div>
              <strong>Sibongile Maonde Sokhani</strong>
              <span>Founder and Visionary</span>
            </div>
          </div>
          <div className="founder-copy">
            <p className="eyebrow">Founder's message</p>
            <h2>"They are not just numbers. They are our future."</h2>
            <p>
              Manake was born out of a mother's heart and a community's need. Addiction is
              not a moral failing; it is a battle for the soul of our youth.
            </p>
            <p>
              Our mission is to restore dignity, reignite purpose, and rebuild families.
              When you walk through our doors, you are not a case. You are family.
            </p>
            <div className="mini-stats">
              <span><strong>2019</strong> Established</span>
              <span><strong>500+</strong> Lives touched</span>
              <span><strong>100%</strong> Commitment</span>
            </div>
          </div>
        </section>

        <section className="crisis-card">
          <div>
            <p className="eyebrow">In crisis? We are here for you</p>
            <h2>24/7 confidential support available.</h2>
            <p>You are not alone. Reach out now for a private first step.</p>
          </div>
          <div className="split-actions">
            <a className="button button-danger" href={`tel:${phoneHref}`}>
              Call Now
            </a>
            <a className="button button-light" href={`${whatsappBase}?text=Hello%20Manake%2C%20I%20need%20urgent%20support`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </section>

        <section className="section" id="admission">
          <div className="section-heading center">
            <p className="eyebrow">How admission works</p>
            <h2>Getting help is simple.</h2>
            <p>We guide families and young people through each step with compassion and confidentiality.</p>
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

        <section className="story-feature section" id="stories">
          <div className="feature-image">
            <img src="/images/manake/graduation-ceremony-01.jpg" alt="Tendai's transformation story" />
          </div>
          <div className="feature-copy">
            <p className="eyebrow">Real stories of transformation</p>
            <h2>"Manake did not just help me recover. They helped me find my purpose."</h2>
            <p>
              Every story is a testament to hope, support, second chances, and the power of a
              community that refuses to give up.
            </p>
            <a className="text-link" href="#story-grid">
              Read more success stories
            </a>
          </div>
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
                <img src={story.image} alt={story.title} />
                <div className="tag-row">
                  {story.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <h3>{story.title}</h3>
                <p>{story.copy}</p>
                <footer>
                  <span>{story.author}</span>
                  <span>{story.readTime}</span>
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
            <p>Manake meets people where they are and helps them build a brighter future.</p>
          </div>
          <div className="program-grid">
            {programs.map((program) => (
              <article className="program-card" key={program.title}>
                <img src={program.image} alt="" />
                <div>
                  <span>{program.accent}</span>
                  <h3>{program.title}</h3>
                  <p>{program.copy}</p>
                  <ul>
                    {program.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section products-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Products</p>
              <h2>Skills training with a path back into work.</h2>
            </div>
            <p>
              Product enquiries can support vocational activities and give graduates a practical
              route toward confidence and income.
            </p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.title}>
                <img src={product.image} alt={product.title} />
                <div>
                  <h3>{product.title}</h3>
                  <p>{product.copy}</p>
                  <a href="#contact">{product.price}</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section team-section" id="team">
          <div className="section-heading center">
            <p className="eyebrow">Team</p>
            <h2>Professional care with a human face.</h2>
            <p>Families need competence, privacy, warmth, and people who can stay steady.</p>
          </div>
          <div className="team-grid">
            {team.map((person) => (
              <article className="team-card" key={person.name}>
                <img src={person.image} alt={person.name} />
                <h3>{person.name}</h3>
                <strong>{person.role}</strong>
                <p>{person.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="interactive-grid section">
          <div className="social-panel" id="social">
            <p className="eyebrow">Social</p>
            <h2>Share story</h2>
            <form onSubmit={handlePostSubmit}>
              <textarea value={postText} onChange={(event) => setPostText(event.target.value)} placeholder="Share a recovery win, gratitude note, or encouragement..." rows={4} />
              <button className="button button-primary" type="submit">Post update</button>
            </form>
            <div className="post-list">
              {posts.map((post, index) => (
                <article key={`${post}-${index}`}>
                  <strong>Community update</strong>
                  <p>{post}</p>
                  <small>Like  Comment  Share</small>
                </article>
              ))}
            </div>
          </div>

          <div className="message-panel" id="messaging">
            <p className="eyebrow">Messaging</p>
            <h2>Confidential support chat</h2>
            <div className="chat-window">
              {messages.map((message) => (
                <p className={message.from === 'visitor' ? 'bubble visitor' : 'bubble'} key={message.id}>
                  {message.text}
                </p>
              ))}
            </div>
            <form className="chat-form" onSubmit={handleMessageSubmit}>
              <input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Type a private message..." />
              <button className="button button-primary" type="submit">Send</button>
            </form>
          </div>
        </section>

        <section className="section trust-section">
          <div className="section-heading center">
            <p className="eyebrow">Why families trust Manake</p>
            <h2>Transparent, professional, family-centered care.</h2>
          </div>
          <div className="trust-grid">
            {['Qualified staff', 'Registered facility', 'Complete confidentiality', 'Community partners', 'Proven support', 'Family-centered'].map((item) => (
              <article key={item}>
                <strong>{item}</strong>
                <p>Care is designed to be clear, respectful, and focused on long-term recovery.</p>
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
                <span className="quote-mark">"</span>
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
              <input value={helpForm.name} onChange={(event) => updateHelpForm('name', event.target.value)} placeholder="Your name" />
              <input value={helpForm.phone} onChange={(event) => updateHelpForm('phone', event.target.value)} placeholder="Phone number" />
              <select value={helpForm.supportType} onChange={(event) => updateHelpForm('supportType', event.target.value)}>
                <option>Family referral</option>
                <option>I need help for myself</option>
                <option>School or community referral</option>
                <option>Partner or donor enquiry</option>
              </select>
              <select value={helpForm.urgency} onChange={(event) => updateHelpForm('urgency', event.target.value)}>
                <option>Today</option>
                <option>This week</option>
                <option>Planning ahead</option>
                <option>General information</option>
              </select>
              <textarea value={helpForm.message} onChange={(event) => updateHelpForm('message', event.target.value)} placeholder="What kind of support is needed?" rows={4} />
              <button className="button button-primary" type="submit">Open WhatsApp referral</button>
            </form>
          </div>

          <div className="donate-card" id="donate">
            <p className="eyebrow">Donate now</p>
            <h2>Support recovery work.</h2>
            <div className="amount-grid">
              {['25', '50', '100', '250'].map((amount) => (
                <button className={donation === amount && !customDonation ? 'selected' : ''} key={amount} type="button" onClick={() => { setDonation(amount); setCustomDonation('') }}>
                  ${amount}
                </button>
              ))}
            </div>
            <input value={customDonation} onChange={(event) => setCustomDonation(event.target.value)} placeholder="Custom amount" inputMode="decimal" />
            <a className="button button-primary" href={`mailto:${email}?subject=Donation%20pledge%20for%20Manake&body=Hello%20Manake%2C%20I%20would%20like%20to%20pledge%20${encodeURIComponent(donationValue)}.`}>
              Pledge {donationValue ? `$${donationValue}` : 'support'}
            </a>
          </div>

          <div className="auth-card" id="auth">
            <div className="auth-tabs">
              <button className={authMode === 'login' ? 'active' : ''} type="button" onClick={() => setAuthMode('login')}>Login</button>
              <button className={authMode === 'signup' ? 'active' : ''} type="button" onClick={() => setAuthMode('signup')}>Sign Up</button>
            </div>
            <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' ? <input placeholder="Full name" autoComplete="name" /> : null}
              <input placeholder="Email address" autoComplete="email" />
              <input placeholder="Password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} />
              <button className="button button-primary" type="submit">{authMode === 'login' ? 'Log in' : 'Sign up'}</button>
            </form>
            {authNotice ? <p className="notice">{authNotice}</p> : null}
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Need immediate help?</h2>
            <p>Our helpline is available 24/7 for emergencies.</p>
          </div>
          <address>
            <strong>{location}</strong>
            <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>
            <a href={`mailto:${email}`}>{email}</a>
          </address>
        </section>
      </main>

      <aside className="suggestions" aria-label="Suggested for you">
        <div>
          <strong>Suggested for you</strong>
          <a href="#stories">See All</a>
        </div>
        {suggestions.map((item) => (
          <article key={item.title}>
            <img src={item.image} alt="" />
            <span>{item.title}</span>
            <small>{item.label}</small>
            <button type="button">Follow</button>
          </article>
        ))}
      </aside>

      <footer className="site-footer">
        <div>
          <strong>Manake Rehabilitation Center</strong>
          <span>Youth recovery, family support, and community reintegration.</span>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#about">About</a>
          <a href="#get-help">Help</a>
          <a href="#contact">Contact</a>
          <a href="#auth">Privacy</a>
          <a href="#auth">Terms</a>
        </nav>
        <small>© 2026 Manake Rehabilitation Center</small>
      </footer>
    </div>
  )
}

export default App
