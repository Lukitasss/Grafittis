document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('addGraffitiBtn')) return;

    loadTerritories().then(function() { updateStats(); renderTerritories(); checkExpirations(); });
    addExportImportButtons();

    document.getElementById('addGraffitiBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModal').addEventListener('click', closeModalFn);
    document.getElementById('cancelModal').addEventListener('click', closeModalFn);
    document.getElementById('graffitiForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('editForm').addEventListener('submit', saveEditForm);
    document.getElementById('searchInput').addEventListener('input', function(e){renderTerritories(e.target.value);});

    setInterval(function(){loadTerritories().then(function(){updateStats();renderTerritories(document.getElementById('searchInput').value);checkExpirations();});},60000);
});

function closeModalFn() { document.getElementById('addGraffitiModal').classList.remove('active'); }

function openAddModal() {
    var sel = document.getElementById('territorySelect');
    sel.innerHTML = '<option value="">-- Seleccionar territorio --</option>';
    var allNames = [];
    TERRITORIES_MAP.forEach(function(t) { allNames.push(t.name); });
    territories.forEach(function(t) { if (allNames.indexOf(t.name) < 0) allNames.push(t.name); });
    allNames.sort();
    allNames.forEach(function(name) {
        var existing = getTerritoryByName(name);
        var count = existing ? getTotalGraffitiCount(existing) : 0;
        var opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name + (count > 0 ? ' (' + count + ' grafitis)' : '');
        sel.appendChild(opt);
    });
    document.getElementById('graffitiDate').value = new Date().toISOString().slice(0,16);
    document.getElementById('newTerritoryGroup').style.display = 'none';
    sel.onchange = function() {
        document.getElementById('newTerritoryGroup').style.display = sel.value ? 'none' : 'block';
    };
    document.getElementById('addGraffitiModal').classList.add('active');
}

function handleFormSubmit(e) {
    e.preventDefault();
    var selectVal = document.getElementById('territorySelect').value;
    var newName = document.getElementById('territoryName').value.trim();
    var date = new Date(document.getElementById('graffitiDate').value);
    var notes = document.getElementById('graffitiNotes').value.trim();
    var quantity = parseInt(document.getElementById('graffitiQuantity').value);
    var territoryName = selectVal || newName;

    if (!territoryName || isNaN(date.getTime())) { showNotification('Completa todos los campos','danger'); return; }

    var existing = getTerritoryByName(territoryName);
    if (existing) {
        existing.graffitis.push({date: date.getTime(), quantity: quantity, notes: notes});
    } else {
        territories.push({name: territoryName, graffitis: [{date: date.getTime(), quantity: quantity, notes: notes}]});
    }

    saveToLocalStorage();
    updateStats();
    renderTerritories(document.getElementById('searchInput').value);
    document.getElementById('graffitiForm').reset();
    closeModalFn();
    showNotification('Grafiti registrado en "' + territoryName + '"','success');
}

function renewGraffiti(territoryName, graffitiIndex) {
    var t = getTerritoryByName(territoryName);
    if (!t || !t.graffitis[graffitiIndex]) return;

    var entry = t.graffitis[graffitiIndex];
    var modal = document.getElementById('editModal');
    var form = document.getElementById('editForm');
    document.getElementById('editTerritoryName').value = territoryName;
    document.getElementById('editGraffitiIndex').value = graffitiIndex;
    document.getElementById('editDate').value = new Date(entry.date).toISOString().slice(0,16);
    document.getElementById('editQuantity').value = entry.quantity || 1;
    document.getElementById('editNotes').value = entry.notes || '';
    document.getElementById('editModalTitle').textContent = 'Renovar Grafiti - ' + territoryName;
    modal.classList.add('active');
}

function editGraffiti(territoryName, graffitiIndex) {
    var t = getTerritoryByName(territoryName);
    if (!t || !t.graffitis[graffitiIndex]) return;

    var entry = t.graffitis[graffitiIndex];
    var modal = document.getElementById('editModal');
    document.getElementById('editTerritoryName').value = territoryName;
    document.getElementById('editGraffitiIndex').value = graffitiIndex;
    document.getElementById('editDate').value = new Date(entry.date).toISOString().slice(0,16);
    document.getElementById('editQuantity').value = entry.quantity || 1;
    document.getElementById('editNotes').value = entry.notes || '';
    document.getElementById('editModalTitle').textContent = 'Editar Grafiti - ' + territoryName;
    modal.classList.add('active');
}

