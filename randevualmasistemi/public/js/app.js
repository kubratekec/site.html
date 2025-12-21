// Firebase yapılandırması (BUNLARI KENDİ BİLGİLERİNİZLE DEĞİŞTİRİN)
const firebaseConfig = {
    apiKey: "AIzaSyC95KaWW8dvip0Ivb3_YfIvlhT0CnkGumY",
    authDomain: "randevusystem-fa151.firebaseapp.com",
    projectId: "randevusystem-fa151",
    storageBucket: "randevusystem-fa151.appspot.com",
    messagingSenderId: "798150847494",
    appId: "1:798150847494:web:0b26b77298002b52b3a787",
    measurementId: "G-4KJ14ZX3FR"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Sayfa yüklendiğinde çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
    // Giriş yap butonuna tıklandığında
    document.getElementById('loginBtn')?.addEventListener('click', login);
    
    // Kayıt ol butonuna tıklandığında
    document.getElementById('registerBtn')?.addEventListener('click', register);
    
    // Kayıt formunu göster
    document.getElementById('showRegister')?.addEventListener('click', function(e) {
        e.preventDefault();
        showRegister();
    });
    
    // Giriş formunu göster
    document.getElementById('showLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
    });

    // Kullanıcı giriş yapmış mı kontrol et
    auth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.endsWith('index.html')) {
            // Kullanıcı giriş yapmış ve ana sayfada ise randevu sayfasına yönlendir
            window.location.href = 'randevu.html';
        }
    });
});

// Form geçiş fonksiyonları
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

// Giriş fonksiyonu
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Giriş başarılı, randevu sayfasına yönlendir
            window.location.href = 'randevu.html';
        })
        .catch((error) => {
            console.error('Giriş hatası:', error);
            alert('Hata: ' + error.message);
        });
}

// Kayıt fonksiyonu
function register() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const name = document.getElementById('name').value;

    if (!email || !password || !name) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    if (password.length < 6) {
        alert('Şifre en az 6 karakter olmalıdır!');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Kullanıcı oluşturuldu, ismi kaydet
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            // Kullanıcı bilgilerini Firestore'a kaydet
            return db.collection('users').doc(auth.currentUser.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            // Kayıt başarılı, randevu sayfasına yönlendir
            window.location.href = 'randevu.html';
        })
        .catch((error) => {
            console.error('Kayıt hatası:', error);
            alert('Hata: ' + error.message);
        });
}