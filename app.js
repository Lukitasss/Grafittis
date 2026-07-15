var GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyvGKp7rMbaYjpaGNyR6uWl99WtSMO7usFce97jPpsIoxfmEftFpQOzSP67xBsiU2gB/exec';
var USE_GOOGLE_SHEETS = true;
var DURACION_GRAFFITI = 6 * 24 * 60 * 60 * 1000;
var ALERTA_ANTICIPACION = 24 * 60 * 60 * 1000;
var GRACIA_EXPIRADO = 48 * 60 * 60 * 1000;
var territories = [];

function jsonp(url, cb) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        var id = 'cb_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
        window[id] = function(data) { resolve(data); delete window[id]; script.remove(); };
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + id;
        script.onerror = function() { reject(); delete window[id]; script.remove(); };
        document.body.appendChild(script);
    });
}

function gsUrl(p) { return GOOGLE_SHEETS_URL + '?' + new URLSearchParams(p).toString(); }

function loadFromLocalStorage() {
    var s = localStorage.getItem('territories_v2');
    if (s) { try { territories = JSON.parse(s); } catch(e) { territories = []; } }
}

function saveToLocalStorage() {
    localStorage.setItem('territories_v2', JSON.stringify(territories));
    syncToGoogleSheets();
}

function syncToGoogleSheets() {
    if (!USE_GOOGLE_SHEETS || GOOGLE_SHEETS_URL.indexOf('TU_SCRIPT_ID') >= 0) return;
    territories.forEach(function(t) {
        jsonp(gsUrl({action:'add', name:t.name, graffitis:JSON.stringify(t.graffitis)}),'sync').catch(function(){});
    });
}

function formatDate(d) { return d.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }

function getTimeRemainingText(tr) {
    if (tr<=0) return 'Expirado';
    var d=Math.floor(tr/864e5), h=Math.floor((tr%864e5)/36e5);
    return d>0 ? d+'d '+h+'h' : h+'h '+Math.floor((tr%36e5)/6e4)+'m';
}

function getTimeSinceExpirationText(exp) {
    var h = 48 - Math.floor((Date.now()-exp)/36e5);
    return h<=0 ? 'Se eliminara pronto' : 'Quedan '+h+'h para renovar';
}

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
    if (changed) saveToLocalStorage();
}

function loadTerritories() {
    if (USE_GOOGLE_SHEETS && GOOGLE_SHEETS_URL.indexOf('TU_SCRIPT_ID') < 0) {
        return jsonp(gsUrl({action:'get'}),'get').then(function(d) {
            if (d.territories && d.territories.length > 0) {
                territories = d.territories;
            }
            cleanExpiredGraffitis();
        }).catch(function() { loadFromLocalStorage(); });
    }
    loadFromLocalStorage();
    return Promise.resolve();
}

function migrateIfNeeded() {
    if (territories.length > 0 && territories[0].graffitis === undefined) {
        var old = territories.slice();
        territories = [];
        old.forEach(function(t) {
            var existing = getTerritoryByName(t.name);
            if (existing) {
                existing.graffitis.push({date: t.graffitiDate, quantity: t.quantity, notes: t.notes || ''});
            } else {
                territories.push({
                    name: t.name,
                    graffitis: [{date: t.graffitiDate, quantity: t.quantity, notes: t.notes || ''}]
                });
            }
        });
        saveToLocalStorage();
    }
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
