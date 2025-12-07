/* KB Stone Pro - App Logic v2 with Phase 1 Enhancements */

var CFG = {
  blocks: {
    'mc': { n: '1000×350×350 Cream', p: 28, h: 0.35, l: 1, hd: 1 },
    'mn': { n: '1000×350×350 Natural', p: 36, h: 0.35, l: 1, hd: 1.3 },
    'mg': { n: '1000×350×350 Grey', p: 23, h: 0.35, l: 1, hd: 1.7 },
    'sc': { n: '500×350×200 Cream', p: 18, h: 0.2, l: 0.5, hd: 1 },
    'sn': { n: '500×350×200 Natural', p: 22, h: 0.2, l: 0.5, hd: 1.3 },
    'sg': { n: '500×350×200 Grey', p: 15, h: 0.2, l: 0.5, hd: 1.7 }
  },
  mat: { cement: 11, sand: 40, cap: 12, pipe: 15, reo: 12, oxide: 25, stick: 30 },
  equip: { staff: 2000, mob: 1.5, del: 120 },
  cut: { base: 3.5, blade: 0.5 },
  rate: { waste: 8, profit: 20, gst: 10, bph: 18 },
  // WA SUBSTRATE SYSTEM
  soil: {
    sand:     { hardness: 0.9, cutMultiplier: 0.8, wasteAdd: 0 },
    clay:     { hardness: 1.2, cutMultiplier: 1.1, wasteAdd: 2 },
    limestone:{ hardness: 1.6, cutMultiplier: 1.5, wasteAdd: 4 }
  }
};

var groups = [];
var gid = 0;
var view = 'int';
var projectType = 'Retaining Wall';
var soilType = 'sand';

// Universal dimension parser for height and length
// Accepts mm (whole numbers) or m (decimals)
function parseDimension(input) {
  if (input === null || input === undefined || input === '') {
    return 0;
  }
  
  input = input.toString().trim();
  
  // Whole number = mm
  if (/^\d+$/.test(input)) {
    var mm = Number(input);
    if (mm < 100) {
      throw new Error("Value too small. Use millimetres (e.g. 500) or metres (e.g. 0.5).");
    }
    return mm / 1000; // convert to metres
  }
  
  // Decimal = metres
  if (/^\d*\.\d+$/.test(input)) {
    return Number(input);
  }
  
  // If we get here, invalid format
  if (input !== '0') {
    throw new Error("Invalid format. Use mm (e.g. 600) or m (e.g. 0.6).");
  }
  
  return 0;
}

// Show error message to user
function showError(message) {
  alert(message);
}

// Load settings from localStorage
function loadAppSettings() {
  // Load soil type
  var savedSoil = localStorage.getItem('kbStoneSoilType');
  if (savedSoil && CFG.soil[savedSoil]) {
    soilType = savedSoil;
  }
  
  // Load project type
  var savedProject = localStorage.getItem('kbStoneProjectType');
  if (savedProject) {
    projectType = savedProject;
  }
}

// Save soil type to localStorage
function saveSoilType() {
  localStorage.setItem('kbStoneSoilType', soilType);
}

// Save project type to localStorage
function saveProjectType() {
  localStorage.setItem('kbStoneProjectType', projectType);
}

// Initialize
function init() {
  loadAppSettings();
  
  var d = new Date();
  document.getElementById('qNum').value = 'KB-' + d.getFullYear() + 
    String(d.getMonth() + 1).padStart(2, '0') + 
    String(d.getDate()).padStart(2, '0') + '-001';
  document.getElementById('qDate').value = d.toISOString().split('T')[0];
  
  // Set loaded values
  var soilEl = document.getElementById('soilType');
  if (soilEl) soilEl.value = soilType;
  
  var projEl = document.getElementById('pType');
  if (projEl) projEl.value = projectType;
  
  addGroup();
}

// View Toggle
function setView(v) {
  view = v;
  document.getElementById('btnInt').className = v === 'int' ? 'active' : '';
  var btnCli = document.getElementById('btnCli');
  if (btnCli) btnCli.className = v === 'cli' ? 'active' : '';
  document.getElementById('intBox').className = v === 'int' ? 'internal' : 'internal hide';
}

// Skip Bin Toggle
function togSkip() {
  document.getElementById('togSkip').classList.toggle('on');
  document.getElementById('skipSec').classList.toggle('hide');
  calcAll();
}

// Handle project type change
function handleProjectTypeChange() {
  var pTypeEl = document.getElementById('pType');
  if (pTypeEl) {
    projectType = pTypeEl.value;
    saveProjectType();
    render();
    calcAll();
  }
}

// Handle soil type change
function handleSoilTypeChange() {
  var soilEl = document.getElementById('soilType');
  if (soilEl) {
    soilType = soilEl.value;
    saveSoilType();
    calcAll();
  }
}

// Add Block Group
function addGroup() {
  groups.push({
    id: ++gid,
    open: true,
    bt: 'mc',
    wl: 0,
    wh: 0,
    bo: 0,
    ct: 0,
    cq: 0,
    cap: 0,
    drain: 0,
    reo: 0,
    oxide: 0,
    stick: 0,
    // Corner system
    corners: [],
    wallRuns: [{ length: 0 }],
    // Retaining Wall Slope fields
    slopeStartH: 0,
    slopeEndH: 0,
    // Stairs/Steps fields
    stairSteps: 0,
    stairHeight: 200,
    stairDepth: 300,
    diagram: null
  });
  render();
  calcAll();
}

