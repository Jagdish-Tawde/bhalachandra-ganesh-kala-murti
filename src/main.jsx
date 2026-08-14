import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  Boxes,
  Camera,
  CheckCircle2,
  Heart,
  Home,
  ImagePlus,
  LayoutDashboard,
  Menu,
  MessageCircle,
  PackagePlus,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  X,
} from 'lucide-react';
import './styles.css';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const initialMurtis = [
  {
    id: 'GM-102',
    name: 'Dagdu Sheth Ganpati',
    category: 'Dagdu Sheth',
    height: '2.5 ft',
    material: 'Shadu Mati',
    price: 15000,
    status: 'Available',
    featured: true,
    description: 'Beautifully handcrafted Dagdu Sheth Ganpati Murti with premium finishing and natural colors.',
    image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'GM-118',
    name: 'Lalbaugcha Raja',
    category: 'Lalbaug Style',
    height: '3.0 ft',
    material: 'Shadu Mati',
    price: 22000,
    status: 'Reserved',
    featured: true,
    description: 'Royal Lalbaug style murti with detailed ornaments and expressive finishing.',
    image: 'https://images.unsplash.com/photo-1567591414240-e9c1e59f3e06?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'GM-076',
    name: 'Moraya Ganpati',
    category: 'Traditional',
    height: '2.0 ft',
    material: 'Eco Friendly',
    price: 12500,
    status: 'Available',
    featured: false,
    description: 'Traditional home Ganpati idol made with eco-friendly materials.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'GM-045',
    name: 'Bal Ganesh',
    category: 'Bal Ganesh',
    height: '1.5 ft',
    material: 'Eco Friendly',
    price: 8000,
    status: 'Available',
    featured: true,
    description: 'Compact Bal Ganesh murti for home pooja and smaller mandaps.',
    image: 'https://images.unsplash.com/photo-1630317376392-29b8636e6366?auto=format&fit=crop&w=900&q=80',
  },
];

const categories = ['All', 'Traditional', 'Eco Friendly', 'Dagdu Sheth', 'Lalbaug Style', 'Bal Ganesh'];
const availabilityOptions = ['Available', 'Booked', 'Reserved', 'Sold', 'Hidden'];
const defaultSettings = {
  shopName: 'Bhalachandra Ganesh Kala Murti',
  whatsappNumber: '+91 89752 17511',
  defaultVisibility: 'Available',
  festivalSeasonMode: 'On',
};

function fromSupabaseMurti(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    height: row.height || '',
    material: row.material || '',
    price: Number(row.price || 0),
    status: row.status || 'Available',
    featured: Boolean(row.featured),
    description: row.description || '',
    image: row.image_url || '',
  };
}

function murtiDisplayCode(id) {
  if (!id) return 'GM';
  if (String(id).startsWith('GM-')) return id;
  return `GM-${String(id).replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

function fromSupabaseSettings(row) {
  if (!row) return defaultSettings;

  return {
    shopName: row.shop_name || defaultSettings.shopName,
    whatsappNumber: row.whatsapp_number || defaultSettings.whatsappNumber,
    defaultVisibility: row.default_visibility || defaultSettings.defaultVisibility,
    festivalSeasonMode: row.festival_season_mode || defaultSettings.festivalSeasonMode,
  };
}

function toSupabaseSettings(settings) {
  return {
    id: 'main',
    shop_name: settings.shopName,
    whatsapp_number: settings.whatsappNumber,
    default_visibility: settings.defaultVisibility,
    festival_season_mode: settings.festivalSeasonMode,
    updated_at: new Date().toISOString(),
  };
}

function fromSupabaseInquiry(row) {
  return {
    id: row.id,
    murtiId: row.murti_id,
    murtiName: row.murtis?.name || 'General inquiry',
    customerName: row.customer_name || 'Customer',
    phone: row.phone || '',
    message: row.message || '',
    source: row.source || 'Website',
    status: row.status || 'New',
    createdAt: row.created_at,
  };
}

function normalizePhoneNumber(value) {
  return value.replace(/[^\d]/g, '');
}

function whatsappLink(number, message = '') {
  const phone = normalizePhoneNumber(number);
  if (!phone) return '#';
  const text = message ? `&text=${encodeURIComponent(message)}` : '';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isMobile
    ? `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
    : `https://web.whatsapp.com/send?phone=${phone}${text}`;
}

