var firebaseConfig = {
    apiKey: "AIzaSyCeEISu5pps1FSiVvVO2vTSYImVQRL-Gik",
    authDomain: "grafittis66.firebaseapp.com",
    projectId: "grafittis66",
    storageBucket: "grafittis66.firebasestorage.app",
    messagingSenderId: "1069786792691",
    appId: "1:1069786792691:web:de9a7ec896b9fa47f52d86"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

var DURACION_GRAFFITI = 6 * 24 * 60 * 60 * 1000;
var ALERTA_ANTICIPACION = 24 * 60 * 60 * 1000;
var GRACIA_EXPIRADO = 48 * 60 * 60 * 1000;
var territories = [];

function formatDate(d) { return d.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function formatDateShort(d) { return d.toLocaleDateString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }

function showNotification(msg, type) {
    var c = document.getElementById('notifications');
    if (!c) return;
    var n = document.createElement('div');
    n.className = 'notification notification-' + type;
    n.innerHTML = msg;
    c.appendChild(n);
    setTimeout(function(){n.remove();},5000);
}

function getTerritoryByName(name) {
    for (var i=0; i<territories.length; i++) {
        if (territories[i].name.toLowerCase() === name.toLowerCase()) return territories[i];
    }
    return null;
}

function cleanExpiredGraffitis() {
    var now = Date.now();
    var changed = false;
    territories.forEach(function(t) {
        var before = t.graffitis.length;
        t.graffitis = t.graffitis.filter(function(g) {
            return (now - g.date) <= (DURACION_GRAFFITI + GRACIA_EXPIRADO);
        });
        if (t.graffitis.length < before) changed = true;
    });
    territories = territories.filter(function(t) { return t.graffitis.length > 0; });
}

function saveTerritoriesToFirestore() {
    var docRef = db.collection('data').doc('territories');
    var data = territories.map(function(t) {
        return { name: t.name, graffitis: t.graffitis };
    });
    return docRef.set({ territories: data }).catch(function(err) {
        console.error('Error guardando en Firestore:', err);
    });
}

function loadTerritories() {
    return db.collection('data').doc('territories').get().then(function(doc) {
        if (doc.exists && doc.data().territories) {
            territories = doc.data().territories;
        } else {
            territories = [];
        }
        cleanExpiredGraffitis();
    }).catch(function(err) {
        console.error('Error cargando de Firestore:', err);
        territories = [];
    });
}

function getTotalGraffitiCount(territory) {
    var now = Date.now();
    var total = 0;
    territory.graffitis.forEach(function(g) {
        if (g.date + DURACION_GRAFFITI + GRACIA_EXPIRADO > now) {
            total += g.quantity || 1;
        }
    });
    return total;
}

function getActiveGraffitis(territory) {
    var now = Date.now();
    return territory.graffitis.filter(function(g) {
        return g.date + DURACION_GRAFFITI + GRACIA_EXPIRADO > now;
    });
}
