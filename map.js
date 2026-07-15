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
    var timeText = '';
    var countClass = 'zero';

    if (t) {
        count = getTotalGraffitiCount(t);
        var worst = 'active';
        var soonest = Infinity;
        t.graffitis.forEach(function(g) {
            var tr = (g.date + DURACION_GRAFFITI) - now;
            if (tr <= 0 && Math.floor((now-g.date)/36e5) <= 48) worst = 'expired';
            else if (tr <= ALERTA_ANTICIPACION && worst !== 'expired') worst = 'warning';
            if (tr > 0 && tr < soonest) soonest = tr;
        });
        status = count > 0 ? worst : 'no-graffiti';
        if (count > 0) {
            if (soonest <= Infinity && soonest > 0) timeText = Math.ceil(soonest/864e5) + 'd';
            else if (worst === 'expired') timeText = 'Expirado';
        }
        if (count <= 2) countClass = 'low';
        else if (count <= 5) countClass = 'medium';
        else countClass = 'high';
    }

    cell.classList.add(status);
    cell.innerHTML = '<div class="territory-name">' + territory.name + '</div>' +
        '<div class="territory-count ' + countClass + '">' + count + '</div>' +
        (timeText ? '<div class="territory-time">' + timeText + '</div>' : '');
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