function latestSettings(currentSettings) {
  const saved = localStorage.getItem('ganpati-site-settings');
  const current = saved ? { ...currentSettings, ...JSON.parse(saved) } : currentSettings;
  return normalizePhoneNumber(current.whatsappNumber)
    ? current
    : { ...current, whatsappNumber: defaultSettings.whatsappNumber };
}

function openWhatsApp(event, settings, murtiName = '') {
  event.preventDefault();
  const current = latestSettings(settings);
  const phone = normalizePhoneNumber(current.whatsappNumber);

  if (!phone) {
    alert('Please add WhatsApp number in Admin Settings first.');
    window.location.hash = 'admin';
    return;
  }

  window.open(whatsappLink(phone, inquiryMessage(current, murtiName)), '_blank', 'noopener,noreferrer');
}

function inquiryMessage(settings, murtiName) {
  const subject = murtiName ? ` about ${murtiName}` : '';
  return `Hi, I would like to inquire${subject} from ${settings.shopName}.`;
}

function compressImage(file, maxSize = 1400, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error('Could not read image file.'));

    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    image.onerror = () => reject(new Error('Could not load image for compression.'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(dataUrl, fileName) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let index = 0; index < bytes.length; index += 1) {
    array[index] = bytes.charCodeAt(index);
  }

  return new File([array], fileName, { type: mime });
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function uploadMurtiImage(dataUrl) {
  if (!hasSupabaseConfig || !dataUrl?.startsWith('data:image')) return dataUrl;

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const file = dataUrlToFile(dataUrl, fileName);
  const { error } = await supabase.storage
    .from('murti-images')
    .upload(fileName, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('murti-images').getPublicUrl(fileName);
  return data.publicUrl;
}

function currency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function useMurtiStore() {
  const [murtis, setMurtis] = useState(() => {
    const saved = localStorage.getItem('ganpati-murtis');
    return saved ? JSON.parse(saved) : initialMurtis;
  });

  const saveMurtis = (next) => {
    setMurtis(next);
    localStorage.setItem('ganpati-murtis', JSON.stringify(next));
    window.dispatchEvent(new Event('ganpati-murtis-updated'));
  };

  useEffect(() => {
    const loadSupabaseMurtis = async () => {
      if (!hasSupabaseConfig) return;

      const { data, error } = await supabase
        .from('murtis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Could not load murtis from Supabase:', error.message);
        return;
      }

      if (data?.length) {
        setMurtis(data.map(fromSupabaseMurti));
      }
    };

    loadSupabaseMurtis();
  }, []);

  useEffect(() => {
    const syncMurtis = () => {
      const saved = localStorage.getItem('ganpati-murtis');
      setMurtis(saved ? JSON.parse(saved) : initialMurtis);
    };

    window.addEventListener('storage', syncMurtis);
    window.addEventListener('ganpati-murtis-updated', syncMurtis);

    return () => {
      window.removeEventListener('storage', syncMurtis);
      window.removeEventListener('ganpati-murtis-updated', syncMurtis);
    };
  }, []);

  return { murtis, saveMurtis };
}

function useSiteSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ganpati-site-settings');
    const parsed = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    if (parsed.whatsappNumber === '+91 99999 99999' || !normalizePhoneNumber(parsed.whatsappNumber)) {
      return { ...parsed, whatsappNumber: defaultSettings.whatsappNumber };
    }
    return parsed;
  });

  const saveSettings = (next) => {
    setSettings(next);
    localStorage.setItem('ganpati-site-settings', JSON.stringify(next));
    document.title = next.shopName;
    window.dispatchEvent(new Event('ganpati-settings-updated'));

    if (hasSupabaseConfig) {
      supabase
        .from('site_settings')
        .upsert(toSupabaseSettings(next), { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('Could not save settings to Supabase:', error.message);
        });
    }
  };

  useEffect(() => {
    document.title = settings.shopName;
  }, [settings.shopName]);

  useEffect(() => {
    const loadSupabaseSettings = async () => {
      if (!hasSupabaseConfig) return;

      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (error) {
        console.error('Could not load settings from Supabase:', error.message);
        return;
      }

      setSettings(fromSupabaseSettings(data));
    };

    loadSupabaseSettings();
  }, []);

  useEffect(() => {
    const syncSettings = () => {
      const saved = localStorage.getItem('ganpati-site-settings');
      if (!saved) return;
      const parsed = { ...defaultSettings, ...JSON.parse(saved) };
      setSettings(normalizePhoneNumber(parsed.whatsappNumber) ? parsed : { ...parsed, whatsappNumber: defaultSettings.whatsappNumber });
    };

    window.addEventListener('storage', syncSettings);
    window.addEventListener('ganpati-settings-updated', syncSettings);

    return () => {
      window.removeEventListener('storage', syncSettings);
      window.removeEventListener('ganpati-settings-updated', syncSettings);
    };
  }, []);

  return { settings, saveSettings };
}