// Delete Block Group
function delGroup(id) {
  if (groups.length < 2) {
    alert('Need at least one group');
    return;
  }
  groups = groups.filter(function(g) { return g.id !== id; });
  render();
  calcAll();
}

// Toggle Group Expand/Collapse
function togGroup(id) {
  groups.forEach(function(g) {
    if (g.id === id) g.open = !g.open;
  });
  render();
}

// Update Group Field
function upd(id, k, v) {
  // For height/length fields, validate the dimension
  if (k === 'wh' || k === 'wl') {
    try {
      parseDimension(v); // This will throw if invalid
    } catch (e) {
      showError(e.message);
      return; // Don't update with invalid value
    }
  }
  
  groups.forEach(function(g) {
    if (g.id === id) g[k] = v;
  });
  calcAll();
}

// Add corner to group
function addCorner(id) {
  groups.forEach(function(g) {
    if (g.id === id) {
      g.wallRuns.push({ length: 0 });
    }
  });
  render();
  calcAll();
}

// Remove corner from group
function removeCorner(id, idx) {
  groups.forEach(function(g) {
    if (g.id === id && g.wallRuns.length > 1) {
      g.wallRuns.splice(idx, 1);
    }
  });
  render();
  calcAll();
}

// Update wall run length
function updWallRun(id, idx, val) {
  // Validate the dimension input
  try {
    parseDimension(val); // This will throw if invalid
  } catch (e) {
    showError(e.message);
    return; // Don't update with invalid value
  }
  
  groups.forEach(function(g) {
    if (g.id === id && g.wallRuns[idx]) {
      // Store the raw value, parseDimension will handle it in calcGroup
      g.wallRuns[idx].length = val;
    }
  });
  calcAll();
}

// RETAINING WALL SLOPE CALCULATOR
function calcSlope(g, b) {
  var startH = parseFloat(g.slopeStartH) || 0;
  var endH = parseFloat(g.slopeEndH) || 0;
  
  if (startH <= 0 && endH <= 0) {
    return null;
  }
  
  var avgHeight = (startH + endH) / 2;
  var heightDiff = Math.abs(endH - startH);
  
  // Buried courses: max of 2 courses or one-third of average height
  var minBuriedHeight = b.h * 2; // minimum 2 courses
  var thirdHeight = avgHeight * 0.33;
  var buriedHeight = Math.max(minBuriedHeight, thirdHeight);
  var buriedCourses = Math.ceil(buriedHeight / b.h);
  
  // Calculate wall length
  var totalWallLength = 0;
  try {
    totalWallLength = parseDimension(g.wl);
  } catch (e) {
    totalWallLength = 0;
  }
  
  // Buried blocks
  var bpm = 1 / b.l;
  var buriedBlocks = Math.ceil(totalWallLength * bpm * buriedCourses);
  
  // Triangle blocks for slope transition
  var triangleArea = (heightDiff * totalWallLength) / 2;
  var blockArea = b.h * b.l;
  var triangleBlocks = Math.ceil(triangleArea / blockArea);
  
  return {
    avgHeight: avgHeight,
    buriedHeight: buriedHeight,
    buriedCourses: buriedCourses,
    buriedBlocks: buriedBlocks,
    triangleBlocks: triangleBlocks,
    totalExtra: buriedBlocks + triangleBlocks
  };
}

// STAIRS / STEPS CALCULATOR
function calcStairs(g) {
  var steps = parseInt(g.stairSteps) || 0;
  var risePerStep = parseFloat(g.stairHeight) || 200; // mm
  var depthPerStep = parseFloat(g.stairDepth) || 300; // mm
  
  if (steps <= 0) {
    return null;
  }
  
  var totalRise = (steps * risePerStep) / 1000; // convert to meters
  var totalRun = (steps * depthPerStep) / 1000; // convert to meters
  
  // Calculate angle
  var angleRad = Math.atan(totalRise / totalRun);
  var angleDeg = angleRad * (180 / Math.PI);
  
  // Safety check
  var isSafe = angleDeg >= 25 && angleDeg <= 40;
  var warning = null;
  if (!isSafe) {
    if (angleDeg < 25) {
      warning = 'Too shallow - risk of tripping';
    } else {
      warning = 'Too steep - safety hazard';
    }
  }
  
  return {
    totalRise: totalRise,
    totalRun: totalRun,
    angle: angleDeg,
    isSafe: isSafe,
    warning: warning,
    recommended: [30, 33, 35]
  };
}