function saveEditForm(e) {
    e.preventDefault();
    var tName = document.getElementById('editTerritoryName').value;
    var idx = parseInt(document.getElementById('editGraffitiIndex').value);
    var newDate = new Date(document.getElementById('editDate').value).getTime();
    var newQty = parseInt(document.getElementById('editQuantity').value);
    var newNotes = document.getElementById('editNotes').value.trim();

    var t = getTerritoryByName(tName);
    if (!t || isNaN(newDate)) { showNotification('Error','danger'); return; }

    t.graffitis[idx].date = newDate;
    t.graffitis[idx].quantity = newQty;
    t.graffitis[idx].notes = newNotes;

    saveToLocalStorage();
    updateStats();
    renderTerritories(document.getElementById('searchInput').value);
    document.getElementById('editModal').classList.remove('active');
    showNotification('Grafiti actualizado','success');
}

function deleteGraffiti(territoryName, graffitiIndex) {
    var t = getTerritoryByName(territoryName);
    if (!t) return;
    if (!confirm('Eliminar este grafiti?')) return;
    t.graffitis.splice(graffitiIndex, 1);
    if (t.graffitis.length === 0) {
        territories = territories.filter(function(x){return x.name !== territoryName;});
    }
    saveToLocalStorage();
    updateStats();
    renderTerritories(document.getElementById('searchInput').value);
    showNotification('Grafiti eliminado','warning');
}

function deleteTerritory(name) {
    if (!confirm('Eliminar "' + name + '" y todos sus grafitis?')) return;
    territories = territories.filter(function(t){return t.name !== name;});
    saveToLocalStorage();
    updateStats();
    renderTerritories(document.getElementById('searchInput').value);
    showNotification('"'+name+'" eliminado','warning');
}