function useInquiriesStore() {
  const [inquiries, setInquiries] = useState([]);

  const loadInquiries = async () => {
    if (!hasSupabaseConfig) return;

    const { data, error } = await supabase
      .from('inquiries')
      .select('*, murtis(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load inquiries from Supabase:', error.message);
      return;
    }

    setInquiries((data || []).map(fromSupabaseInquiry));
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const addInquiry = async ({ murtiId, customerName, phone, message }) => {
    const nextInquiry = {
      murti_id: isUuid(murtiId) ? murtiId : null,
      customer_name: customerName,
      phone,
      message,
      source: 'Website',
      status: 'New',
    };

    if (hasSupabaseConfig) {
      const { error } = await supabase.from('inquiries').insert(nextInquiry);
      if (error) throw error;
      await loadInquiries();
      return;
    }

    setInquiries((current) => [
      fromSupabaseInquiry({
        ...nextInquiry,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        murtis: { name: 'Local inquiry' },
      }),
      ...current,
    ]);
  };

  return { inquiries, addInquiry, loadInquiries };
}

function App() {
  const { murtis, saveMurtis } = useMurtiStore();
  const { settings, saveSettings } = useSiteSettings();
  const { inquiries, addInquiry } = useInquiriesStore();
  const [view, setView] = useState(() => (window.location.hash === '#admin' ? 'admin' : 'home'));
  const [selected, setSelected] = useState(murtis[0]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === '#admin' ? 'admin' : 'home');
      setMobileMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const filtered = useMemo(() => {
    return murtis.filter((murti) => {
      const matchesCategory = category === 'All' || murti.category === category;
      const matchesQuery = murti.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery && murti.status !== 'Hidden';
    });
  }, [murtis, query, category]);

  const openDetail = (murti) => {
    setSelected(murti);
    setView('detail');
    setMobileMenuOpen(false);
  };

  return (
    <div className="app">
      {view !== 'admin' && (
        <Header
          settings={settings}
          view={view}
          setView={setView}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}
      {view === 'home' && (
        <PublicHome
          murtis={filtered}
          allMurtis={murtis}
          settings={settings}
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          openDetail={openDetail}
        />
      )}
      {view === 'detail' && <MurtiDetail murti={selected} setView={setView} settings={settings} addInquiry={addInquiry} />}
      {view === 'admin' && <AdminPanel murtis={murtis} saveMurtis={saveMurtis} settings={settings} saveSettings={saveSettings} inquiries={inquiries} />}
    </div>
  );
}

function Header({ settings, view, setView, mobileMenuOpen, setMobileMenuOpen }) {
  const go = (next) => {
    if (window.location.hash === '#admin') {
      window.history.pushState('', document.title, window.location.pathname);
    }
    setView(next);
    setMobileMenuOpen(false);
  };

  const goToSection = (sectionId) => {
    go('home');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (sectionId === 'collection') {
        document.getElementById('murti-search')?.focus();
      }
    }, 60);
  };

  return (
    <header className="site-header">
      <button className="brand" onClick={() => go('home')} aria-label="Open homepage">
        <img className="brand-logo" src="/assets/bhalachandra-logo.png" alt="" />
        <span>
          <strong>{settings.shopName}</strong>
          <small>Ganpati Murti Collection</small>
        </span>
      </button>
      <nav className={mobileMenuOpen ? 'nav open' : 'nav'}>
        <button className={view === 'home' ? 'active' : ''} onClick={() => go('home')}>Home</button>
        <button onClick={() => goToSection('collection')}>Murtis</button>
        <button onClick={() => goToSection('categories')}>Categories</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" onClick={() => goToSection('collection')} aria-label="Search murtis">
          <Search size={18} />
        </button>
        <a className="whatsapp-button" href={whatsappLink(settings.whatsappNumber, inquiryMessage(settings))} onClick={(event) => openWhatsApp(event, settings)} target="_blank" rel="noreferrer">
          <MessageCircle size={18} />
          WhatsApp
        </a>
        <button className="menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

function PublicHome({ murtis, allMurtis, settings, query, setQuery, category, setCategory, openDetail }) {
  const festivalMode = settings.festivalSeasonMode === 'On';

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p>{settings.shopName}</p>
          <h1>{festivalMode ? 'Book Your Ganpati Murti For The Festival' : 'Beautiful Ganpati Murtis For Every Home'}</h1>
          <span>{festivalMode ? 'Festival bookings open • Limited pieces • WhatsApp enquiry available' : 'Traditional • Premium • Eco-Friendly • All sizes available'}</span>
          <div className="hero-actions">
            <a href="#collection" className="primary-button">Explore Collection</a>
            <a className="light-button" href={whatsappLink(settings.whatsappNumber, inquiryMessage(settings))} onClick={(event) => openWhatsApp(event, settings)} target="_blank" rel="noreferrer">
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <Feature icon={<ShieldCheck />} title="100% Handmade" />
        <Feature icon={<CheckCircle2 />} title="Eco Friendly" />
        <Feature icon={<Boxes />} title="Premium Quality" />
        <Feature icon={<Truck />} title="Safe Delivery" />
      </section>

      {festivalMode && (
        <section className="festival-banner">
          <strong>Festival season is active</strong>
          <span>Available murtis are prioritized. Book early to reserve your preferred murti.</span>
        </section>
      )}

      <section id="collection" className="section">
        <div className="section-heading">
          <div>
            <p>{settings.shopName}</p>
            <h2>Choose Your Ganpati Murti</h2>
          </div>
          <span>{allMurtis.length} murtis listed</span>
        </div>

        <div className="filters">
          <label className="search-field">
            <Search size={18} />
            <input id="murti-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search murtis..." />
          </label>
          <div className="chips">
            {categories.map((item) => (
              <button className={category === item ? 'selected' : ''} key={item} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="murti-grid">
          {murtis.map((murti) => (
            <MurtiCard key={murti.id} murti={murti} settings={settings} onOpen={() => openDetail(murti)} />
          ))}
        </div>
      </section>

      <section id="categories" className="section category-section">
        <div className="section-heading">
          <div>
            <p>Shop By Category</p>
            <h2>Find The Right Style</h2>
          </div>
          <span>{categories.length - 1} categories</span>
        </div>
        <div className="category-grid">
          {categories.filter((item) => item !== 'All').map((item) => {
            const count = allMurtis.filter((murti) => murti.category === item).length;
            const preview = allMurtis.find((murti) => murti.category === item) || allMurtis[0];
            return (
              <button
                className={category === item ? 'category-card selected' : 'category-card'}
                key={item}
                onClick={() => {
                  setCategory(item);
                  document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <img src={preview.image} alt={item} />
                <strong>{item}</strong>
                <span>{count} murtis</span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="feature">
      {React.cloneElement(icon, { size: 22 })}
      <span>{title}</span>
    </div>
  );
}

function MurtiCard({ murti, onOpen, settings }) {
  return (
    <article className="murti-card">
      <div className="image-wrap">
        <img src={murti.image} alt={murti.name} />
        <span className={`status ${murti.status.toLowerCase()}`}>{murti.status}</span>
        <button className="heart" aria-label="Add to favorites">
          <Heart size={18} />
        </button>
      </div>
      <div className="card-body">
        <h3>{murti.name}</h3>
        <p>{murti.height} | {murti.material}</p>
        <div className="price-row">
          <strong>{currency(murti.price)}</strong>
          <a href={whatsappLink(settings.whatsappNumber, inquiryMessage(settings, murti.name))} onClick={(event) => openWhatsApp(event, settings, murti.name)} target="_blank" rel="noreferrer" aria-label="WhatsApp enquiry">
            <MessageCircle size={20} />
          </a>
        </div>
        <button className="details-button" onClick={onOpen}>View Details</button>
      </div>
    </article>
  );
}

function MurtiDetail({ murti, setView, settings, addInquiry }) {
  const [inquiryForm, setInquiryForm] = useState({
    customerName: '',
    phone: '',
    message: '',
  });
  const [inquiryStatus, setInquiryStatus] = useState('');

  if (!murti) return null;

  const submitInquiry = async (event) => {
    event.preventDefault();
    setInquiryStatus('Saving inquiry...');

    try {
      await addInquiry({
        murtiId: murti.id,
        customerName: inquiryForm.customerName,
        phone: inquiryForm.phone,
        message: inquiryForm.message || `I would like to inquire about ${murti.name}.`,
      });

      setInquiryForm({ customerName: '', phone: '', message: '' });
      setInquiryStatus('Inquiry saved. We will contact you soon.');
    } catch (error) {
      setInquiryStatus(`Could not save inquiry: ${error.message}`);
    }
  };

  return (
    <main className="detail-page">
      <button className="back-button" onClick={() => setView('home')}>Back to collection</button>
      <section className="detail-layout">
        <div className="detail-image">
          <img src={murti.image} alt={murti.name} />
        </div>
        <div className="detail-info">
          <span className={`status ${murti.status.toLowerCase()}`}>{murti.status}</span>
          <h1>{murti.name}</h1>
          <p>{murti.description}</p>
          <div className="spec-grid">
            <Spec label="Code" value={murtiDisplayCode(murti.id)} />
            <Spec label="Height" value={murti.height} />
            <Spec label="Material" value={murti.material} />
            <Spec label="Price" value={currency(murti.price)} />
          </div>
          <a className="primary-button wide" href={whatsappLink(settings.whatsappNumber, inquiryMessage(settings, murti.name))} onClick={(event) => openWhatsApp(event, settings, murti.name)} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Enquire on WhatsApp
          </a>
          <a className="outline-button wide" href={normalizePhoneNumber(settings.whatsappNumber) ? `tel:${normalizePhoneNumber(settings.whatsappNumber)}` : '#'}>
            <Phone size={18} />
            Call Now
          </a>
          <form className="inquiry-form" onSubmit={submitInquiry}>
            <h2>Send Inquiry</h2>
            <Field label="Name">
              <input required value={inquiryForm.customerName} onChange={(event) => setInquiryForm((current) => ({ ...current, customerName: event.target.value }))} placeholder="Your name" />
            </Field>
            <Field label="Phone">
              <input required value={inquiryForm.phone} onChange={(event) => setInquiryForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Your phone number" />
            </Field>
            <Field label="Message">
              <textarea value={inquiryForm.message} onChange={(event) => setInquiryForm((current) => ({ ...current, message: event.target.value }))} placeholder={`I would like to inquire about ${murti.name}.`} />
            </Field>
            {inquiryStatus && <p className="upload-info">{inquiryStatus}</p>}
            <button className="primary-button form-submit" type="submit">Submit Inquiry</button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function AdminPanel({ murtis, saveMurtis, settings, saveSettings, inquiries }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('ganpati-admin-auth') === 'true');
  const [activePanel, setActivePanel] = useState('dashboard');
  const [adminSearch, setAdminSearch] = useState('');
  const [uploadInfo, setUploadInfo] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: 'Traditional',
    height: '',
    material: 'Shadu Mati',
    price: '',
    status: settings.defaultVisibility || 'Available',
    description: '',
    image: '',
  });

  const stats = {
    total: murtis.length,
    available: murtis.filter((item) => item.status === 'Available').length,
    booked: murtis.filter((item) => item.status === 'Booked' || item.status === 'Reserved').length,
    sold: murtis.filter((item) => item.status === 'Sold').length,
  };

  const searchedMurtis = useMemo(() => {
    const search = adminSearch.trim().toLowerCase();
    if (!search) return murtis;
    return murtis.filter((murti) => murti.name.toLowerCase().includes(search));
  }, [adminSearch, murtis]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        sessionStorage.setItem('ganpati-admin-auth', 'true');
        setIsLoggedIn(true);
      }
    });
  }, []);

  const updateMurtiStatus = async (murtiId, status) => {
    saveMurtis(murtis.map((murti) => (murti.id === murtiId ? { ...murti, status } : murti)));

    if (hasSupabaseConfig && isUuid(murtiId)) {
      const { error } = await supabase
        .from('murtis')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', murtiId);

      if (error) alert(`Could not update status in Supabase: ${error.message}`);
    }
  };

  const deleteMurti = async (murtiId) => {
    const murti = murtis.find((item) => item.id === murtiId);
    const confirmed = window.confirm(`Delete ${murti?.name || 'this murti'}? This will remove it from the public website.`);
    if (!confirmed) return;
    saveMurtis(murtis.filter((item) => item.id !== murtiId));

    if (hasSupabaseConfig && isUuid(murtiId)) {
      const { error } = await supabase
        .from('murtis')
        .delete()
        .eq('id', murtiId);

      if (error) alert(`Could not delete from Supabase: ${error.message}`);
    }
  };

  const logoutAdmin = async () => {
    if (hasSupabaseConfig) {
      await supabase.auth.signOut();
    }

    sessionStorage.removeItem('ganpati-admin-auth');
    setIsLoggedIn(false);
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadInfo('Compressing image...');

    try {
      const compressed = await compressImage(file);
      updateForm('image', compressed);
      const originalKb = Math.round(file.size / 1024);
      const compressedKb = Math.round((compressed.length * 0.75) / 1024);
      setUploadInfo(`Compressed from ${originalKb} KB to about ${compressedKb} KB`);
    } catch (error) {
      setUploadInfo(error.message);
    }
  };

  const addMurti = async (event) => {
    event.preventDefault();

    try {
      let imageUrl = form.image || 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=900&q=80';

      if (hasSupabaseConfig && form.image?.startsWith('data:image')) {
        setUploadInfo('Uploading compressed image...');
        imageUrl = await uploadMurtiImage(form.image);
      }

      const nextMurti = {
        ...form,
        id: `GM-${Math.floor(100 + Math.random() * 900)}`,
        price: Number(form.price || 0),
        featured: false,
        image: imageUrl,
      };

      if (hasSupabaseConfig) {
        const { data, error } = await supabase
          .from('murtis')
          .insert({
            name: nextMurti.name,
            category: nextMurti.category,
            height: nextMurti.height,
            material: nextMurti.material,
            price: nextMurti.price,
            status: nextMurti.status,
            featured: nextMurti.featured,
            description: nextMurti.description,
            image_url: nextMurti.image,
          })
          .select()
          .single();

        if (error) throw error;
        saveMurtis([fromSupabaseMurti(data), ...murtis]);
      } else {
        saveMurtis([nextMurti, ...murtis]);
      }

      setForm({
        name: '',
        category: 'Traditional',
        height: '',
        material: 'Shadu Mati',
        price: '',
        status: settings.defaultVisibility || 'Available',
        description: '',
        image: '',
      });
      setUploadInfo('');
    } catch (error) {
      setUploadInfo(`Could not save murti: ${error.message}`);
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img className="brand-logo small" src="/assets/bhalachandra-logo.png" alt="" />
          <strong>{settings.shopName}</strong>
        </div>
        <AdminNavButton activePanel={activePanel} panel="dashboard" setActivePanel={setActivePanel} icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <AdminNavButton activePanel={activePanel} panel="murtis" setActivePanel={setActivePanel} icon={<ShoppingBag size={18} />} label="Murtis" />
        <AdminNavButton activePanel={activePanel} panel="gallery" setActivePanel={setActivePanel} icon={<Camera size={18} />} label="Gallery" />
        <AdminNavButton activePanel={activePanel} panel="inquiries" setActivePanel={setActivePanel} icon={<BarChart3 size={18} />} label="Inquiries" />
        <AdminNavButton activePanel={activePanel} panel="settings" setActivePanel={setActivePanel} icon={<Settings size={18} />} label="Settings" />
        <button onClick={logoutAdmin}>
          <X size={18} /> Logout
        </button>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <p>{settings.shopName}</p>
            <h1>{panelTitle(activePanel)}</h1>
          </div>
          <div className="admin-user-actions">
            <span><User size={18} /> Admin</span>
            <button type="button" onClick={logoutAdmin}>Logout</button>
          </div>
        </div>

        {activePanel === 'dashboard' && <DashboardPanel stats={stats} murtis={murtis} />}
        {activePanel === 'murtis' && (
          <MurtisPanel
            form={form}
            updateForm={updateForm}
            handleImage={handleImage}
            addMurti={addMurti}
            adminSearch={adminSearch}
            setAdminSearch={setAdminSearch}
            searchedMurtis={searchedMurtis}
            updateMurtiStatus={updateMurtiStatus}
            deleteMurti={deleteMurti}
            uploadInfo={uploadInfo}
          />
        )}
        {activePanel === 'gallery' && <GalleryPanel murtis={murtis} />}
        {activePanel === 'inquiries' && <InquiriesPanel inquiries={inquiries} />}
        {activePanel === 'settings' && <SettingsPanel settings={settings} saveSettings={saveSettings} />}
      </section>
    </main>
  );
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submitLogin = async (event) => {
    event.preventDefault();

    if (hasSupabaseConfig) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (authError) {
        setError('Invalid Supabase admin email or password.');
        return;
      }

      sessionStorage.setItem('ganpati-admin-auth', 'true');
      onLogin();
      return;
    }

    if (username === 'parag' && password === 'parag@123') {
      sessionStorage.setItem('ganpati-admin-auth', 'true');
      onLogin();
      return;
    }

    setError('Invalid username or password.');
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submitLogin}>
        <img className="login-logo" src="/assets/bhalachandra-logo.png" alt="" />
        <div>
          <p>Bhalachandra Ganesh Kala Murti</p>
          <h1>Admin Login</h1>
        </div>
        <Field label="Email">
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter admin email" autoComplete="username" />
        </Field>
        <Field label="Password">
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" type="password" autoComplete="current-password" />
        </Field>
        {error && <p className="login-error">{error}</p>}
        <button className="primary-button form-submit" type="submit">Login</button>
      </form>
    </main>
  );
}

function panelTitle(activePanel) {
  const titles = {
    dashboard: 'Dashboard',
    murtis: 'Manage Murtis',
    gallery: 'Gallery',
    inquiries: 'Inquiries',
    settings: 'Settings',
  };
  return titles[activePanel];
}

function AdminNavButton({ activePanel, panel, setActivePanel, icon, label }) {
  return (
    <button className={activePanel === panel ? 'active' : ''} onClick={() => setActivePanel(panel)}>
      {icon}
      {label}
    </button>
  );
}

function DashboardPanel({ stats, murtis }) {
  const latest = murtis.slice(0, 4);

  return (
    <>
      <div className="stats-grid">
        <Stat label="Total Murtis" value={stats.total} />
        <Stat label="Available" value={stats.available} />
        <Stat label="Booked" value={stats.booked} />
        <Stat label="Sold" value={stats.sold} />
      </div>
      <div className="admin-grid">
        <section className="recent-panel">
          <h2>Recent Murtis</h2>
          {latest.map((murti) => (
            <div className="recent-row compact" key={murti.id}>
              <img src={murti.image} alt={murti.name} />
              <div>
                <strong>{murti.name}</strong>
                <span>{murti.category} • {currency(murti.price)}</span>
              </div>
              <small className={`status ${murti.status.toLowerCase()}`}>{murti.status}</small>
            </div>
          ))}
        </section>
        <section className="recent-panel">
          <h2>Today's Work</h2>
          <div className="task-list">
            <span>Review new WhatsApp inquiries</span>
            <span>Update booked and sold availability</span>
            <span>Add fresh murti photos to gallery</span>
            <span>Check prices before festival rush</span>
          </div>
        </section>
      </div>
    </>
  );
}

function MurtisPanel({ form, updateForm, handleImage, addMurti, adminSearch, setAdminSearch, searchedMurtis, updateMurtiStatus, deleteMurti, uploadInfo }) {
  return (
    <div className="admin-grid">
      <form className="admin-form" onSubmit={addMurti}>
        <div className="form-title">
          <PackagePlus size={22} />
          <h2>Add New Murti</h2>
        </div>
        <div className="form-grid">
          <Field label="Murti Name">
            <input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Dagdu Sheth Ganpati" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
              {categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Height">
            <input required value={form.height} onChange={(event) => updateForm('height', event.target.value)} placeholder="2.5 ft" />
          </Field>
          <Field label="Material">
            <select value={form.material} onChange={(event) => updateForm('material', event.target.value)}>
              <option>Shadu Mati</option>
              <option>Eco Friendly</option>
              <option>Clay</option>
              <option>Fiber</option>
            </select>
          </Field>
          <Field label="Price">
            <input required type="number" value={form.price} onChange={(event) => updateForm('price', event.target.value)} placeholder="15000" />
          </Field>
          <Field label="Availability">
            <select value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
              {availabilityOptions.map((status) => <option key={status}>{status}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Short description about the murti..." />
        </Field>
        <label className="upload-box">
          <ImagePlus size={28} />
          <span>{form.image ? 'Image selected' : 'Upload image'}</span>
          <input type="file" accept="image/*" onChange={handleImage} />
        </label>
        {uploadInfo && <p className="upload-info">{uploadInfo}</p>}
        {form.image && <img className="preview-image" src={form.image} alt="Selected murti preview" />}
        <button className="primary-button form-submit" type="submit">Save Murti</button>
      </form>

      <section className="recent-panel">
        <div className="panel-title-row">
          <h2>Current Murtis</h2>
          <span>{searchedMurtis.length} found</span>
        </div>
        <label className="search-field admin-search">
          <Search size={18} />
          <input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search by murti name..." />
        </label>
        {searchedMurtis.map((murti) => (
          <div className="recent-row editable" key={murti.id}>
            <img src={murti.image} alt={murti.name} />
            <div>
              <strong>{murti.name}</strong>
              <span>{murtiDisplayCode(murti.id)} • {currency(murti.price)}</span>
            </div>
            <select value={murti.status} onChange={(event) => updateMurtiStatus(murti.id, event.target.value)}>
              {availabilityOptions.map((status) => <option key={status}>{status}</option>)}
            </select>
            <button className="delete-button" type="button" onClick={() => deleteMurti(murti.id)}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}

function GalleryPanel({ murtis }) {
  return (
    <section className="recent-panel full-panel">
      <div className="panel-title-row">
        <h2>Murti Gallery</h2>
        <span>{murtis.length} images</span>
      </div>
      <div className="gallery-grid">
        {murtis.map((murti) => (
          <article key={murti.id}>
            <img src={murti.image} alt={murti.name} />
            <strong>{murti.name}</strong>
            <span>{murti.category}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function InquiriesPanel({ inquiries }) {
  return (
    <section className="recent-panel full-panel">
      <h2>Customer Inquiries</h2>
      {!inquiries.length && <p className="empty-state">No inquiries yet.</p>}
      <div className="admin-table">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id}>
            <strong>{inquiry.customerName}</strong>
            <span>{inquiry.murtiName}</span>
            <span>{inquiry.source}</span>
            <small className={`status ${inquiry.status.toLowerCase()}`}>{inquiry.status}</small>
            <span>{inquiry.phone}</span>
            <span>{inquiry.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel({ settings, saveSettings }) {
  const [draft, setDraft] = useState(settings);

  const updateDraft = (key, value) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    saveSettings(next);
  };

  return (
    <section className="recent-panel full-panel">
      <h2>Website Settings</h2>
      <div className="settings-grid">
        <Field label="Shop Name">
          <input value={draft.shopName} onChange={(event) => updateDraft('shopName', event.target.value)} />
        </Field>
        <Field label="WhatsApp Number">
          <input value={draft.whatsappNumber} onChange={(event) => updateDraft('whatsappNumber', event.target.value)} placeholder="+91 98765 43210" />
        </Field>
        <div className="settings-note">
          <strong>WhatsApp target</strong>
          <span>{normalizePhoneNumber(draft.whatsappNumber) || 'Add a WhatsApp number with country code'}</span>
        </div>
        <Field label="Default Visibility">
          <select value={draft.defaultVisibility} onChange={(event) => updateDraft('defaultVisibility', event.target.value)}>
            {availabilityOptions.map((status) => <option key={status}>{status}</option>)}
          </select>
        </Field>
        <Field label="Festival Season Mode">
          <select value={draft.festivalSeasonMode} onChange={(event) => updateDraft('festivalSeasonMode', event.target.value)}>
            <option>On</option>
            <option>Off</option>
          </select>
        </Field>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

createRoot(document.getElementById('root')).render(<App />);
