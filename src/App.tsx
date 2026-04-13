import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { fetchMemories, addMemory, deleteMemory, fetchAlbums, addAlbum, deleteAlbum, fetchSettings, upsertSettings, type Memory, type Album, type Settings } from './lib/database';
import { uploadImage, deleteImage } from './lib/storage';

// Google Fonts
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Great+Vibes&display=swap');
`;

// Types
interface AppMemory extends Memory {
  category: string;
  show_on_home: boolean;
}

const CATEGORIES = [
  { id: 'sve', label: 'Sve', emoji: '🌸' },
  { id: 'prvi-put', label: 'Prvi put', emoji: '⭐' },
  { id: 'osmeh', label: 'Osmesi', emoji: '😊' },
  { id: 'rast', label: 'Rast', emoji: '📏' },
  { id: 'porodica', label: 'Porodica', emoji: '👨‍👩‍👧' },
  { id: 'avantura', label: 'Avanture', emoji: '🌍' },
  { id: 'trudnoca', label: 'Trudnoća', emoji: '🤰' },
  { id: 'ostalo', label: 'Ostalo', emoji: '💕' },
];

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('sr-RS', options);
};

const getPregnancyWeek = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  const weeksFromDue = Math.floor((due.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return 40 - weeksFromDue;
};

const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getAgeDetails = (birthDate: string): { months: number; days: number } => {
  const birth = new Date(birthDate);
  const today = new Date();
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += today.getMonth();
  const daysDiff = today.getDate() - birth.getDate();
  let adjustedMonths = months;
  let adjustedDays = daysDiff;
  if (daysDiff < 0) {
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    adjustedDays = prevMonth.getDate() + daysDiff;
    adjustedMonths = months - 1;
  }
  return { months: adjustedMonths, days: adjustedDays };
};

// ─── GOLD PARTICLES ────────────────────────────────────────────────────────
interface GoldParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [particles, setParticles] = useState<GoldParticle[]>([]);

  useEffect(() => {
    const newParticles: GoldParticle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 1,
    }));
    setParticles(newParticles);
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#FAF7F2' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: '#E3CBB3', opacity: p.opacity }}
          animate={{ y: [0, -20, 0], opacity: [p.opacity, p.opacity * 0.5, p.opacity], scale: [1, 1.2, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
      <motion.h1
        className="text-7xl md:text-9xl font-bold"
        style={{ fontFamily: "'Great Vibes', cursive", color: '#D4A39B', textShadow: '2px 2px 4px rgba(212,163,155,0.3)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        Aria
      </motion.h1>
      <motion.p
        className="absolute bottom-20 text-sm tracking-widest uppercase"
        style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.6 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Priča o rasti i ljubavi
      </motion.p>
    </div>
  );
};

// ─── FLOWER BUTTON ─────────────────────────────────────────────────────────
const FlowerButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    className="relative w-16 h-16 flex items-center justify-center cursor-pointer"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    style={{ backgroundColor: '#D4A39B', borderRadius: '50%', boxShadow: '0 4px 20px rgba(212,163,155,0.4)' }}
  >
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-6 h-8 rounded-full"
        style={{ backgroundColor: '#D4A39B', transform: `rotate(${i * 72}deg) translateY(-12px)` }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
    <div className="absolute w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FAF7F2' }}>
      <span className="text-2xl" style={{ color: '#D4A39B', lineHeight: 1 }}>+</span>
    </div>
  </motion.button>
);

// ─── GROWING ILLUSTRATION ──────────────────────────────────────────────────
const GrowingIllustration = ({ mode, progress }: { mode: 'pregnancy' | 'growth'; progress: number }) => {
  if (mode === 'pregnancy') {
    const flowerProgress = Math.min(progress / 40, 1);
    return (
      <motion.div className="relative flex items-end justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}>
        <motion.div className="w-1 rounded-full" style={{ backgroundColor: '#D4A39B', height: `${20 + flowerProgress * 60}px` }} initial={{ height: 20 }} animate={{ height: `${20 + flowerProgress * 60}px` }} transition={{ duration: 1 }} />
        {[...Array(Math.ceil(flowerProgress * 3))].map((_, i) => (
          <motion.div key={i} className="absolute w-4 h-4 rounded-full" style={{ backgroundColor: '#E3CBB3', bottom: `${25 + i * 20}px`, left: i % 2 === 0 ? -6 : 2, transform: `rotate(${i % 2 === 0 ? -30 : 30}deg)` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }} transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }} />
        ))}
        <motion.div className="absolute rounded-full" style={{ backgroundColor: '#D4A39B', width: `${10 + flowerProgress * 15}px`, height: `${12 + flowerProgress * 18}px`, bottom: `${80 + flowerProgress * 60}px` }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      </motion.div>
    );
  }
  const treeProgress = Math.min(progress / 12, 1);
  return (
    <motion.div className="relative flex items-end justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}>
      <motion.div className="w-3 rounded-t-lg" style={{ backgroundColor: '#D4A39B', height: `${30 + treeProgress * 40}px` }} />
      {[...Array(Math.min(Math.ceil(treeProgress * 6), 6))].map((_, i) => (
        <motion.div key={i} className="absolute" style={{ bottom: `${40 + (i % 3) * 25}px`, left: i < 3 ? -8 : 4 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.9 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}>
          <div className="rounded-full" style={{ backgroundColor: '#E3CBB3', width: 12, height: 10, transform: `rotate(${i < 3 ? -20 : 20}deg)` }} />
          <div className="rounded-full -mt-1 ml-1" style={{ backgroundColor: '#D4A39B', width: 10, height: 8, transform: `rotate(${i < 3 ? 10 : -10}deg)` }} />
        </motion.div>
      ))}
      <motion.div className="absolute rounded-full" style={{ backgroundColor: '#E3CBB3', width: `${20 + treeProgress * 10}px`, height: `${18 + treeProgress * 8}px`, bottom: `${70 + treeProgress * 40}px`, opacity: treeProgress * 0.8 }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} />
    </motion.div>
  );
};

// ─── LIGHTBOX ──────────────────────────────────────────────────────────────
const Lightbox = ({ memory, onClose, onPrev, onNext, hasPrev, hasNext }: {
  memory: AppMemory;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const cat = CATEGORIES.find(c => c.id === memory.category);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(62,47,44,0.92)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
          style={{ backgroundColor: '#FAF7F2', boxShadow: '0 30px 80px rgba(62,47,44,0.3)' }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={memory.image_url} alt={memory.title} className="w-full h-full object-cover" />
            {memory.milestone && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wider" style={{ backgroundColor: '#D4A39B', color: '#FAF7F2', fontFamily: "'Inter', sans-serif" }}>
                ⭐ Milestone
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{cat?.emoji}</span>
              <span className="text-xs tracking-wider uppercase" style={{ color: '#D4A39B', fontFamily: "'Inter', sans-serif" }}>
                {cat?.label} · {formatDate(memory.date)}
              </span>
            </div>
            <h2 className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>
              {memory.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>
              {memory.description}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(250,247,242,0.9)' }}
          >
            <span style={{ color: '#3E2F2C', fontSize: 16 }}>✕</span>
          </button>

          {/* Navigation */}
          {hasPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 top-1/3 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(250,247,242,0.9)' }}
            >
              <span style={{ color: '#3E2F2C', fontSize: 18 }}>‹</span>
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/3 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(250,247,242,0.9)' }}
            >
              <span style={{ color: '#3E2F2C', fontSize: 18 }}>›</span>
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── MEMORY CARD ───────────────────────────────────────────────────────────
const MemoryCard = ({ memory, index, onDelete, onClick }: {
  memory: AppMemory;
  index: number;
  onDelete: (id: string) => void;
  onClick: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const scale = useTransform(scrollYProgress, [0.3, 0.7], [0.95, 1]);
  const [isHovered, setIsHovered] = useState(false);
  const cat = CATEGORIES.find(c => c.id === memory.category);

  return (
    <motion.div
      ref={ref}
      className="relative group cursor-pointer"
      style={{ y, scale }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          boxShadow: isHovered ? '0 20px 40px rgba(62,47,44,0.15), 0 0 0 2px #E3CBB3' : '0 10px 30px rgba(62,47,44,0.1)',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={memory.image_url}
            alt={memory.title}
            className="w-full h-full object-cover"
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          {memory.milestone && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D4A39B', color: '#FAF7F2', fontFamily: "'Inter', sans-serif" }}>
              ⭐ Milestone
            </div>
          )}
          {cat && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'rgba(250,247,242,0.9)' }}>
              {cat.emoji}
            </div>
          )}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-40" style={{ background: 'linear-gradient(to top, rgba(62,47,44,0.5), transparent)', transition: 'opacity 0.4s ease' }} />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5" style={{ backgroundColor: 'rgba(250,247,242,0.97)' }}>
          <p className="text-xs tracking-wider uppercase mb-1" style={{ color: '#D4A39B', fontFamily: "'Inter', sans-serif" }}>
            {formatDate(memory.date)}
          </p>
          <h3 className="text-lg mb-1 leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>
            {memory.title}
          </h3>
          <p className="text-xs leading-relaxed opacity-70 line-clamp-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>
            {memory.description}
          </p>
        </div>

        {/* Delete */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}
          className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: 'rgba(212,163,155,0.9)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span style={{ color: '#FAF7F2', fontSize: '14px' }}>✕</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── ADD MEMORY MODAL ──────────────────────────────────────────────────────
const AddMemoryModal = ({ isOpen, onClose, onAdd, albums }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memory: any) => Promise<void>;
  albums: Album[];
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [category, setCategory] = useState('ostalo');
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [showOnHome, setShowOnHome] = useState(true);
  const [milestone, setMilestone] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !imageFile) {
      alert('Molim popuni sve podatke i dodaj fotografiju');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage('user', imageFile);
      await onAdd({
        title,
        description,
        date,
        image_url: imageUrl,
        category,
        album_id: albumId,
        show_on_home: showOnHome,
        milestone,
      });
      
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      setCategory('ostalo');
      setAlbumId(null);
      setShowOnHome(true);
      setMilestone(false);
      onClose();
    } catch (error) {
      console.error('Error adding memory:', error);
      alert('Greška pri dodavanju uspomene');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { fontFamily: "'Inter', sans-serif", backgroundColor: '#F5E1DA', color: '#3E2F2C' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(62,47,44,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <div className="w-full max-w-lg rounded-3xl p-7 pointer-events-auto relative overflow-hidden overflow-y-auto" style={{ backgroundColor: '#FAF7F2', boxShadow: '0 25px 50px rgba(62,47,44,0.15)', maxHeight: '92vh' }}>
              <motion.div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(212,163,155,0.1)' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} />

              <h2 className="text-2xl mb-5 relative" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>
                Zabeleži trenutak za Ariu
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Fotografija</label>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer mb-2 transition-all"
                    style={{ borderColor: '#D4A39B', backgroundColor: '#F5E1DA', minHeight: imagePreview ? 'auto' : '120px', padding: imagePreview ? '8px' : '24px' }}
                  >
                    {imagePreview ? (
                      <div className="relative w-full">
                        <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover" style={{ maxHeight: '200px' }} />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setImagePreview(''); setImageFile(null); }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: '#D4A39B', color: '#FAF7F2' }}
                        >✕</button>
                      </div>
                    ) : (
                      <>
                        <span className="text-3xl mb-2">📸</span>
                        <p className="text-sm text-center" style={{ color: '#3E2F2C', opacity: 0.7, fontFamily: "'Inter', sans-serif" }}>
                          Dodaj fotografiju sa telefona
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#D4A39B', fontFamily: "'Inter', sans-serif" }}>
                          Klikni ovde ili prevuci sliku
                        </p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Naziv uspomene *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="npr. Prvi osmeh, Prvi korak..." className="w-full px-4 py-3 rounded-xl border-0 outline-none" style={inputStyle} required />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Opis *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opiši ovaj čarobni trenutak..." rows={3} className="w-full px-4 py-3 rounded-xl border-0 outline-none resize-none" style={inputStyle} required />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Datum</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border-0 outline-none" style={inputStyle} required />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Kategorija</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.filter(c => c.id !== 'sve').map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className="flex flex-col items-center py-2 px-1 rounded-xl text-xs transition-all"
                        style={{
                          backgroundColor: category === cat.id ? '#D4A39B' : '#F5E1DA',
                          color: category === cat.id ? '#FAF7F2' : '#3E2F2C',
                          fontFamily: "'Inter', sans-serif",
                          border: category === cat.id ? '2px solid #D4A39B' : '2px solid transparent',
                        }}
                      >
                        <span className="text-lg mb-1">{cat.emoji}</span>
                        <span className="text-center leading-tight" style={{ fontSize: '10px' }}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Album */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Album (opciono)</label>
                  <select value={albumId || ''} onChange={(e) => setAlbumId(e.target.value || null)} className="w-full px-4 py-3 rounded-xl border-0 outline-none" style={inputStyle}>
                    <option value="">Bez albuma</option>
                    {albums.map(album => (
                      <option key={album.id} value={album.id}>{album.emoji} {album.name}</option>
                    ))}
                  </select>
                </div>

                {/* Show on Home */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5E1DA' }}>
                  <button
                    type="button"
                    onClick={() => setShowOnHome(!showOnHome)}
                    className="w-10 h-6 rounded-full flex items-center transition-all"
                    style={{ backgroundColor: showOnHome ? '#D4A39B' : '#E3CBB3', padding: '2px', justifyContent: showOnHome ? 'flex-end' : 'flex-start' }}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#FAF7F2' }} />
                  </button>
                  <div>
                    <p className="text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>💕 Prikaži na početnoj</p>
                    <p className="text-xs opacity-60" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>Važna uspomena</p>
                  </div>
                </div>

                {/* Milestone toggle */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5E1DA' }}>
                  <button
                    type="button"
                    onClick={() => setMilestone(!milestone)}
                    className="w-10 h-6 rounded-full flex items-center transition-all"
                    style={{ backgroundColor: milestone ? '#D4A39B' : '#E3CBB3', padding: '2px', justifyContent: milestone ? 'flex-end' : 'flex-start' }}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#FAF7F2' }} />
                  </button>
                  <div>
                    <p className="text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>⭐ Milestone trenutak</p>
                    <p className="text-xs opacity-60" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>Poseban, nezaboravan momenat</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-3 px-6 rounded-xl" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'transparent', color: '#3E2F2C', border: '1px solid #E3CBB3' }}>
                    Otkaži
                  </button>
                  <motion.button type="submit" disabled={loading} className="flex-1 py-3 px-6 rounded-xl" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#D4A39B', color: '#FAF7F2', border: 'none', opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Učitavam...' : 'Sačuvaj trenutak 💕'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── SETTINGS MODAL ────────────────────────────────────────────────────────
const SettingsModal = ({ isOpen, onClose, settings, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => Promise<void>;
}) => {
  const [mode, setMode] = useState<'pregnancy' | 'growth'>(settings.mode);
  const [dueDate, setDueDate] = useState(settings.due_date || '');
  const [birthDate, setBirthDate] = useState(settings.birth_date || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({ mode, due_date: dueDate || null, birth_date: birthDate || null, user_id: settings.user_id });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { fontFamily: "'Inter', sans-serif", backgroundColor: '#F5E1DA', color: '#3E2F2C' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(62,47,44,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <div className="w-full max-w-md rounded-3xl p-8 pointer-events-auto" style={{ backgroundColor: '#FAF7F2', boxShadow: '0 25px 50px rgba(62,47,44,0.15)' }}>
              <h2 className="text-2xl mb-6" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>Podešavanja</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm mb-3" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Faza</label>
                  <div className="flex gap-3">
                    {(['pregnancy', 'growth'] as const).map((m) => (
                      <button key={m} onClick={() => setMode(m)} className="flex-1 py-3 px-4 rounded-xl border-0 outline-none" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: mode === m ? '#D4A39B' : '#F5E1DA', color: mode === m ? '#FAF7F2' : '#3E2F2C' }}>
                        {m === 'pregnancy' ? 'Trudnoća' : 'Rast'}
                      </button>
                    ))}
                  </div>
                </div>
                {mode === 'pregnancy' && (
                  <div>
                    <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Očekivani datum porođaja</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border-0 outline-none" style={inputStyle} />
                  </div>
                )}
                {mode === 'growth' && (
                  <div>
                    <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Datum rođenja</label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border-0 outline-none" style={inputStyle} />
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={onClose} className="flex-1 py-3 px-6 rounded-xl" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'transparent', color: '#3E2F2C', border: '1px solid #E3CBB3' }}>Otkaži</button>
                <motion.button onClick={handleSave} disabled={loading} className="flex-1 py-3 px-6 rounded-xl" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#D4A39B', color: '#FAF7F2', border: 'none', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Čuvam...' : 'Sačuvaj'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── ALBUMS MODAL ──────────────────────────────────────────────────────────
const AlbumsModal = ({ isOpen, onClose, albums, onAddAlbum, onDeleteAlbum }: {
  isOpen: boolean;
  onClose: () => void;
  albums: Album[];
  onAddAlbum: (album: Omit<Album, 'id' | 'user_id'>) => Promise<void>;
  onDeleteAlbum: (albumId: string) => Promise<void>;
}) => {
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumEmoji, setNewAlbumEmoji] = useState('📁');
  const [loading, setLoading] = useState(false);

  const handleAddAlbum = async () => {
    if (!newAlbumName) return;
    setLoading(true);
    try {
      await onAddAlbum({ name: newAlbumName, emoji: newAlbumEmoji });
      setNewAlbumName('');
      setNewAlbumEmoji('📁');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(62,47,44,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <div className="w-full max-w-md rounded-3xl p-8 pointer-events-auto max-h-[80vh] overflow-y-auto" style={{ backgroundColor: '#FAF7F2', boxShadow: '0 25px 50px rgba(62,47,44,0.15)' }}>
              <h2 className="text-2xl mb-6" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>Moji Albumi</h2>

              {/* Add New Album */}
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F5E1DA' }}>
                <label className="block text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.8 }}>Novi album</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="Naziv albuma..."
                    className="flex-1 px-3 py-2 rounded-lg border-0 outline-none text-sm"
                    style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#FAF7F2', color: '#3E2F2C' }}
                  />
                  <input
                    type="text"
                    value={newAlbumEmoji}
                    onChange={(e) => setNewAlbumEmoji(e.target.value.slice(0, 2))}
                    maxLength={2}
                    className="w-12 px-2 py-2 rounded-lg border-0 outline-none text-center"
                    style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#FAF7F2', color: '#3E2F2C' }}
                  />
                  <motion.button
                    onClick={handleAddAlbum}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#D4A39B', color: '#FAF7F2' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? '...' : '+'}
                  </motion.button>
                </div>
              </div>

              {/* Albums List */}
              <div className="space-y-2">
                {albums.length === 0 ? (
                  <p style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.6 }}>Nema albuma. Kreiraj prvi! 📸</p>
                ) : (
                  albums.map(album => (
                    <div key={album.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5E1DA' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>
                        {album.emoji} {album.name}
                      </span>
                      <motion.button
                        onClick={() => onDeleteAlbum(album.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: '#D4A39B', color: '#FAF7F2' }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        🗑️
                      </motion.button>
                    </div>
                  ))
                )}
              </div>

              <motion.button
                onClick={onClose}
                className="w-full mt-6 py-3 px-6 rounded-xl"
                style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#D4A39B', color: '#FAF7F2' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Zatvori
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [memories, setMemories] = useState<AppMemory[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [settings, setSettings] = useState<Settings>({ user_id: '', due_date: '2026-05-20', birth_date: null, mode: 'pregnancy' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAlbums, setShowAlbums] = useState(false);
  const [activeCategory, setActiveCategory] = useState('sve');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Load user and fetch data
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [memData, albData, setData] = await Promise.all([
        fetchMemories(userId),
        fetchAlbums(userId),
        fetchSettings(userId),
      ]);

      setMemories(memData as AppMemory[]);
      setAlbums(albData);
      setSettings(setData || { user_id: userId, due_date: '2026-05-20', birth_date: null, mode: 'pregnancy' });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAddMemory = async (memory: any) => {
    if (!user) return;
    try {
      const newMemory = await addMemory(user.id, memory);
      setMemories([newMemory as AppMemory, ...memories]);
    } catch (error) {
      console.error('Error adding memory:', error);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const memory = memories.find(m => m.id === id);
    if (!memory) return;
    
    try {
      await deleteImage(memory.image_url);
      await deleteMemory(id);
      setMemories(memories.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const handleAddAlbum = async (album: Omit<Album, 'id' | 'user_id'>) => {
    if (!user) return;
    try {
      const newAlbum = await addAlbum(user.id, album);
      setAlbums([...albums, newAlbum]);
    } catch (error) {
      console.error('Error adding album:', error);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      await deleteAlbum(albumId);
      setAlbums(albums.filter(a => a.id !== albumId));
      // Move memories from this album to no album
      setMemories(memories.map(m => m.album_id === albumId ? { ...m, album_id: null } : m));
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    if (!user) return;
    try {
      await upsertSettings(user.id, newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMemories([]);
    setAlbums([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF7F2' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-full" style={{ borderTop: '3px solid #D4A39B', borderRight: '3px solid #E3CBB3', borderBottom: '3px solid #D4A39B' }} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const filteredMemories = activeCategory === 'sve'
    ? memories.filter(m => m.show_on_home)
    : memories.filter(m => (activeCategory === 'sve' || m.category === activeCategory) && m.show_on_home);

  const getDynamicMessage = () => {
    if (settings.mode === 'pregnancy' && settings.due_date) {
      const days = getDaysUntilDue(settings.due_date);
      const week = getPregnancyWeek(settings.due_date);
      if (days > 0) {
        return {
          header: `Arija nam stiže za ${days} dana`,
          subheader: `Danas smo u ${week}. nedelji`,
          illustration: <GrowingIllustration mode="pregnancy" progress={week} />,
        };
      }
    }
    if (settings.mode === 'growth' && settings.birth_date) {
      const { months, days } = getAgeDetails(settings.birth_date);
      return {
        header: 'Aria, naš svet je lepši s tobom',
        subheader: `već ${months} ${months === 1 ? 'mesec' : months < 5 ? 'meseca' : 'meseci'} i ${days} ${days === 1 ? 'dan' : days < 5 ? 'dana' : 'dana'}.`,
        illustration: <GrowingIllustration mode="growth" progress={months} />,
      };
    }
    return {
      header: 'Aria',
      subheader: 'Priča o rasti i ljubavi',
      illustration: <GrowingIllustration mode="pregnancy" progress={10} />,
    };
  };

  const message = getDynamicMessage();
  const milestones = memories.filter(m => m.milestone).length;

  return (
    <>
      <style>{FONTS}</style>

      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}

      {!showIntro && (
        <motion.div className="min-h-screen" style={{ backgroundColor: '#FAF7F2' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>

          {/* ── HEADER ── */}
          <header className="relative pt-16 pb-20 px-6 text-center overflow-hidden" style={{ backgroundColor: '#FAF7F2' }}>
            <motion.div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: '#D4A39B' }} animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 8, repeat: Infinity }} />
            <motion.div className="absolute top-32 right-16 w-12 h-12 rounded-full opacity-30" style={{ backgroundColor: '#E3CBB3' }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} />
            <motion.div className="absolute bottom-10 left-1/4 w-8 h-8 rounded-full opacity-25" style={{ backgroundColor: '#D4A39B' }} animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} />

            <div className="absolute top-6 right-6 flex gap-3">
              <motion.button onClick={() => setShowAlbums(true)} className="px-4 py-2 rounded-full text-sm flex items-center gap-2" style={{ backgroundColor: '#F5E1DA', fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                📁 Albumi ({albums.length})
              </motion.button>
              <motion.button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5E1DA' }} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <span style={{ color: '#3E2F2C', fontSize: '18px' }}>⚙</span>
              </motion.button>
              <motion.button onClick={handleLogout} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5E1DA' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <span style={{ color: '#3E2F2C', fontSize: '18px' }}>🚪</span>
              </motion.button>
            </div>

            <div className="mb-8">{message.illustration}</div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h1 className="text-3xl md:text-5xl mb-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>
                {message.header}
              </h1>
              <p className="text-lg md:text-xl opacity-80 mb-4" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>
                {message.subheader}
              </p>
              <p className="text-sm opacity-70" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>
                Tata Nikola & Mama Željana (1996) — Naše prvo dete — Čekamo Ariu 2026 ✨
              </p>
            </motion.div>
          </header>

          {/* ── STATS BAR ── */}
          <motion.div
            className="mx-6 mb-8 max-w-2xl md:mx-auto rounded-2xl p-4 grid grid-cols-3 gap-4"
            style={{ backgroundColor: 'rgba(212,163,155,0.12)', border: '1px solid rgba(212,163,155,0.3)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { label: 'Uspomena', value: memories.length, emoji: '📸' },
              { label: 'Milestones', value: milestones, emoji: '⭐' },
              { label: 'Albumi', value: albums.length, emoji: '📁' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl mb-1">{stat.emoji}</div>
                <div className="text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>{stat.value}</div>
                <div className="text-xs opacity-60" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── CATEGORY FILTER ── */}
          <div className="px-6 mb-8 max-w-6xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map((cat) => {
                const count = cat.id === 'sve' ? memories.filter(m => m.show_on_home).length : memories.filter(m => m.category === cat.id && m.show_on_home).length;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all flex-shrink-0"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      backgroundColor: activeCategory === cat.id ? '#D4A39B' : '#F5E1DA',
                      color: activeCategory === cat.id ? '#FAF7F2' : '#3E2F2C',
                      boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(212,163,155,0.4)' : 'none',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    {count > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: activeCategory === cat.id ? 'rgba(250,247,242,0.3)' : 'rgba(212,163,155,0.2)' }}>
                        {count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── TIMELINE GRID ── */}
          <section className="px-6 pb-32 max-w-6xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#3E2F2C' }}>
                Ariini trenuci
              </h2>
              <div className="w-16 h-0.5 mx-auto rounded-full" style={{ backgroundColor: '#D4A39B' }} />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredMemories.map((memory, index) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    index={index}
                    onDelete={handleDeleteMemory}
                    onClick={() => {
                      const globalIndex = memories.findIndex(m => m.id === memory.id);
                      setLightboxIndex(globalIndex);
                    }}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredMemories.length === 0 && (
              <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-5xl mb-4">🌸</div>
                <p className="text-lg opacity-60" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C' }}>
                  {activeCategory === 'sve'
                    ? 'Još uvek nema uspomena. Dodajte prvi trenutak za Ariu! ✨'
                    : `Nema uspomena u kategoriji "${CATEGORIES.find(c => c.id === activeCategory)?.label}". Dodajte prvu!`}
                </p>
              </motion.div>
            )}
          </section>

          {/* ── FOOTER ── */}
          <footer className="py-8 text-center">
            <motion.div className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <span style={{ color: '#D4A39B', fontSize: '1.2rem' }}>💖</span>
              <p className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: '#3E2F2C', opacity: 0.7 }}>
                Napravljeno sa ljubavlju za Ariu
              </p>
              <span style={{ color: '#D4A39B', fontSize: '1.2rem' }}>💖</span>
            </motion.div>
          </footer>

          {/* ── FLOWER BUTTON ── */}
          <motion.div className="fixed bottom-8 right-8 z-40" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring', stiffness: 200 }}>
            <FlowerButton onClick={() => setShowAddModal(true)} />
          </motion.div>

          {/* ── MODALS ── */}
          <AddMemoryModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddMemory} albums={albums} />
          <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSave={handleSaveSettings} />
          <AlbumsModal isOpen={showAlbums} onClose={() => setShowAlbums(false)} albums={albums} onAddAlbum={handleAddAlbum} onDeleteAlbum={handleDeleteAlbum} />

          {/* ── LIGHTBOX ── */}
          {lightboxIndex !== null && (
            <Lightbox
              memory={memories[lightboxIndex]}
              onClose={() => setLightboxIndex(null)}
              onPrev={() => setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i))}
              onNext={() => setLightboxIndex(i => (i !== null && i < memories.length - 1 ? i + 1 : i))}
              hasPrev={lightboxIndex > 0}
              hasNext={lightboxIndex < memories.length - 1}
            />
          )}
        </motion.div>
      )}
    </>
  );
}
