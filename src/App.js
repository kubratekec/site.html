import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smile, Frown, Plus, Calendar, Trash2, LogOut, CheckCircle } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);
  const [bgColor, setBgColor] = useState('bg-gradient-to-br from-purple-50 to-pink-50');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mood-based background colors
  const moodColors = {
    mutlu: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    üzgün: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    heyecanlı: 'bg-gradient-to-br from-red-100 to-pink-100',
    sinirli: 'bg-gradient-to-br from-red-200 to-orange-200',
    sakin: 'bg-gradient-to-br from-green-100 to-teal-100',
    yorgun: 'bg-gradient-to-br from-gray-100 to-slate-100',
    endişeli: 'bg-gradient-to-br from-purple-100 to-violet-100',
    mutsuz: 'bg-gradient-to-br from-stone-100 to-gray-200',
    default: 'bg-gradient-to-br from-purple-50 to-pink-50'
  };

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch entries from Firestore for current user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "entries"), 
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched entries:', entriesData); // Debug log
      setEntries([...entriesData]); // Force re-render with spread operator
    });

    return unsubscribe;
  }, [user]);

  // Handle mood change with background transition
  const handleMoodChange = (value) => {
    setMood(value.toLowerCase());
    const moodKey = value.toLowerCase();
    if (moodColors[moodKey]) {
      setBgColor(moodColors[moodKey]);
    } else {
      setBgColor(moodColors.default);
    }
  };

  // Save entry to Firestore
  const saveEntry = async (e) => {
    e.preventDefault();
    if (!note.trim() || !user) {
      if (!note.trim()) {
        setError('Lütfen bir not yazın');
      } else if (!user) {
        setError('Giriş yapmanız gerekiyor');
      }
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "entries"), {
        userId: user.uid,
        mood: mood || 'notr',
        note: note.trim(),
        timestamp: new Date().toISOString()
      });
      setNote('');
      setMood('');
      setBgColor(moodColors.default);
      setError('Günlük kaydedildi! Başarılı! ✅');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error("Error saving entry: ", error);
      setError('Kayıt sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete entry from Firestore
  const deleteEntry = async (id) => {
    try {
      await deleteDoc(doc(db, "entries", id));
      console.log('Entry deleted:', id); // Debug log
      setEntries(prev => prev.filter(entry => entry.id !== id)); // Force re-render with filter
    } catch (error) {
      console.error("Error deleting entry: ", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Get mood icon
  const getMoodIcon = (mood) => {
    switch (mood.toLowerCase()) {
      case 'mutlu':
        return <Smile className="w-5 h-5 text-yellow-500" />;
      case 'üzgün':
        return <Frown className="w-5 h-5 text-blue-500" />;
      default:
        return <Heart className="w-5 h-5 text-gray-400" />;
    }
  };

  // Giriş Kontrolü: Kullanıcının giriş yapıp yapmadığını kontrol et
  if (!user) {
    // Yönlendirme: Giriş yapılmamışsa sadece Giriş/Kayıt formunu göster
    return <Auth onAuthSuccess={() => {
      // Başarılı Giriş: Kullanıcı giriş yaptıktan sonra otomatik yönlendirme
      // onAuthStateChanged bu yönlendirmeyi handle edecek
    }} />;
  }

  return (
    <motion.div 
      className={`min-h-screen transition-all duration-1000 ease-in-out ${bgColor}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.header 
          className="text-center mb-10"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <Heart className="w-10 h-10 text-pink-500" />
              Mod Günlüğü
              <Heart className="w-10 h-10 text-pink-500" />
            </h1>
            {/* Güvenlik: Günlük sayfasının en üstüne şık 'Çıkış Yap' butonu */}
            <motion.button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </motion.button>
          </div>
          <p className="text-gray-600 text-lg">Duygularını kaydet, anılarını koru</p>
          <p className="text-sm text-gray-500 mt-2">Hoş geldin, {user.email}</p>
          <p className="text-sm text-gray-500 mt-2">Kaydetmek için "Günlüğe Ekle" butonuna tıklayın.</p>
        </motion.header>

        {/* Entry Form */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Success Message */}
          <AnimatePresence>
            {error && error.includes('Başarılı') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={saveEntry} className="space-y-6">
            {/* Mood Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bugün nasıl hissediyorsun?
              </label>
              <input
                type="text"
                value={mood}
                onChange={(e) => handleMoodChange(e.target.value)}
                placeholder="Örn: mutlu, üzgün, heyecanlı..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notun
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bugün neler oldu? Duygularını paylaş..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition-colors resize-none"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !note.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              {isLoading ? 'Kaydediliyor...' : 'Günlüğe Ekle'}
            </motion.button>
          </form>
        </motion.div>

        {/* Entries List */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Günlük Kayıtların
          </h2>

          <AnimatePresence>
            {entries.length === 0 ? (
              <motion.div 
                className="text-center py-12 text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Henüz hiç kaydın yok</p>
                <p className="text-sm mt-2">İlk günlük girişini yapmaya başla!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getMoodIcon(entry.mood)}
                        <span className="font-semibold text-gray-700 capitalize">
                          {entry.mood}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <motion.button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{entry.note}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default App;
