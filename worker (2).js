/* KB Stone Pro - App Logic v2 with Corners & Stairs */

var CFG = {
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
  rate: { waste: 8, profit: 20, gst: 10, bph: 18 }
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
  
  // Strip "mm" or "m" suffix if present
  var strippedInput = input.replace(/\s*(mm|m)$/i, '');
  
  // Check if it has "mm" explicitly
  var hasMMSuffix = /mm$/i.test(input);
  var hasMSuffix = /m$/i.test(input) && !hasMMSuffix;
  
  // Whole number
  if (/^\d+$/.test(strippedInput)) {
    var num = Number(strippedInput);
    // If suffixed with "m", treat as metres
    if (hasMSuffix) {
      return num;
    }
    // Otherwise assume mm for whole numbers >= 100
    if (num >= 100 || hasMMSuffix) {
      return num / 1000; // convert mm to metres
    }
    // Small whole numbers without suffix treated as metres
    return num;
  }
  
  // Decimal = metres
  if (/^\d*\.\d+$/.test(strippedInput)) {
    return Number(strippedInput);
  }
  
  // If we get here, try parsing as-is
  var parsed = Number(strippedInput);
  if (!isNaN(parsed)) {
    return parsed >= 100 ? parsed / 1000 : parsed;
  }
  
  return 0;
}

// Show error message to user
function showError(message) {
  alert(message);
}

// Initialize
function init() {
  var d = new Date();
  document.getElementById('qNum').value = 'KB-' + d.getFullYear() + 
    String(d.getMonth() + 1).padStart(2, '0') + 
    String(d.getDate()).padStart(2, '0') + '-001';
  document.getElementById('qDate').value = d.toISOString().split('T')[0];
  addGroup();
}

// View Toggle
function setView(v) {
  view = v;
  document.getElementById('btnInt').className = v === 'int' ? 'active' : '';
  document.getElementById('btnCli').className = v === 'cli' ? 'active' : '';
  document.getElementById('intBox').className = v === 'int' ? 'internal' : 'internal hide';
}

