/* KB Stone Pro - Admin Panel System */

// Default configuration (used for reset)
var DEFAULT_CFG = {
  blocks: {
    'mc': { n: '1000Ã—350Ã—350 Cream', p: 28, h: 0.35, l: 1, hd: 1 },
    'mn': { n: '1000Ã—350Ã—350 Natural', p: 36, h: 0.35, l: 1, hd: 1.3 },
    'mg': { n: '1000Ã—350Ã—350 Grey', p: 23, h: 0.35, l: 1, hd: 1.7 },
    'sc': { n: '500Ã—350Ã—200 Cream', p: 18, h: 0.2, l: 0.5, hd: 1 },
    'sn': { n: '500Ã—350Ã—200 Natural', p: 22, h: 0.2, l: 0.5, hd: 1.3 },
    'sg': { n: '500Ã—350Ã—200 Grey', p: 15, h: 0.2, l: 0.5, hd: 1.7 }
  },
  mat: { cement: 11, sand: 40, cap: 12, pipe: 15, reo: 12, oxide: 25, stick: 30 },
  equip: { staff: 2000, mob: 1.5, del: 120 },
  cut: { base: 3.5, blade: 0.5 },
  rate: { waste: 8, profit: 20, gst: 10, bph: 18 },
  skipPrices: { 2: 300, 3: 350, 4: 400, 6: 600 }
};

// Skip bin prices (separate from CFG for easy update)
var skipPrices = { 2: 300, 3: 350, 4: 400, 6: 600 };