// Calculate Single Group
function calcGroup(g) {
  var b = CFG.blocks[g.bt];
  var soil = CFG.soil[soilType];
  
  // Calculate total wall length with corner deductions
  var totalWallLength = 0;
  if (g.wallRuns && g.wallRuns.length > 0) {
    var cornerDeduction = b.l / 2; // Half block length for corner
    for (var i = 0; i < g.wallRuns.length; i++) {
      var runLength = 0;
      try {
        // Parse dimension input (handles both mm and m)
        runLength = parseDimension(g.wallRuns[i].length);
      } catch (e) {
        console.error('Error parsing wall run length:', e.message);
        runLength = 0;
      }
      // Apply corner deduction to all runs except the last
      if (i < g.wallRuns.length - 1) {
        runLength = Math.max(0, runLength - cornerDeduction);
      }
      totalWallLength += runLength;
    }
  } else {
    // Fallback to old wl value
    try {
      totalWallLength = parseDimension(g.wl);
    } catch (e) {
      console.error('Error parsing wall length:', e.message);
      totalWallLength = 0;
    }
  }
  
  // Parse wall height
  var wallHeight = 0;
  try {
    wallHeight = parseDimension(g.wh);
  } catch (e) {
    console.error('Error parsing wall height:', e.message);
    wallHeight = 0;
  }
  
  var layers = wallHeight > 0 ? Math.ceil(wallHeight / b.h) : 0;
  var bpm = 1 / b.l;
  var base = Math.ceil(totalWallLength * bpm * layers);
  
  // Check for slope calculation (Retaining Wall only)
  var slopeCalc = null;
  if (projectType === 'Retaining Wall') {
    slopeCalc = calcSlope(g, b);
    if (slopeCalc) {
      base += slopeCalc.totalExtra;
    }
  }
  
  // Check for stairs calculation
  var stairsCalc = null;
  if (projectType === 'Stairs' || projectType === 'Steps') {
    stairsCalc = calcStairs(g);
    if (stairsCalc && g.bo === 0) {
      // Use stairs-specific calculation with 1.5x multiplier
      var stairBlocks = Math.ceil((stairsCalc.totalRise * stairsCalc.totalRun * 1.5) / (b.h * b.l));
      base = stairBlocks;
    }
  }
  
  // Apply soil waste multiplier
  var wastePercent = CFG.rate.waste + soil.wasteAdd;
  var waste = Math.ceil(base * (wastePercent / 100));
  var auto = base + waste;
  
  // Manual override
  var tot = g.bo > 0 ? g.bo : auto;
  var bCost = tot * b.p;
  
  var sandM3 = tot * 0.015;
  var scoops = Math.ceil(sandM3 * 3);
  var sandC = scoops * CFG.mat.sand;
  var bags = Math.ceil(sandM3 / 0.15);
  var cemC = bags * CFG.mat.cement;
  
  // Apply soil cut multiplier
  var cutC = g.cq * g.ct * CFG.cut.base * b.hd * soil.cutMultiplier;
  var bladeC = g.cq * g.ct * CFG.cut.blade;
  var cutHrs = g.cq * g.ct * 0.1;
  
  var capC = g.cap * CFG.mat.cap;
  var drainC = g.drain * CFG.mat.pipe;
  var reoC = g.reo * CFG.mat.reo;
  var oxideC = g.oxide * CFG.mat.oxide;
  var stickC = g.stick * CFG.mat.stick;
  
  // Apply soil hardness to labor hours
  var labHrs = (tot / CFG.rate.bph + cutHrs) * soil.hardness;
  var grpTot = bCost + sandC + cemC + cutC + bladeC + capC + drainC + reoC + oxideC + stickC;
  
  return {
    b: b,
    layers: layers,
    bpm: bpm,
    base: base,
    waste: waste,
    wastePercent: wastePercent,
    auto: auto,
    tot: tot,
    totalWallLength: totalWallLength,
    wallRuns: g.wallRuns,
    bCost: bCost,
    scoops: scoops,
    sandC: sandC,
    bags: bags,
    cemC: cemC,
    cutC: cutC,
    bladeC: bladeC,
    cutHrs: cutHrs,
    capC: capC,
    drainC: drainC,
    reoC: reoC,
    oxideC: oxideC,
    stickC: stickC,
    labHrs: labHrs,
    grpTot: grpTot,
    slopeCalc: slopeCalc,
    stairsCalc: stairsCalc,
    soil: soil
  };
}

// Calculate All & Aggregate
function calcAll() {
  var agg = {
    blks: {},
    scoops: 0,
    bags: 0,
    cap: 0,
    drain: 0,
    reo: 0,
    oxide: 0,
    stick: 0,
    cuts: 0,
    cutC: 0,
    bladeC: 0,
    labHrs: 0,
    matC: 0,
    grps: []
  };

  groups.forEach(function(g) {
    var c = calcGroup(g);
    agg.grps.push({ g: g, c: c });
    
    if (!agg.blks[g.bt]) agg.blks[g.bt] = { n: c.b.n, q: 0, cost: 0 };
    agg.blks[g.bt].q += c.tot;
    agg.blks[g.bt].cost += c.bCost;
    
    agg.scoops += c.scoops;
    agg.bags += c.bags;
    agg.cap += g.cap;
    agg.drain += g.drain;
    agg.reo += g.reo;
    agg.oxide += g.oxide;
    agg.stick += g.stick;
    agg.cuts += g.cq * g.ct;
    agg.cutC += c.cutC;
    agg.bladeC += c.bladeC;
    agg.labHrs += c.labHrs;
    agg.matC += c.grpTot;
  });

  // Equipment
  var staffD = parseFloat(document.getElementById('staffDays').value) || 0;
  var mobK = parseFloat(document.getElementById('mobKm').value) || 0;
  var delL = parseInt(document.getElementById('delLoads').value) || 0;
  var skipOn = document.getElementById('togSkip').classList.contains('on');
  var skipC = skipOn ? parseInt(document.getElementById('skipSize').value) : 0;

  var staffC = staffD * CFG.equip.staff;
  var mobC = mobK * CFG.equip.mob;
  var delC = delL * CFG.equip.del;
  var equipC = staffC + mobC + delC + skipC;

  // Totals
  var sub = agg.matC + equipC;
  var profit = sub * (CFG.rate.profit / 100);
  var gst = (sub + profit) * (CFG.rate.gst / 100);
  var grand = sub + profit + gst;

  // Store in aggregation
  agg.staffD = staffD;
  agg.mobK = mobK;
  agg.delL = delL;
  agg.skipOn = skipOn;
  agg.skipSize = skipOn ? document.getElementById('skipSize').selectedOptions[0].text : '';
  agg.staffC = staffC;
  agg.mobC = mobC;
  agg.delC = delC;
  agg.skipC = skipC;
  agg.equipC = equipC;
  agg.sub = sub;
  agg.profit = profit;
  agg.gst = gst;
  agg.grand = grand;

  // Store globally for PDFs
  window.QD = {
    num: document.getElementById('qNum').value,
    date: document.getElementById('qDate').value,
    name: document.getElementById('cName').value,
    phone: document.getElementById('cPhone').value,
    addr: document.getElementById('cAddr').value,
    type: document.getElementById('pType').value,
    notes: document.getElementById('notes').value,
    soil: soilType,
    agg: agg
  };

  render();
  renderTotals(agg);
}