// Skip Bin Toggle
function togSkip() {
  document.getElementById('togSkip').classList.toggle('on');
  document.getElementById('skipSec').classList.toggle('hide');
  calcAll();
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
    // NEW: Corner system
    corners: [],
    wallRuns: [{ length: 0 }],
    // NEW: Stairs system
    isStairs: false,
    stairSteps: 0,
    stairHeight: 200,
    stairDepth: 300
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
  // For height field (wh), validate the dimension
  if (k === 'wh') {
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

// NEW: Add corner to group
function addCorner(id) {
  groups.forEach(function(g) {
    if (g.id === id) {
      g.wallRuns.push({ length: 0 });
    }
  });
  render();
  calcAll();
}

// NEW: Remove corner from group
function removeCorner(id, idx) {
  groups.forEach(function(g) {
    if (g.id === id && g.wallRuns.length > 1) {
      g.wallRuns.splice(idx, 1);
    }
  });
  render();
  calcAll();
}

// NEW: Update wall run length
function updWallRun(id, idx, val) {
  groups.forEach(function(g) {
    if (g.id === id && g.wallRuns[idx]) {
      try {
        var parsed = parseDimension(val);
        g.wallRuns[idx].length = parsed; // Store parsed metres
        g.wallRuns[idx].display = val; // Store original for display
      } catch (e) {
        g.wallRuns[idx].length = 0;
        g.wallRuns[idx].display = val;
      }
    }
  });
  calcAll();
}

// NEW: Toggle stairs mode
function togStairs(id) {
  groups.forEach(function(g) {
    if (g.id === id) {
      g.isStairs = !g.isStairs;
    }
  });
  render();
  calcAll();
}

// Calculate Single Group
function calcGroup(g) {
  var b = CFG.blocks[g.bt];
  
  // Calculate total wall length with corner deductions
  var totalWallLength = 0;
  if (g.wallRuns && g.wallRuns.length > 0) {
    var cornerDeduction = b.l / 2; // Half block length for corner
    for (var i = 0; i < g.wallRuns.length; i++) {
      var runLength = 0;
      // wallRuns now store parsed metres directly
      if (typeof g.wallRuns[i].length === 'number') {
        runLength = g.wallRuns[i].length;
      } else {
        try {
          runLength = parseDimension(g.wallRuns[i].length);
        } catch (e) {
          runLength = 0;
        }
      }
      // Apply corner deduction only if run is >= 1 block length
      if (i < g.wallRuns.length - 1 && runLength >= b.l) {
        runLength = Math.max(0, runLength - cornerDeduction);
      }
      totalWallLength += runLength;
    }
  } else {
    // Only fallback to g.wl if no wallRuns exist
    try {
      totalWallLength = parseDimension(g.wl);
    } catch (e) {
      totalWallLength = 0;
    }
  }
  
  // Handle stairs calculation
  if (g.isStairs) {
    var steps = parseInt(g.stairSteps) || 0;
    var stepH = (parseFloat(g.stairHeight) || 200) / 1000; // mm to m
    var stepD = (parseFloat(g.stairDepth) || 300) / 1000; // mm to m
    
    var totalRise = steps * stepH;
    var totalRun = steps * stepD;
    
    // Clamp: if total rise is tiny, don't generate blocks
    if (totalRise < 0.1 || totalRun < 0.1) {
      return {
        b: b, isStairs: true, steps: steps, totalRise: 0, totalRun: 0,
        tot: 0, base: 0, waste: 0, bCost: 0, scoops: 0, sandC: 0,
        bags: 0, cemC: 0, cutC: 0, bladeC: 0, cutHrs: 0,
        capC: 0, drainC: 0, reoC: 0, oxideC: 0, stickC: 0,
        labHrs: 0, grpTot: 0
      };
    }
    
    // Calculate blocks for risers (vertical faces)
    var blockFaceH = b.h;
    var blockFaceL = b.l;
    var riserArea = totalRise * totalRun;
    var blockFaceArea = blockFaceH * blockFaceL;
    var riserBlocks = Math.ceil(riserArea / blockFaceArea);
    
    // Calculate blocks for treads (horizontal surfaces)
    var treadArea = totalRun * totalRun; // Assuming square treads
    var treadBlocks = Math.ceil(treadArea / blockFaceArea);
    
    var baseStair = riserBlocks + treadBlocks;
    var wasteStair = Math.ceil(baseStair * (CFG.rate.waste / 100));
    var tot = baseStair + wasteStair;
    
    var bCost = tot * b.p;
    
    // Stairs need significant cutting
    var stairCutC = tot * CFG.cut.base * b.hd * 2; // Double cutting for stairs
    var stairBladeC = tot * CFG.cut.blade * 2;
    var stairCutHrs = tot * 0.15; // 0.15 hrs per block for stairs cutting
    
    var sandM3 = tot * 0.015;
    var scoops = Math.ceil(sandM3 * 3);
    var sandC = scoops * CFG.mat.sand;
    var bags = Math.ceil(sandM3 / 0.15);
    var cemC = bags * CFG.mat.cement;
    
    var capC = g.cap * CFG.mat.cap;
    var drainC = g.drain * CFG.mat.pipe;
    var reoC = g.reo * CFG.mat.reo;
    var oxideC = g.oxide * CFG.mat.oxide;
    var stickC = g.stick * CFG.mat.stick;
    
    var labHrs = (tot / CFG.rate.bph) + stairCutHrs;
    var grpTot = bCost + sandC + cemC + stairCutC + stairBladeC + capC + drainC + reoC + oxideC + stickC;
    
    return {
      b: b,
      isStairs: true,
      steps: steps,
      totalRise: totalRise,
      totalRun: totalRun,
      tot: tot,
      base: baseStair,
      waste: wasteStair,
      bCost: bCost,
      scoops: scoops,
      sandC: sandC,
      bags: bags,
      cemC: cemC,
      cutC: stairCutC,
      bladeC: stairBladeC,
      cutHrs: stairCutHrs,
      capC: capC,
      drainC: drainC,
      reoC: reoC,
      oxideC: oxideC,
      stickC: stickC,
      labHrs: labHrs,
      grpTot: grpTot
    };
  }
  
  // Standard wall calculation with parsed height
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
  var waste = Math.ceil(base * (CFG.rate.waste / 100));
  var auto = base + waste;
  var tot = g.bo > 0 ? g.bo : auto;
  var bCost = tot * b.p;
  
  var sandM3 = tot * 0.015;
  var scoops = Math.ceil(sandM3 * 3);
  var sandC = scoops * CFG.mat.sand;
  var bags = Math.ceil(sandM3 / 0.15);
  var cemC = bags * CFG.mat.cement;
  
  var cutC = g.cq * g.ct * CFG.cut.base * b.hd;
  var bladeC = g.cq * g.ct * CFG.cut.blade;
  var cutHrs = g.cq * g.ct * 0.1;
  
  var capC = g.cap * CFG.mat.cap;
  var drainC = g.drain * CFG.mat.pipe;
  var reoC = g.reo * CFG.mat.reo;
  var oxideC = g.oxide * CFG.mat.oxide;
  var stickC = g.stick * CFG.mat.stick;
  
  var labHrs = tot / CFG.rate.bph + cutHrs;
  var grpTot = bCost + sandC + cemC + cutC + bladeC + capC + drainC + reoC + oxideC + stickC;
  
  return {
    b: b,
    isStairs: false,
    layers: layers,
    bpm: bpm,
    base: base,
    waste: waste,
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
    grpTot: grpTot
  };
}

// Calculate All & Aggregate
function calcAll() {
  // Update global project type
  projectType = document.getElementById('pType').value;
  
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
    agg: agg
  };

  render();
  renderTotals(agg);
}

// Render Block Groups
function render() {
  var h = '';
  groups.forEach(function(g, i) {
    var c = calcGroup(g);
    var cls = g.open ? 'group open' : 'group';
    
    h += '<div class="' + cls + '">';
    h += '<div class="group-head" onclick="togGroup(' + g.id + ')">';
    h += '<h4><span class="arrow">â–¼</span> Group ' + (i + 1) + ': ' + c.b.n;
    h += '<span class="sum">' + c.tot + ' blks â€¢ $' + c.grpTot.toFixed(0) + '</span></h4>';
    h += '<button class="del-btn" onclick="event.stopPropagation();delGroup(' + g.id + ')">Delete</button>';
    h += '</div>';
    
    h += '<div class="group-body">';
    
    // Block Type Select
    h += '<label>Block Type</label><select onchange="upd(' + g.id + ',\'bt\',this.value)">';
    for (var k in CFG.blocks) {
      var B = CFG.blocks[k];
      h += '<option value="' + k + '"' + (g.bt === k ? ' selected' : '') + '>' + B.n + ' â€” $' + B.p + '</option>';
    }
    h += '</select>';
    
    // NEW: Stairs toggle
    h += '<div class="toggle-row"><label>Stairs / Steps</label>';
    h += '<div class="toggle' + (g.isStairs ? ' on' : '') + '" onclick="togStairs(' + g.id + ')"></div></div>';
    
    if (g.isStairs) {
      // Stairs mode
      h += '<div class="nested">';
      h += '<div class="row3">';
      h += '<div><label>Steps</label><input type="number" value="' + (g.stairSteps || 0) + '" onchange="upd(' + g.id + ',\'stairSteps\',parseInt(this.value)||0)"></div>';
      h += '<div><label>Height (mm)</label><input type="number" value="' + (g.stairHeight || 200) + '" onchange="upd(' + g.id + ',\'stairHeight\',parseFloat(this.value)||200)"></div>';
      h += '<div><label>Depth (mm)</label><input type="number" value="' + (g.stairDepth || 300) + '" onchange="upd(' + g.id + ',\'stairDepth\',parseFloat(this.value)||300)"></div>';
      h += '</div>';
      if (c.isStairs) {
        h += '<div class="hint">Total Rise: ' + c.totalRise.toFixed(2) + 'm | Total Run: ' + c.totalRun.toFixed(2) + 'm</div>';
      }
      h += '</div>';
    } else {
      // Wall mode with corners
      h += '<div style="margin-top:10px;">';
      
      // NEW: Wall runs with corners
      for (var ri = 0; ri < g.wallRuns.length; ri++) {
        h += '<div style="margin-bottom:8px;">';
        h += '<label>Wall Run ' + (ri + 1) + ' (mm or m)</label>';
        h += '<div style="display:flex;gap:6px;">';
        h += '<input type="text" value="' + (g.wallRuns[ri].display || g.wallRuns[ri].length || '') + '" placeholder="e.g. 5000 or 5.0" onchange="updWallRun(' + g.id + ',' + ri + ',this.value)" style="flex:1">';
        if (g.wallRuns.length > 1) {
          h += '<button class="del-btn" onclick="removeCorner(' + g.id + ',' + ri + ')">Ã—</button>';
        }
        h += '</div>';
        h += '</div>';
        
        if (ri < g.wallRuns.length - 1) {
          h += '<div style="text-align:center;color:var(--blue);font-weight:600;margin:4px 0;">--- Corner ---</div>';
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
      h += '<div class="hint">Auto: ' + c.layers + ' layers Ã— ' + c.bpm.toFixed(1) + '/m Ã— ' + c.totalWallLength.toFixed(2) + 'm = ' + c.base + ' + ' + c.waste + ' waste = ' + c.auto + '</div>';
      
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
    }
    
    // Materials (common to both modes)
    h += '<div class="row3">';
    h += '<div><label>Capping</label><input type="number" value="' + g.cap + '" onchange="upd(' + g.id + ',\'cap\',parseInt(this.value)||0)"></div>';
    h += '<div><label>Drain (m)</label><input type="number" value="' + g.drain + '" step="0.1" onchange="upd(' + g.id + ',\'drain\',parseFloat(this.value)||0)"></div>';
    h += '<div><label>Reo (m)</label><input type="number" value="' + g.reo + '" step="0.1" onchange="upd(' + g.id + ',\'reo\',parseFloat(this.value)||0)"></div>';
    h += '</div>';
    
    h += '<div class="row2">';
    h += '<div><label>Oxide</label><input type="number" value="' + g.oxide + '" onchange="upd(' + g.id + ',\'oxide\',parseInt(this.value)||0)"></div>';
    h += '<div><label>Stick Joints</label><input type="number" value="' + g.stick + '" onchange="upd(' + g.id + ',\'stick\',parseInt(this.value)||0)"></div>';
    h += '</div>';
    
    h += '<button class="diagram-btn" onclick="openDiagram(' + i + ')">[VIEW] Generate Wall Diagram</button>';
    
    h += '</div>'; // group-body
    
    // Group Totals
    h += '<div class="group-totals">';
    h += '<div class="line"><span>Blocks (' + c.tot + ' Ã— $' + c.b.p + ')</span><span>$' + c.bCost.toFixed(2) + '</span></div>';
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
  if (a.skipOn) m += '<div class="mat-box"><span>Skip Bin</span><span class="val">' + a.skipSize.split('â€”')[0] + '</span></div>';
  m += '<div class="mat-box"><span>Total Labor</span><span class="val">' + a.labHrs.toFixed(1) + ' hrs</span></div>';
  document.getElementById('matSummary').innerHTML = m;

  // Internal Breakdown
  var int = '';
  int += '<div class="q-row hl"><span>Materials</span><span>$' + a.matC.toFixed(2) + '</span></div>';
  if (a.cutC > 0) int += '<div class="q-row"><span>â”œ Cutting</span><span>$' + a.cutC.toFixed(2) + '</span></div>';
  if (a.bladeC > 0) int += '<div class="q-row"><span>â”œ Blade Wear</span><span>$' + a.bladeC.toFixed(2) + '</span></div>';
  int += '<div class="q-row hl"><span>Equipment</span><span>$' + a.equipC.toFixed(2) + '</span></div>';
  if (a.staffC > 0) int += '<div class="q-row"><span>â”œ Staff (' + a.staffD + ' days)</span><span>$' + a.staffC.toFixed(2) + '</span></div>';
  if (a.mobC > 0) int += '<div class="q-row"><span>â”œ Mobilis. (' + a.mobK + ' km)</span><span>$' + a.mobC.toFixed(2) + '</span></div>';
  if (a.delC > 0) int += '<div class="q-row"><span>â”œ Delivery (' + a.delL + ')</span><span>$' + a.delC.toFixed(2) + '</span></div>';
  if (a.skipC > 0) int += '<div class="q-row"><span>â”œ Skip Bin</span><span>$' + a.skipC.toFixed(2) + '</span></div>';
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

// Isometric Wall Diagram Generator
function renderWallDiagram(group) {
  var canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 900;
  var ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  var b = CFG.blocks[group.bt];
  
  var totalWallLength = 0;
  var wallRuns = [];
  
  if (group.wallRuns && group.wallRuns.length > 0) {
    var cornerDeduction = b.l / 2;
    for (var i = 0; i < group.wallRuns.length; i++) {
      var runLength = 0;
      // Use stored parsed metres
      if (typeof group.wallRuns[i].length === 'number') {
        runLength = group.wallRuns[i].length;
      } else {
        try {
          runLength = parseDimension(group.wallRuns[i].length);
        } catch (e) {
          runLength = 0;
        }
      }
      var deductedLength = runLength;
      // Same safety as calcGroup
      if (i < group.wallRuns.length - 1 && runLength >= b.l) {
        deductedLength = Math.max(0, runLength - cornerDeduction);
      }
      wallRuns.push({ original: runLength, deducted: deductedLength });
      totalWallLength += deductedLength;
    }
  } else {
    try {
      var len = parseDimension(group.wl);
      wallRuns.push({ original: len, deducted: len });
      totalWallLength = len;
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
  
  var totalCourses = wallHeight > 0 ? Math.ceil(wallHeight / b.h) : 0;
  
  if (totalWallLength <= 0 || totalCourses <= 0) {
    alert('Enter wall dimensions first.');
    return null;
  }
  
  var blockFillColor = '#f5f5f5';
  var blockTopColor = '#ffffff';
  var blockRightColor = '#e0e0e0';
  
  if (group.bt.includes('c')) {
    blockFillColor = '#f2e3c2';
    blockTopColor = '#fef9e7';
    blockRightColor = '#e8d4a0';
  }
  if (group.bt.includes('g')) {
    blockFillColor = '#d0d0d0';
    blockTopColor = '#e8e8e8';
    blockRightColor = '#b0b0b0';
  }
  
  var blockStroke = '#2d2d2d';
  
  var isoAngle = Math.PI / 6;
  var isoScaleX = Math.cos(isoAngle);
  var isoScaleY = Math.sin(isoAngle);
  
  function iso(x, y, z) {
    var screenX = (x - z) * isoScaleX;
    var screenY = (x + z) * isoScaleY - y;
    return { x: screenX, y: screenY };
  }
  
  var maxDimension = Math.max(totalWallLength, totalCourses * b.h, b.l);
  var availableSpace = Math.min(canvas.width * 0.6, canvas.height * 0.6);
  var scale = availableSpace / maxDimension;
  
  var originX = canvas.width * 0.5;
  var originY = canvas.height * 0.7;
  
  ctx.fillStyle = '#2d2d2d';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('ISOMETRIC VIEW', 30, 40);
  
  ctx.font = '14px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText(b.n + ' | ' + totalCourses + ' courses', 30, 65);
  
  function drawIsoBlock(x, y, z, width, height, depth) {
    var p1 = iso(x, y, z);
    var p2 = iso(x + width, y, z);
    var p3 = iso(x + width, y, z + depth);
    var p4 = iso(x, y, z + depth);
    var p5 = iso(x, y - height, z);
    var p6 = iso(x + width, y - height, z);
    var p7 = iso(x + width, y - height, z + depth);
    var p8 = iso(x, y - height, z + depth);
    
    function scalePoint(p) {
      return {
        x: originX + p.x * scale,
        y: originY + p.y * scale
      };
    }
    
    var sp1 = scalePoint(p1);
    var sp2 = scalePoint(p2);
    var sp3 = scalePoint(p3);
    var sp4 = scalePoint(p4);
    var sp5 = scalePoint(p5);
    var sp6 = scalePoint(p6);
    var sp7 = scalePoint(p7);
    var sp8 = scalePoint(p8);
    
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = blockStroke;
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(sp5.x, sp5.y);
    ctx.lineTo(sp6.x, sp6.y);
    ctx.lineTo(sp7.x, sp7.y);
    ctx.lineTo(sp8.x, sp8.y);
    ctx.closePath();
    ctx.fillStyle = blockTopColor;
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(sp2.x, sp2.y);
    ctx.lineTo(sp6.x, sp6.y);
    ctx.lineTo(sp7.x, sp7.y);
    ctx.lineTo(sp3.x, sp3.y);
    ctx.closePath();
    ctx.fillStyle = blockRightColor;
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(sp1.x, sp1.y);
    ctx.lineTo(sp5.x, sp5.y);
    ctx.lineTo(sp8.x, sp8.y);
    ctx.lineTo(sp4.x, sp4.y);
    ctx.closePath();
    ctx.fillStyle = blockFillColor;
    ctx.fill();
    ctx.stroke();
  }
  
  var blockWidth = b.l;
  var blockHeight = b.h;
  var blockDepth = 0.35;
  var blocksPerMeter = 1 / b.l;
  
  if (wallRuns.length === 1) {
    var totalBlocks = Math.ceil(totalWallLength * blocksPerMeter);
    
    for (var course = 0; course < totalCourses; course++) {
      var yPos = course * blockHeight;
      var offset = (course % 2) * (blockWidth / 2);
      var blocksInCourse = totalBlocks;
      if (offset > 0) blocksInCourse += 1;
      
      for (var i = 0; i < blocksInCourse; i++) {
        var xPos = (i * blockWidth) - offset;
        if (xPos < -blockWidth || xPos > totalWallLength) continue;
        drawIsoBlock(xPos, yPos, 0, blockWidth, blockHeight, blockDepth);
      }
    }
  } else {
    var currentX = 0;
    var currentZ = 0;
    var direction = 0;
    
    for (var segIdx = 0; segIdx < wallRuns.length; segIdx++) {
      var segmentLength = wallRuns[segIdx].deducted;
      var segmentBlocks = Math.ceil(segmentLength * blocksPerMeter);
      
      for (var course = 0; course < totalCourses; course++) {
        var yPos = course * blockHeight;
        var offset = (course % 2) * (blockWidth / 2);
        
        for (var i = 0; i < segmentBlocks; i++) {
          var blockX, blockZ;
          
          if (direction === 0) {
            blockX = currentX + (i * blockWidth) + offset;
            blockZ = currentZ;
          } else if (direction === 1) {
            blockX = currentX;
            blockZ = currentZ + (i * blockWidth) + offset;
          } else if (direction === 2) {
            blockX = currentX - (i * blockWidth) - offset;
            blockZ = currentZ;
          } else {
            blockX = currentX;
            blockZ = currentZ - (i * blockWidth) - offset;
          }
          
          drawIsoBlock(blockX, yPos, blockZ, blockWidth, blockHeight, blockDepth);
        }
      }
      
      if (direction === 0) currentX += segmentLength;
      else if (direction === 1) currentZ += segmentLength;
      else if (direction === 2) currentX -= segmentLength;
      else currentZ -= segmentLength;
      
      direction = (direction + 1) % 4;
      
      if (segIdx < wallRuns.length - 1) {
        var topY = totalCourses * blockHeight;
        var cp = iso(currentX, topY, currentZ);
        var scp = { x: originX + cp.x * scale, y: originY + cp.y * scale };
        
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(scp.x, scp.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
  
  var legendX = 30;
  var legendY = canvas.height - 180;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.fillRect(legendX - 10, legendY - 10, 320, 150);
  ctx.strokeRect(legendX - 10, legendY - 10, 320, 150);
  
  ctx.fillStyle = '#2d2d2d';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('SPECIFICATIONS', legendX, legendY);
  
  ctx.font = '12px Arial';
  ctx.fillStyle = '#444';
  var lineHeight = 22;
  var line = 1;
  ctx.fillText('Wall Length: ' + totalWallLength.toFixed(2) + 'm', legendX, legendY + lineHeight * line++);
  ctx.fillText('Height: ' + wallHeight.toFixed(2) + 'm (' + totalCourses + ' courses)', legendX, legendY + lineHeight * line++);
  ctx.fillText('Block: ' + b.n, legendX, legendY + lineHeight * line++);
  
  var c = calcGroup(group);
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#00A3E8';
  ctx.fillText('Total Blocks: ' + c.tot, legendX, legendY + lineHeight * line++);
  
  ctx.font = '11px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('1m reference', canvas.width - 150, canvas.height - 40);
  
  var refP1 = iso(0, 0, 0);
  var refP2 = iso(1, 0, 0);
  var sref1 = { x: canvas.width - 140, y: canvas.height - 25 };
  var sref2 = { x: sref1.x + (refP2.x - refP1.x) * scale, y: sref1.y + (refP2.y - refP1.y) * scale };
  
  ctx.strokeStyle = '#00A3E8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sref1.x, sref1.y);
  ctx.lineTo(sref2.x, sref2.y);
  ctx.stroke();
  
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sref1.x, sref1.y - 4);
  ctx.lineTo(sref1.x, sref1.y + 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sref2.x, sref2.y - 4);
  ctx.lineTo(sref2.x, sref2.y + 4);
  ctx.stroke();
  
  return canvas.toDataURL();
}

function openDiagram(groupIndex) {
  var group = groups[groupIndex];
  if (!group) return;
  
  var dataURL = renderWallDiagram(group);
  if (!dataURL) return;
  
  var modal = document.getElementById('diagramModal');
  var canvas = document.getElementById('diagramCanvas');
  
  var img = new Image();
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataURL;
  
  modal.classList.remove('hidden');
  window.currentDiagram = dataURL;
  window.currentDiagramGroup = groupIndex;
}

function closeDiagram() {
  document.getElementById('diagramModal').classList.add('hidden');
}

function saveDiagramPNG() {
  if (!window.currentDiagram) return;
  var link = document.createElement('a');
  link.download = 'wall-diagram-' + Date.now() + '.png';
  link.href = window.currentDiagram;
  link.click();
}

function attachDiagramToPDF() {
  if (window.currentDiagram && window.currentDiagramGroup !== undefined) {
    groups[window.currentDiagramGroup].diagram = window.currentDiagram;
    closeDiagram();
    alert('Diagram attached to quote!');
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
