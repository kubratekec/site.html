// Firebase yapılandırması (app.js ile aynı olmalı)
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
    // Kullanıcı giriş yapmış mı kontrol et
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
            window.location.href = 'index.html';
        } else {
            // Kullanıcı giriş yapmışsa randevuları yükle
            loadAppointments();
        }
    });

    // Çıkış yap butonuna tıklandığında
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Randevu oluştur butonuna tıklandığında
    document.getElementById('createAppointmentBtn').addEventListener('click', createAppointment);
});

// Randevu oluşturma fonksiyonu
function createAppointment() {
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const serviceType = document.getElementById('serviceType').value;
    
    if (!date || !time || !serviceType) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    const appointment = {
        userId: auth.currentUser.uid,
        date: date,
        time: time,
        serviceType: serviceType,
        status: 'Onay Bekliyor',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('appointments').add(appointment)
        .then(() => {
            alert('Randevunuz başarıyla oluşturuldu!');
            loadAppointments();
        })
        .catch((error) => {
            console.error('Randevu oluşturma hatası:', error);
            alert('Hata: ' + error.message);
        });
}

// Randevuları yükleme fonksiyonu
function loadAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '<p class="text-gray-500">Yükleniyor...</p>';

    db.collection('appointments')
        .where('userId', '==', auth.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                appointmentsList.innerHTML = '<p class="text-gray-500">Henüz randevunuz bulunmuyor.</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const appointment = doc.data();
                const date = new Date(appointment.date).toLocaleDateString('tr-TR');
                
                html += `
                    <div class="border p-4 rounded-lg">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-semibold">${appointment.serviceType}</h3>
                                <p class="text-gray-600">${date} - ${appointment.time}</p>
                                <span class="inline-block mt-2 px-2 py-1 text-sm rounded ${
                                    appointment.status === 'Onaylandı' ? 'bg-green-100 text-green-800' : 
                                    appointment.status === 'Reddedildi' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                }">
                                    ${appointment.status}
                                </span>
                            </div>
                            <button onclick="deleteAppointment('${doc.id}')" class="text-red-500 hover:text-red-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            });

            appointmentsList.innerHTML = html;
        });
}

// Randevu silme fonksiyonu
function deleteAppointment(appointmentId) {
    if (confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
        db.collection('appointments').doc(appointmentId).delete()
            .then(() => {
                alert('Randevu başarıyla silindi.');
            })
            .catch((error) => {
                console.error('Randevu silme hatası:', error);
                alert('Hata: ' + error.message);
            });
    }
}

// Çıkış yapma fonksiyonu
function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Çıkış yapma hatası:', error);
            alert('Hata: ' + error.message);
        });
}