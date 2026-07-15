document.addEventListener('DOMContentLoaded', function() {
    loadTerritories().then(function() { renderMap(); updateMapStats(); });
    setInterval(function() { loadTerritories().then(function() { renderMap(); updateMapStats(); }); }, 30000);
});

function renderMap() {
    var grid = document.getElementById('mapGrid');
    if (!grid) return;
    grid.innerHTML = '';

    var regions = {};
    TERRITORIES_MAP.forEach(function(t) {
        if (!regions[t.region]) regions[t.region] = [];
        regions[t.region].push(t);
    });

    var regionOrder = ['Barrios Bajos','Industrias','Centro','Vespucci','Great Ocean','Norte'];

    regionOrder.forEach(function(regionName) {
        if (!regions[regionName]) return;
        var label = document.createElement('div');
        label.className = 'region-label';
        label.textContent = regionName;
        grid.appendChild(label);

        var row = document.createElement('div');
        row.className = 'region-row';
        regions[regionName].forEach(function(territory) {
            row.appendChild(createTerritoryCell(territory));
        });
        grid.appendChild(row);
    });
}

function createTerritoryCell(territory) {
    var now = Date.now();
    var t = getTerritoryByName(territory.name);
    var cell = document.createElement('div');
    cell.className = 'territory-cell';
    var count = 0;
    var status = 'no-graffiti';
    var countClass = 'zero';
    var graffitiDetails = [];

    if (t) {
        count = getTotalGraffitiCount(t);
        var worst = 'active';
        t.graffitis.forEach(function(g) {
            var tr = (g.date + DURACION_GRAFFITI) - now;
            var gStatus, gTimeText;
            if (tr <= 0) {
                var horas = Math.floor((now - g.date) / 36e5);
                if (horas <= 48) {
                    gStatus = 'expired';
                    gTimeText = (48-horas) + 'h';
                    worst = 'expired';
                } else {
                    gStatus = 'deleted';
                    gTimeText = 'elim';
                }
            } else if (tr <= ALERTA_ANTICIPACION) {
                gStatus = 'warning';
                gTimeText = Math.ceil(tr/36e5) + 'h';
                if (worst !== 'expired') worst = 'warning';
            } else {
                gStatus = 'active';
                gTimeText = Math.ceil(tr/864e5) + 'd';
            }
            if (gStatus !== 'deleted') {
                graffitiDetails.push({ status: gStatus, time: gTimeText, qty: g.quantity || 1, date: g.date });
            }
        });
        status = count > 0 ? worst : 'no-graffiti';
        if (count <= 2) countClass = 'low';
        else if (count <= 5) countClass = 'medium';
        else countClass = 'high';
    }

    cell.classList.add(status);
    var html = '<div class="territory-name">' + territory.name + '</div>';
    html += '<div class="territory-count ' + countClass + '">' + count + '</div>';
    if (graffitiDetails.length > 0) {
        html += '<div class="territory-details-list">';
        graffitiDetails.forEach(function(g) {
            html += '<div class="territory-detail-item detail-' + g.status + '">';
            html += '<span class="detail-qty">x' + g.qty + '</span>';
            html += '<span class="detail-time">' + g.time + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    cell.innerHTML = html;
    return cell;
}

function updateMapStats() {
    var conGrafitis = 0, totalGrafitis = 0;
    territories.forEach(function(t) {
        var c = getTotalGraffitiCount(t);
        if (c > 0) conGrafitis++;
        totalGrafitis += c;
    });
    document.getElementById('conGrafitis').textContent = conGrafitis;
    document.getElementById('sinGrafitis').textContent = TERRITORIES_MAP.length - conGrafitis;
    document.getElementById('totalGrafitis').textContent = totalGrafitis;
}
