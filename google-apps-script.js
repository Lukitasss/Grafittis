function doGet(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback;
  var result;

  switch(action) {
    case 'get': result = getTerritories(); break;
    case 'add': result = addTerritory(e.parameter); break;
    case 'update': result = updateTerritory(e.parameter); break;
    case 'delete': result = deleteTerritory(e.parameter.name); break;
    default: result = getTerritories();
  }

  if (callback) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonResponse(result);
}

function getTerritories() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Territorios');
  if (!sheet) { createSheet(); return { territories: [] }; }

  var data = sheet.getDataRange().getValues();
  var territories = [];

  for (var i = 1; i < data.length; i++) {
    territories.push({
      name: data[i][0],
      graffitis: JSON.parse(data[i][1] || '[]')
    });
  }

  return { territories: territories };
}

function addTerritory(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Territorios');
  if (!sheet) { createSheet(); sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Territorios'); }

  var name = params.name || '';
  var grafitis = JSON.parse(params.graffitis || '[]');

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === name) {
      var existing = JSON.parse(data[i][1] || '[]');
      existing = existing.concat(grafitis);
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(existing));
      return { success: true };
    }
  }

  sheet.appendRow([name, JSON.stringify(grafitis)]);
  return { success: true };
}

function deleteTerritory(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Territorios');
  if (!sheet) return { success: false };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === name) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

function createSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Territorios');
  if (!sheet) {
    sheet = ss.insertSheet('Territorios');
    sheet.appendRow(['name', 'graffitis']);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}