function renderTerritories(filter) {
    var grid = document.getElementById('territoriesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var f = filter ? territories.filter(function(t){return t.name.toLowerCase().indexOf(filter.toLowerCase())>=0;}) : territories;
    if (f.length===0) { document.getElementById('emptyState').style.display='block'; grid.style.display='none'; return; }
    document.getElementById('emptyState').style.display='none';
    grid.style.display='block';

    var regionOrder = ['Barrios Bajos','Industrias','Centro','Vespucci','Great Ocean','Norte'];
    var regions = {};
    TERRITORIES_MAP.forEach(function(tm) {
        if (!regions[tm.region]) regions[tm.region] = [];
        var found = null;
        f.forEach(function(t) { if (t.name === tm.name) found = t; });
        if (found) regions[tm.region].push(found);
    });
    f.forEach(function(t) {
        var inMap = false;
        TERRITORIES_MAP.forEach(function(tm) { if (tm.name === t.name) inMap = true; });
        if (!inMap) {
            if (!regions['Otros']) regions['Otros'] = [];
            regions['Otros'].push(t);
        }
    });

    regionOrder.forEach(function(regionName) {
        if (!regions[regionName] || regions[regionName].length === 0) return;
        var section = document.createElement('div');
        section.className = 'region-section';
        var label = document.createElement('div');
        label.className = 'region-label-index';
        label.textContent = regionName;
        section.appendChild(label);
        var cardsContainer = document.createElement('div');
        cardsContainer.className = 'region-cards';
        regions[regionName].forEach(function(t) { cardsContainer.appendChild(createTerritoryCard(t)); });
        section.appendChild(cardsContainer);
        grid.appendChild(section);
    });
    if (regions['Otros']) {
        var section = document.createElement('div');
        section.className = 'region-section';
        var label = document.createElement('div');
        label.className = 'region-label-index';
        label.textContent = 'Otros';
        section.appendChild(label);
        var cardsContainer = document.createElement('div');
        cardsContainer.className = 'region-cards';
        regions['Otros'].forEach(function(t) { cardsContainer.appendChild(createTerritoryCard(t)); });
        section.appendChild(cardsContainer);
        grid.appendChild(section);
    }
}

function createTerritoryCard(territory) {
    var now = Date.now();
    var activeGraffitis = getActiveGraffitis(territory);
    var total = getTotalGraffitiCount(territory);

    var worstStatus = 'active';
    activeGraffitis.forEach(function(g) {
        var tr = (g.date + DURACION_GRAFFITI) - now;
        if (tr <= 0) worstStatus = 'expired';
        else if (tr <= ALERTA_ANTICIPACION && worstStatus !== 'expired') worstStatus = 'warning';
    });
    if (activeGraffitis.length === 0 && territory.graffitis.length > 0) worstStatus = 'deleted';

    var card = document.createElement('div');
    card.className = 'territory-card status-' + worstStatus;

    var html = '<div class="territory-header"><div><div class="territory-name">' + territory.name + '</div>';
    html += '<span class="territory-status">' + total + ' grafitis</span></div></div>';
    html += '<div class="territory-graffiti-list">';

    territory.graffitis.forEach(function(g, idx) {
        var tr = (g.date + DURACION_GRAFFITI) - now;
        var status, timeText;

        if (tr <= 0) {
            var horas = Math.floor((now - g.date) / 36e5);
            if (horas <= 48) {
                status = 'expired';
                timeText = 'Expirado - ' + (48-horas) + 'h';
            } else {
                status = 'deleted';
                timeText = 'Eliminado';
            }
        } else if (tr <= ALERTA_ANTICIPACION) {
            status = 'warning';
            timeText = Math.ceil(tr/36e5) + 'h';
        } else {
            status = 'active';
            timeText = Math.ceil(tr/864e5) + 'd';
        }

        if (status === 'deleted') return;

        html += '<div class="graffiti-entry status-border-' + status + '">';
        html += '<div class="graffiti-info">';
        html += '<div class="graffiti-date">' + formatDateShort(new Date(g.date)) + ' - x' + (g.quantity||1) + '</div>';
        html += '<div class="graffiti-time status-text-' + status + '">' + timeText + '</div>';
        if (g.notes) html += '<div class="graffiti-notes">' + g.notes + '</div>';
        html += '</div>';
        html += '<div class="graffiti-actions">';
        if (status !== 'deleted') {
            html += '<button class="btn-tiny btn-blue" onclick="editGraffiti(\'' + territory.name.replace(/'/g,"\\'") + '\',' + idx + ')">Editar</button>';
            html += '<button class="btn-tiny btn-green" onclick="renewGraffiti(\'' + territory.name.replace(/'/g,"\\'") + '\',' + idx + ')">Renovar</button>';
        }
        html += '<button class="btn-tiny btn-red" onclick="deleteGraffiti(\'' + territory.name.replace(/'/g,"\\'") + '\',' + idx + ')">X</button>';
        html += '</div></div>';
    });

    html += '</div>';
    card.innerHTML = html;
    return card;
}

function updateStats() {
    var now=Date.now(),a=0,w=0,e=0;
    territories.forEach(function(t) {
        var worst = 'active';
        t.graffitis.forEach(function(g) {
            var tr = (g.date + DURACION_GRAFFITI) - now;
            if (tr <= 0 && Math.floor((now-g.date)/36e5) <= 48) worst = 'expired';
            else if (tr <= ALERTA_ANTICIPACION && worst !== 'expired') worst = 'warning';
        });
        if (worst === 'active') a++;
        else if (worst === 'warning') w++;
        else if (worst === 'expired') e++;
    });
    document.getElementById('totalTerritorios').textContent = territories.length;
    document.getElementById('activos').textContent = a;
    document.getElementById('porRenovar').textContent = w;
    document.getElementById('expirados').textContent = e;
}

function checkExpirations() {
    var now=Date.now();
    territories.forEach(function(t) {
        t.graffitis.forEach(function(g) {
            var tr=(g.date+DURACION_GRAFFITI)-now;
            if(tr>0&&tr<=ALERTA_ANTICIPACION) showNotification('"'+t.name+'" expira en '+Math.ceil(tr/36e5)+'h','warning');
        });
    });
}

function exportData() {
    var l=document.createElement('a');l.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(territories,null,2));l.download='territorios.json';l.click();
    showNotification('Datos exportados','success');
}

function importData() {
    var i=document.createElement('input');i.type='file';i.accept='.json';
    i.onchange=function(e){var r=new FileReader();r.onload=function(ev){try{var d=JSON.parse(ev.target.result);if(Array.isArray(d)){territories=d;saveToLocalStorage();updateStats();renderTerritories();showNotification('Datos importados','success');}}catch(err){showNotification('Error','danger');}};r.readAsText(e.target.files[0]);};
    i.click();
}

function addExportImportButtons() {
    var c=document.querySelector('.controls');if(!c)return;
    var e=document.createElement('button');e.className='btn btn-secondary';e.innerHTML='<span class="icon">↓</span> Exportar';e.onclick=exportData;
    var m=document.createElement('button');m.className='btn btn-secondary';m.innerHTML='<span class="icon">↑</span> Importar';m.onclick=importData;
    c.appendChild(e);c.appendChild(m);
}