// Render Block Groups
function render() {
  var h = '';
  var soil = CFG.soil[soilType];
  
  groups.forEach(function(g, i) {
    var c = calcGroup(g);
    var cls = g.open ? 'group open' : 'group';
    
    h += '<div class="' + cls + '">';
    h += '<div class="group-head" onclick="togGroup(' + g.id + ')">';
    h += '<h4><span class="arrow">▼</span> Group ' + (i + 1) + ': ' + c.b.n;
    h += '<span class="sum">' + c.tot + ' blks • $' + c.grpTot.toFixed(0) + '</span></h4>';
    h += '<button class="del-btn" onclick="event.stopPropagation();delGroup(' + g.id + ')">Delete</button>';
    h += '</div>';
    
    h += '<div class="group-body">';
    
    // Block Type Select
    h += '<label>Block Type</label><select onchange="upd(' + g.id + ',\'bt\',this.value)">';
    for (var k in CFG.blocks) {
      var B = CFG.blocks[k];
      h += '<option value="' + k + '"' + (g.bt === k ? ' selected' : '') + '>' + B.n + ' – $' + B.p + '</option>';
    }
    h += '</select>';
    
    // RETAINING WALL SLOPE CALCULATOR
    if (projectType === 'Retaining Wall') {
      h += '<div style="margin-top:10px;background:#e8f4fc;padding:10px;border-radius:6px;border-left:3px solid #00A3E8;">';
      h += '<div style="font-weight:600;margin-bottom:8px;font-size:12px;">⛰️ Slope Calculator</div>';
      h += '<div class="row2">';
      h += '<div><label>Start Height (m)</label><input type="number" value="' + g.slopeStartH + '" step="0.1" onchange="upd(' + g.id + ',\'slopeStartH\',parseFloat(this.value)||0)"></div>';
      h += '<div><label>End Height (m)</label><input type="number" value="' + g.slopeEndH + '" step="0.1" onchange="upd(' + g.id + ',\'slopeEndH\',parseFloat(this.value)||0)"></div>';
      h += '</div>';
      
      if (c.slopeCalc) {
        h += '<div style="margin-top:8px;font-size:11px;color:#0369a1;">';
        h += 'Avg height: ' + c.slopeCalc.avgHeight.toFixed(2) + 'm | ';
        h += 'Buried: ' + c.slopeCalc.buriedCourses + ' courses (' + c.slopeCalc.buriedHeight.toFixed(2) + 'm) | ';
        h += 'Extra blocks: +' + c.slopeCalc.totalExtra;
        h += '</div>';
      }
      h += '</div>';
    }
    
    // STAIRS/STEPS CALCULATOR
    if (projectType === 'Stairs' || projectType === 'Steps') {
      h += '<div style="margin-top:10px;background:#fff3cd;padding:10px;border-radius:6px;border-left:3px solid #eab308;">';
      h += '<div style="font-weight:600;margin-bottom:8px;font-size:12px;">🪜 Stairs Calculator</div>';
      h += '<div class="row3">';
      h += '<div><label>Steps</label><input type="number" value="' + g.stairSteps + '" onchange="upd(' + g.id + ',\'stairSteps\',parseInt(this.value)||0)"></div>';
      h += '<div><label>Rise (mm)</label><input type="number" value="' + g.stairHeight + '" onchange="upd(' + g.id + ',\'stairHeight\',parseFloat(this.value)||200)"></div>';
      h += '<div><label>Depth (mm)</label><input type="number" value="' + g.stairDepth + '" onchange="upd(' + g.id + ',\'stairDepth\',parseFloat(this.value)||300)"></div>';
      h += '</div>';
      
      if (c.stairsCalc) {
        h += '<div style="margin-top:8px;font-size:11px;color:#92400e;">';
        h += 'Rise: ' + c.stairsCalc.totalRise.toFixed(2) + 'm | ';
        h += 'Run: ' + c.stairsCalc.totalRun.toFixed(2) + 'm | ';
        h += 'Angle: ' + c.stairsCalc.angle.toFixed(1) + '°';
        if (!c.stairsCalc.isSafe) {
          h += ' <span style="color:#dc2626;font-weight:600;">⚠️ ' + c.stairsCalc.warning + '</span>';
        }
        h += '<br>Recommended: ' + c.stairsCalc.recommended.join('°, ') + '°';
        h += '</div>';
      }
      h += '</div>';
    }
    
    // Standard wall dimensions
    h += '<div style="margin-top:10px;">';
    
    // Wall runs with corners
    for (var ri = 0; ri < g.wallRuns.length; ri++) {
      h += '<div style="margin-bottom:8px;">';
      h += '<label>Wall Run ' + (ri + 1) + ' (mm or m)</label>';
      h += '<div style="display:flex;gap:6px;">';
      h += '<input type="text" value="' + (g.wallRuns[ri].length || '') + '" placeholder="e.g. 5000 or 5.0" onchange="updWallRun(' + g.id + ',' + ri + ',this.value)" style="flex:1">';
      if (g.wallRuns.length > 1) {
        h += '<button class="del-btn" onclick="removeCorner(' + g.id + ',' + ri + ')">×</button>';
      }
      h += '</div>';
      h += '</div>';
      
      if (ri < g.wallRuns.length - 1) {
        h += '<div style="text-align:center;color:var(--blue);font-weight:600;margin:4px 0;">▼ Corner ▼</div>';
      }
    }
    
    h += '<button class="add-btn" style="margin-top:8px;" onclick="addCorner(' + g.id + ')">+ Add Corner</button>';
    h += '</div>';
    
    h += '<div class="row2">';
    h += '<div><label>Length (total)</label><div class="hint">' + c.totalWallLength.toFixed(2) + 'm</div></div>';
    h += '<div><label>Height (mm or m)</label><input type="text" value="' + (g.wh || '') + '" placeholder="e.g. 1200 or 1.2" onchange="upd(' + g.id + ',\'wh\',this.value)"></div>';
    h += '</div>';
    h += '<div class="hint">Enter whole numbers for mm (e.g. 500, 1200) or decimals for metres (e.g. 0.5, 1.2)</div>';
    
    // Override
    h += '<label>Block Override (0=auto)</label>';
    h += '<input type="number" value="' + g.bo + '" onchange="upd(' + g.id + ',\'bo\',parseInt(this.value)||0)">';
    h += '<div class="hint">Auto: ' + c.layers + ' layers × ' + c.bpm.toFixed(1) + '/m × ' + c.totalWallLength.toFixed(2) + 'm = ' + c.base + ' + ' + c.waste + ' waste = ' + c.auto + '</div>';
    
    // Soil hint
    h += '<div class="hint" style="color:#0369a1;font-weight:600;margin-top:4px;">';
    h += 'Soil: ' + soilType + ' | hardness ' + soil.hardness + '× | cut ' + soil.cutMultiplier + '× | waste +' + soil.wasteAdd + '%';
    h += '</div>';
    
    // Cuts
    h += '<div class="row2">';
    h += '<div><label>Cut Type</label><select onchange="upd(' + g.id + ',\'ct\',parseInt(this.value))">';
    h += '<option value="0"' + (g.ct === 0 ? ' selected' : '') + '>None</option>';
    h += '<option value="1"' + (g.ct === 1 ? ' selected' : '') + '>Half (1)</option>';
    h += '<option value="2"' + (g.ct === 2 ? ' selected' : '') + '>Notch (2)</option>';
    h += '<option value="3"' + (g.ct === 3 ? ' selected' : '') + '>Rip (3)</option>';
    h += '<option value="4"' + (g.ct === 4 ? ' selected' : '') + '>Shape (4)</option>';
    h += '</select></div>';
    h += '<div><label>Blocks to Cut</label><input type="number" value="' + g.cq + '" onchange="upd(' + g.id + ',\'cq\',parseInt(this.value)||0)"></div>';
    h += '</div>';
    
    // Materials
    h += '<div class="row3">';
    h += '<div><label>Capping</label><input type="number" value="' + g.cap + '" onchange="upd(' + g.id + ',\'cap\',parseInt(this.value)||0)"></div>';
    h += '<div><label>Drain (m)</label><input type="number" value="' + g.drain + '" step="0.1" onchange="upd(' + g.id + ',\'drain\',parseFloat(this.value)||0)"></div>';
    h += '<div><label>Reo (m)</label><input type="number" value="' + g.reo + '" step="0.1" onchange="upd(' + g.id + ',\'reo\',parseFloat(this.value)||0)"></div>';
    h += '</div>';
    
    h += '<div class="row2">';
    h += '<div><label>Oxide</label><input type="number" value="' + g.oxide + '" onchange="upd(' + g.id + ',\'oxide\',parseInt(this.value)||0)"></div>';
    h += '<div><label>Stick Joints</label><input type="number" value="' + g.stick + '" onchange="upd(' + g.id + ',\'stick\',parseInt(this.value)||0)"></div>';
    h += '</div>';
    
    // Diagram button (only for non-stairs projects)
    if (projectType !== 'Stairs' && projectType !== 'Steps') {
      h += '<button class="diagram-btn" onclick="openDiagram(' + i + ')">🖼️ Generate Wall Diagram</button>';
    }
    
    h += '</div>'; // group-body
    
    // Group Totals
    h += '<div class="group-totals">';
    h += '<div class="line"><span>Blocks (' + c.tot + ' × $' + c.b.p + ')</span><span>$' + c.bCost.toFixed(2) + '</span></div>';
    h += '<div class="line"><span>Sand+Cement</span><span>$' + (c.sandC + c.cemC).toFixed(2) + '</span></div>';
    if (c.cutC > 0) h += '<div class="line"><span>Cuts</span><span>$' + c.cutC.toFixed(2) + '</span></div>';
    if (c.bladeC > 0) h += '<div class="line"><span>Blade</span><span>$' + c.bladeC.toFixed(2) + '</span></div>';
    if (c.capC > 0) h += '<div class="line"><span>Capping</span><span>$' + c.capC.toFixed(2) + '</span></div>';
    if (c.drainC > 0) h += '<div class="line"><span>Drainage</span><span>$' + c.drainC.toFixed(2) + '</span></div>';
    if (c.reoC > 0) h += '<div class="line"><span>Reo</span><span>$' + c.reoC.toFixed(2) + '</span></div>';
    if (c.oxideC > 0) h += '<div class="line"><span>Oxide</span><span>$' + c.oxideC.toFixed(2) + '</span></div>';
    if (c.stickC > 0) h += '<div class="line"><span>Stick</span><span>$' + c.stickC.toFixed(2) + '</span></div>';
    h += '<div class="line"><span>Labor</span><span>' + c.labHrs.toFixed(1) + ' hrs</span></div>';
    h += '<div class="line total"><span>Group Total</span><span>$' + c.grpTot.toFixed(2) + '</span></div>';
    h += '</div>';
    
    h += '</div>'; // group
  });
  
  document.getElementById('groupsBox').innerHTML = h;
}