// Load settings from localStorage
function loadSettings() {
  var saved = localStorage.getItem('kbStoneSettings');
  if (saved) {
    try {
      var settings = JSON.parse(saved);
      if (settings.blocks) CFG.blocks = settings.blocks;
      if (settings.mat) CFG.mat = settings.mat;
      if (settings.equip) CFG.equip = settings.equip;
      if (settings.cut) CFG.cut = settings.cut;
      if (settings.rate) CFG.rate = settings.rate;
      if (settings.skipPrices) skipPrices = settings.skipPrices;
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }
  
  if (localStorage.getItem('kbStoneDarkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
}

function saveSettings() {
  var settings = {
    blocks: CFG.blocks,
    mat: CFG.mat,
    equip: CFG.equip,
    cut: CFG.cut,
    rate: CFG.rate,
    skipPrices: skipPrices
  };
  localStorage.setItem('kbStoneSettings', JSON.stringify(settings));
  showToast();
  calcAll();
}

function showToast(message) {
  var toast = document.getElementById('toast');
  if (message) toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2000);
}

function toggleAdmin() {
  var panel = document.getElementById('adminPanel');
  var overlay = document.getElementById('adminOverlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('open');
  
  if (panel.classList.contains('open')) {
    populateAdminFields();
  }
}

function toggleAdminSection(section) {
  var sectionMap = {
    'blocks': 'adminBlocks',
    'materials': 'adminMaterials',
    'equipment': 'adminEquipment',
    'rates': 'adminRates',
    'theme': 'adminTheme',
    'icons': 'adminIcons'
  };
  
  var el = document.getElementById(sectionMap[section]);
  if (el) {
    el.parentElement.classList.toggle('open');
  }
}

function populateAdminFields() {
  document.getElementById('matCement').value = CFG.mat.cement;
  document.getElementById('matSand').value = CFG.mat.sand;
  document.getElementById('matCap').value = CFG.mat.cap;
  document.getElementById('matPipe').value = CFG.mat.pipe;
  document.getElementById('matReo').value = CFG.mat.reo;
  document.getElementById('matOxide').value = CFG.mat.oxide;
  document.getElementById('matStick').value = CFG.mat.stick;
  
  document.getElementById('equipStaff').value = CFG.equip.staff;
  document.getElementById('equipMob').value = CFG.equip.mob;
  document.getElementById('equipDel').value = CFG.equip.del;
  
  document.getElementById('skip2').value = skipPrices[2];
  document.getElementById('skip3').value = skipPrices[3];
  document.getElementById('skip4').value = skipPrices[4];
  document.getElementById('skip6').value = skipPrices[6];
  
  document.getElementById('cutBase').value = CFG.cut.base;
  document.getElementById('cutBlade').value = CFG.cut.blade;
  
  document.getElementById('rateWaste').value = CFG.rate.waste;
  document.getElementById('rateProfit').value = CFG.rate.profit;
  document.getElementById('rateGst').value = CFG.rate.gst;
  document.getElementById('rateBph').value = CFG.rate.bph;
  
  var darkModeOn = document.body.classList.contains('dark-mode');
  document.getElementById('togDarkMode').classList.toggle('on', darkModeOn);
  
  renderBlockTypes();
  updateSkipSelect();
}

function renderBlockTypes() {
  var html = '';
  for (var code in CFG.blocks) {
    var b = CFG.blocks[code];
    html += '<div class="block-type-item" data-code="' + code + '">';
    html += '<div class="info">';
    html += '<div class="name">' + b.n + '</div>';
    html += '<div class="details">$' + b.p + ' | H:' + b.h + 'm | L:' + b.l + 'm | HD:' + b.hd + '</div>';
    html += '</div>';
    html += '<div class="actions">';
    html += '<button class="del-btn" onclick="deleteBlockType(\'' + code + '\')">Ã—</button>';
    html += '</div>';
    html += '</div>';
  }
  document.getElementById('blockTypeList').innerHTML = html;
}

function addBlockType() {
  var code = document.getElementById('newBlockCode').value.trim().toLowerCase();
  var name = document.getElementById('newBlockName').value.trim();
  var price = parseFloat(document.getElementById('newBlockPrice').value) || 0;
  var height = parseFloat(document.getElementById('newBlockHeight').value) || 0.35;
  var length = parseFloat(document.getElementById('newBlockLength').value) || 1;
  var hd = parseFloat(document.getElementById('newBlockHD').value) || 1;
  
  if (!code || !name || price <= 0) {
    alert('Please fill in code, name, and price');
    return;
  }
  
  if (CFG.blocks[code]) {
    alert('Block code already exists');
    return;
  }
  
  CFG.blocks[code] = { n: name, p: price, h: height, l: length, hd: hd };
  
  document.getElementById('newBlockCode').value = '';
  document.getElementById('newBlockName').value = '';
  document.getElementById('newBlockPrice').value = '';
  document.getElementById('newBlockHeight').value = '';
  document.getElementById('newBlockLength').value = '';
  document.getElementById('newBlockHD').value = '1';
  
  saveSettings();
  renderBlockTypes();
  render();
}

function deleteBlockType(code) {
  if (Object.keys(CFG.blocks).length <= 1) {
    alert('Cannot delete the last block type');
    return;
  }
  
  if (confirm('Delete block type "' + CFG.blocks[code].n + '"?')) {
    delete CFG.blocks[code];
    
    var firstCode = Object.keys(CFG.blocks)[0];
    groups.forEach(function(g) {
      if (g.bt === code) g.bt = firstCode;
    });
    
    saveSettings();
    renderBlockTypes();
    render();
  }
}

function updateMaterial(key) {
  var inputId = 'mat' + key.charAt(0).toUpperCase() + key.slice(1);
  var value = parseFloat(document.getElementById(inputId).value) || 0;
  CFG.mat[key] = value;
  saveSettings();
}

function updateEquipment(key) {
  var inputId = 'equip' + key.charAt(0).toUpperCase() + key.slice(1);
  var value = parseFloat(document.getElementById(inputId).value) || 0;
  CFG.equip[key] = value;
  saveSettings();
}

function updateSkipPrice(size) {
  var value = parseFloat(document.getElementById('skip' + size).value) || 0;
  skipPrices[size] = value;
  updateSkipSelect();
  saveSettings();
}

function updateSkipSelect() {
  var select = document.getElementById('skipSize');
  if (select) {
    select.innerHTML = 
      '<option value="' + skipPrices[2] + '">2mÂ³ â€” $' + skipPrices[2] + '</option>' +
      '<option value="' + skipPrices[3] + '">3mÂ³ â€” $' + skipPrices[3] + '</option>' +
      '<option value="' + skipPrices[4] + '" selected>4mÂ³ â€” $' + skipPrices[4] + '</option>' +
      '<option value="' + skipPrices[6] + '">6mÂ³ â€” $' + skipPrices[6] + '</option>';
  }
}

function updateCutting(key) {
  var inputId = 'cut' + key.charAt(0).toUpperCase() + key.slice(1);
  var value = parseFloat(document.getElementById(inputId).value) || 0;
  CFG.cut[key] = value;
  saveSettings();
}

function updateRate(key) {
  var inputId = 'rate' + key.charAt(0).toUpperCase() + key.slice(1);
  var value = parseFloat(document.getElementById(inputId).value) || 0;
  CFG.rate[key] = value;
  saveSettings();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  var isDark = document.body.classList.contains('dark-mode');
  document.getElementById('togDarkMode').classList.toggle('on', isDark);
  localStorage.setItem('kbStoneDarkMode', isDark.toString());
  showToast(isDark ? 'Dark Mode On' : 'Light Mode On');
}

function handleIconUpload(size) {
  var inputId = 'icon' + size + 'Upload';
  var file = document.getElementById(inputId).files[0];
  
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result;
    localStorage.setItem('kbStoneIcon' + size, base64);
    showToast('Icon saved! Re-install PWA to apply.');
  };
  reader.readAsDataURL(file);
}

function resetToDefaults() {
  if (confirm('Reset all settings to defaults? This cannot be undone.')) {
    CFG.blocks = JSON.parse(JSON.stringify(DEFAULT_CFG.blocks));
    CFG.mat = JSON.parse(JSON.stringify(DEFAULT_CFG.mat));
    CFG.equip = JSON.parse(JSON.stringify(DEFAULT_CFG.equip));
    CFG.cut = JSON.parse(JSON.stringify(DEFAULT_CFG.cut));
    CFG.rate = JSON.parse(JSON.stringify(DEFAULT_CFG.rate));
    skipPrices = JSON.parse(JSON.stringify(DEFAULT_CFG.skipPrices));
    
    localStorage.removeItem('kbStoneSettings');
    localStorage.removeItem('kbStoneDarkMode');
    localStorage.removeItem('kbStoneIcon192');
    localStorage.removeItem('kbStoneIcon512');
    localStorage.removeItem('kbStoneIcon180');
    
    document.body.classList.remove('dark-mode');
    
    populateAdminFields();
    updateSkipSelect();
    render();
    calcAll();
    
    showToast('Reset to defaults');
  }
}

// Initialize admin on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    updateSkipSelect();
  });
} else {
  loadSettings();
  updateSkipSelect();
}