// Render Grand Totals
function renderTotals(a) {
  // Materials Summary
  var m = '';
  for (var k in a.blks) {
    var B = a.blks[k];
    m += '<div class="mat-box"><span>' + B.n + '</span><span class="val">' + B.q + '</span></div>';
  }
  m += '<div class="mat-box"><span>Sand (scoops)</span><span class="val">' + a.scoops + '</span></div>';
  m += '<div class="mat-box"><span>Cement (bags)</span><span class="val">' + a.bags + '</span></div>';
  if (a.cap > 0) m += '<div class="mat-box"><span>Capping</span><span class="val">' + a.cap + '</span></div>';
  if (a.drain > 0) m += '<div class="mat-box"><span>AG Pipe</span><span class="val">' + a.drain + 'm</span></div>';
  if (a.reo > 0) m += '<div class="mat-box"><span>Reo</span><span class="val">' + a.reo + 'm</span></div>';
  if (a.oxide > 0) m += '<div class="mat-box"><span>Oxide</span><span class="val">' + a.oxide + '</span></div>';
  if (a.stick > 0) m += '<div class="mat-box"><span>Stick Joints</span><span class="val">' + a.stick + '</span></div>';
  if (a.skipOn) m += '<div class="mat-box"><span>Skip Bin</span><span class="val">' + a.skipSize.split('–')[0] + '</span></div>';
  m += '<div class="mat-box"><span>Total Labor</span><span class="val">' + a.labHrs.toFixed(1) + ' hrs</span></div>';
  document.getElementById('matSummary').innerHTML = m;

  // Internal Breakdown
  var int = '';
  int += '<div class="q-row hl"><span>Materials</span><span>$' + a.matC.toFixed(2) + '</span></div>';
  if (a.cutC > 0) int += '<div class="q-row"><span>├ Cutting</span><span>$' + a.cutC.toFixed(2) + '</span></div>';
  if (a.bladeC > 0) int += '<div class="q-row"><span>├ Blade Wear</span><span>$' + a.bladeC.toFixed(2) + '</span></div>';
  int += '<div class="q-row hl"><span>Equipment</span><span>$' + a.equipC.toFixed(2) + '</span></div>';
  if (a.staffC > 0) int += '<div class="q-row"><span>├ Staff (' + a.staffD + ' days)</span><span>$' + a.staffC.toFixed(2) + '</span></div>';
  if (a.mobC > 0) int += '<div class="q-row"><span>├ Mobilis. (' + a.mobK + ' km)</span><span>$' + a.mobC.toFixed(2) + '</span></div>';
  if (a.delC > 0) int += '<div class="q-row"><span>├ Delivery (' + a.delL + ')</span><span>$' + a.delC.toFixed(2) + '</span></div>';
  if (a.skipC > 0) int += '<div class="q-row"><span>├ Skip Bin</span><span>$' + a.skipC.toFixed(2) + '</span></div>';
  int += '<div class="q-row hl"><span><b>Subtotal</b></span><span><b>$' + a.sub.toFixed(2) + '</b></span></div>';
  int += '<div class="q-row"><span>Profit (' + CFG.rate.profit + '%)</span><span>$' + a.profit.toFixed(2) + '</span></div>';
  int += '<div class="q-row"><span>Margin</span><span>' + (a.grand > 0 ? ((a.profit / a.grand) * 100).toFixed(1) : 0) + '%</span></div>';
  document.getElementById('intBox').innerHTML = int;

  // Client Summary
  var cli = '';
  cli += '<div class="q-row"><span>Materials & Labour</span><span>$' + (a.sub + a.profit).toFixed(2) + '</span></div>';
  cli += '<div class="q-row"><span>GST (' + CFG.rate.gst + '%)</span><span>$' + a.gst.toFixed(2) + '</span></div>';
  document.getElementById('cliBox').innerHTML = cli;

  // Grand Total
  document.getElementById('grandTot').textContent = '$' + a.grand.toFixed(2);
}

// WALL DIAGRAM GENERATOR
var currentDiagramGroupId = null;

function renderWallDiagram(group) {
  var canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 600;
  var ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  var b = CFG.blocks[group.bt];
  var soil = CFG.soil[soilType];
  
  // UPGRADE 1: Use EXACT same totalWallLength logic as calcGroup()
  var totalWallLength = 0;
  if (group.wallRuns && group.wallRuns.length > 0) {
    var cornerDeduction = b.l / 2; // Half block length for corner
    for (var i = 0; i < group.wallRuns.length; i++) {
      var runLength = 0;
      try {
        runLength = parseDimension(group.wallRuns[i].length);
      } catch (e) {
        runLength = 0;
      }
      // Apply corner deduction to all runs except the last
      if (i < group.wallRuns.length - 1) {
        runLength = Math.max(0, runLength - cornerDeduction);
      }
      totalWallLength += runLength;
    }
  } else {
    // Fallback to old wl value
    try {
      totalWallLength = parseDimension(group.wl);
    } catch (e) {
      totalWallLength = 0;
    }
  }
  
  var wallHeight = 0;
  try {
    wallHeight = parseDimension(group.wh);
  } catch (e) {
    wallHeight = 0;
  }
  
  // Calculate courses
  var startCourses = 0;
  var endCourses = 0;
  var buriedCourses = 0;
  var hasSlope = false;
  var slopeCalc = null;
  
  // UPGRADE 3: Use EXACT calcSlope() results
  if (projectType === 'Retaining Wall' && (group.slopeStartH > 0 || group.slopeEndH > 0)) {
    hasSlope = true;
    slopeCalc = calcSlope(group, b);
    if (slopeCalc) {
      startCourses = Math.ceil(group.slopeStartH / b.h);
      endCourses = Math.ceil(group.slopeEndH / b.h);
      buriedCourses = slopeCalc.buriedCourses;
    }
  } else {
    var courses = wallHeight > 0 ? Math.ceil(wallHeight / b.h) : 0;
    startCourses = courses;
    endCourses = courses;
  }
  
  var totalCourses = Math.max(startCourses, endCourses) + buriedCourses;
  var blocksPerMeter = 1 / b.l;
  var blocksInLength = Math.ceil(totalWallLength * blocksPerMeter);
  
  // UPGRADE 4: Validation before rendering
  if (totalWallLength <= 0 || totalCourses <= 0) {
    alert('Enter wall dimensions first.');
    return null;
  }
  
  // UPGRADE 6: Division-by-zero check
  if (blocksInLength < 1) {
    return null;
  }
  
  // Scaling
  var margin = 50;
  var availableWidth = canvas.width - margin * 2;
  var availableHeight = canvas.height - margin * 3;
  
  var blockDisplayWidth = availableWidth / blocksInLength;
  var blockDisplayHeight = availableHeight / totalCourses;
  
  // Ensure blocks look reasonable
  if (blockDisplayHeight > blockDisplayWidth * 2) {
    blockDisplayHeight = blockDisplayWidth * 2;
  }
  if (blockDisplayWidth > blockDisplayHeight * 3) {
    blockDisplayWidth = blockDisplayHeight * 3;
  }
  
  // Block color based on type
  var blockColor = '#eaeaea'; // natural default
  if (group.bt.includes('c')) blockColor = '#f2e3c2'; // cream
  if (group.bt.includes('g')) blockColor = '#d0d0d0'; // grey
  
  var blockStroke = '#666';
  var buriedOverlay = 'rgba(100, 100, 100, 0.3)';
  
  // UPGRADE 2: Draw with corners
  var startX = margin;
  var startY = canvas.height - margin;
  var currentX = startX;
  var currentY = startY;
  var direction = 0; // 0=right, 1=down, 2=left, 3=up
  
  if (group.wallRuns && group.wallRuns.length > 1) {
    // Multi-segment wall with corners
    for (var segmentIdx = 0; segmentIdx < group.wallRuns.length; segmentIdx++) {
      var segmentLength = 0;
      try {
        segmentLength = parseDimension(group.wallRuns[segmentIdx].length);
      } catch (e) {
        segmentLength = 0;
      }
      
      // Apply corner deduction
      if (segmentIdx < group.wallRuns.length - 1) {
        segmentLength = Math.max(0, segmentLength - b.l / 2);
      }
      
      var segmentBlocks = Math.ceil(segmentLength * blocksPerMeter);
      
      for (var course = 0; course < totalCourses; course++) {
        var isBuried = course < buriedCourses;
        var y = startY - (course + 1) * blockDisplayHeight;
        var offset = (course % 2) * (blockDisplayWidth / 2);
        
        for (var i = 0; i < segmentBlocks; i++) {
          var x = currentX + i * blockDisplayWidth + offset;
          
          // Draw block
          ctx.fillStyle = blockColor;
          ctx.fillRect(x, y, blockDisplayWidth - 2, blockDisplayHeight - 2);
          
          // Stroke
          ctx.strokeStyle = blockStroke;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, blockDisplayWidth - 2, blockDisplayHeight - 2);
          
          // Buried overlay
          if (isBuried) {
            ctx.fillStyle = buriedOverlay;
            ctx.fillRect(x, y, blockDisplayWidth - 2, blockDisplayHeight - 2);
          }
        }
      }
      
      // Move to next segment (corner)
      currentX += segmentBlocks * blockDisplayWidth;
      direction = (direction + 1) % 4; // Rotate 90° clockwise
    }
  } else {
    // Single straight wall (original logic)
    for (var course = 0; course < totalCourses; course++) {
      var isBuried = course < buriedCourses;
      var courseFromBottom = course;
      var visibleCourse = courseFromBottom - buriedCourses;
      
      // Determine how many blocks in this course based on slope
      var blocksInCourse = blocksInLength;
      if (hasSlope && visibleCourse >= 0) {
        var ratio = visibleCourse / Math.max(startCourses, endCourses);
        var currentHeight = startCourses - (startCourses - endCourses) * ratio;
        if (visibleCourse >= currentHeight) {
          continue; // Skip this course if above slope
        }
      }
      
      var y = startY - (course + 1) * blockDisplayHeight;
      
      // Offset every other row for running bond pattern
      var offset = (course % 2) * (blockDisplayWidth / 2);
      
      for (var i = 0; i < blocksInCourse; i++) {
        var x = startX + i * blockDisplayWidth + offset;
        
        // Skip if out of bounds
        if (x + blockDisplayWidth > canvas.width - margin) continue;
        
        // Draw block
        ctx.fillStyle = blockColor;
        ctx.fillRect(x, y, blockDisplayWidth - 2, blockDisplayHeight - 2);
        
        // Stroke
        ctx.strokeStyle = blockStroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, blockDisplayWidth - 2, blockDisplayHeight - 2);
        
        // Buried overlay
        if (isBuried) {
          ctx.fillStyle = buriedOverlay;
          ctx.fillRect(x, y, blockDisplayWidth - 2, blockDisplayHeight - 2);
        }
      }
    }
  }
  
  // Draw buried line
  if (buriedCourses > 0) {
    var buriedY = startY - buriedCourses * blockDisplayHeight;
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin, buriedY);
    ctx.lineTo(canvas.width - margin, buriedY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '12px Arial';
    ctx.fillText('Ground Level', margin + 5, buriedY - 5);
  }
  
  // Draw slope indicators if applicable
  if (hasSlope && slopeCalc) {
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 14px Arial';
    
    // Start height
    var startYPos = canvas.height - margin - (buriedCourses + startCourses) * blockDisplayHeight;
    ctx.fillText('Start: ' + group.slopeStartH + 'm', margin, startYPos - 10);
    
    // End height
    var endYPos = canvas.height - margin - (buriedCourses + endCourses) * blockDisplayHeight;
    ctx.fillText('End: ' + group.slopeEndH + 'm', canvas.width - margin - 80, endYPos - 10);
    
    // Show avg height from calcSlope
    ctx.font = '12px Arial';
    ctx.fillText('Avg: ' + slopeCalc.avgHeight.toFixed(2) + 'm', margin + 120, startYPos - 10);
  }
  
  // Draw labels
  ctx.fillStyle = '#2d2d2d';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Block Type: ' + b.n, margin, 25);
  
  ctx.font = '14px Arial';
  ctx.fillText('Total Courses: ' + totalCourses + ' (' + buriedCourses + ' buried)', margin, 45);
  ctx.fillText('Wall Length: ' + totalWallLength.toFixed(2) + 'm', margin, 65);
  ctx.fillText('Blocks: ' + blocksInLength + ' per course', margin, 85);
  ctx.fillText('Site: ' + soilType, margin, 105);
  
  // Total block count
  var c = calcGroup(group);
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#00A3E8';
  ctx.fillText('Total Blocks: ' + c.tot, canvas.width - margin - 150, 30);
  
  // UPGRADE 7: Add scale bar
  ctx.fillStyle = '#2d2d2d';
  ctx.font = '11px Arial';
  ctx.fillText('1m scale', margin, canvas.height - 10);
  ctx.fillStyle = '#00A3E8';
  ctx.fillRect(margin + 50, canvas.height - 22, blockDisplayWidth * blocksPerMeter, 5);
  
  return canvas.toDataURL();
}

function openDiagram(groupIndex) {
  if (groupIndex < 0 || groupIndex >= groups.length) return;
  
  // UPGRADE 5: Block stairs at logic level
  if (projectType === 'Stairs' || projectType === 'Steps') {
    alert('Diagrams are not yet available for stairs.');
    return;
  }
  
  var group = groups[groupIndex];
  
  // Validate dimensions using same logic as calcGroup
  var b = CFG.blocks[group.bt];
  var totalLength = 0;
  if (group.wallRuns && group.wallRuns.length > 0) {
    var cornerDeduction = b.l / 2;
    for (var i = 0; i < group.wallRuns.length; i++) {
      var runLength = 0;
      try {
        runLength = parseDimension(group.wallRuns[i].length);
      } catch (e) {
        runLength = 0;
      }
      if (i < group.wallRuns.length - 1) {
        runLength = Math.max(0, runLength - cornerDeduction);
      }
      totalLength += runLength;
    }
  } else {
    try {
      totalLength = parseDimension(group.wl);
    } catch (e) {
      totalLength = 0;
    }
  }
  
  if (totalLength === 0) {
    alert('Please enter wall dimensions first.');
    return;
  }
  
  currentDiagramGroupId = group.id;
  
  // Generate diagram
  var dataURL = renderWallDiagram(group);
  
  if (!dataURL) {
    alert('Unable to generate diagram. Please check wall dimensions.');
    return;
  }
  
  // Display in modal
  var canvas = document.getElementById('diagramCanvas');
  var img = new Image();
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataURL;
  
  // Show modal
  document.getElementById('diagramModal').classList.remove('hidden');
}

function closeDiagram() {
  document.getElementById('diagramModal').classList.add('hidden');
  currentDiagramGroupId = null;
}

function saveDiagramPNG() {
  var canvas = document.getElementById('diagramCanvas');
  var link = document.createElement('a');
  var timestamp = new Date().toISOString().split('T')[0];
  link.download = 'wall-diagram-' + timestamp + '.png';
  link.href = canvas.toDataURL();
  link.click();
}

function attachDiagramToPDF() {
  if (currentDiagramGroupId === null) return;
  
  var canvas = document.getElementById('diagramCanvas');
  var dataURL = canvas.toDataURL();
  
  // Store in group
  groups.forEach(function(g) {
    if (g.id === currentDiagramGroupId) {
      g.diagram = dataURL;
    }
  });
  
  closeDiagram();
  alert('Diagram attached! It will appear in PDFs.');
}

// Initialize on load
init();
