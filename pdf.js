/* KB Stone Pro - PDF Generators with Toolbar */

// PDF Toolbar Generator
function getPdfToolbar(title) {
  var html = '<div id="pdfToolbar" style="position:fixed;top:0;left:0;right:0;background:#00A3E8;color:#fff;padding:12px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:1000;display:flex;justify-content:space-between;align-items:center;">';
  html += '<div style="font-weight:600;font-size:15px;">' + title + '</div>';
  html += '<div style="display:flex;gap:10px;">';
  
  // Back button
  html += '<button onclick="goBack()" style="background:#fff;color:#00A3E8;border:none;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;">← Back</button>';
  
  // Save as PDF button
  html += '<button onclick="window.print()" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid #fff;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;">💾 Save PDF</button>';
  
  // Share button (if supported)
  html += '<button onclick="shareDoc()" id="shareBtn" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid #fff;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;display:none;">📤 Share</button>';
  
  html += '</div></div>';
  
  // Spacer to push content below toolbar
  html += '<div style="height:60px;"></div>';
  
  // Scripts for toolbar functionality
  html += '<script>';
  html += 'function goBack() {';
  html += '  if (window.history.length > 1) {';
  html += '    window.history.back();';
  html += '  } else {';
  html += '    window.location.href = "/";';
  html += '  }';
  html += '}';
  
  html += 'function shareDoc() {';
  html += '  if (navigator.share) {';
  html += '    navigator.share({';
  html += '      title: document.title,';
  html += '      text: "KB Stone Quote",';
  html += '      url: window.location.href';
  html += '    }).catch(function(err) {';
  html += '      console.log("Share failed:", err);';
  html += '    });';
  html += '  }';
  html += '}';
  
  html += 'if (navigator.share) {';
  html += '  document.getElementById("shareBtn").style.display = "block";';
  html += '}';
  
  html += '</script>';
  
  return html;
}

// Client Quote PDF
function pdfQuote() {
  var d = window.QD, a = d.agg;
  
  var rows = '';
  a.grps.forEach(function(x, i) {
    var g = x.g, c = x.c;
    rows += '<tr><td colspan="3" style="background:#f0f9ff;font-weight:600">Section ' + (i + 1) + ': ' + c.b.n + '</td></tr>';
    rows += '<tr><td>Limestone Blocks</td><td>' + c.b.n + '</td><td style="text-align:right">' + c.tot + '</td></tr>';
    rows += '<tr><td>Brickies Sand</td><td>Scoops</td><td style="text-align:right">' + c.scoops + '</td></tr>';
    rows += '<tr><td>Cement</td><td>20kg bags</td><td style="text-align:right">' + c.bags + '</td></tr>';
    if (g.cap > 0) rows += '<tr><td>Capping</td><td></td><td style="text-align:right">' + g.cap + '</td></tr>';
    if (g.drain > 0) rows += '<tr><td>AG Pipe</td><td>metres</td><td style="text-align:right">' + g.drain + '</td></tr>';
    if (g.reo > 0) rows += '<tr><td>Reo Bar</td><td>metres</td><td style="text-align:right">' + g.reo + '</td></tr>';
    if (g.oxide > 0) rows += '<tr><td>Oxide</td><td>units</td><td style="text-align:right">' + g.oxide + '</td></tr>';
    if (g.stick > 0) rows += '<tr><td>Stick Joints</td><td>units</td><td style="text-align:right">' + g.stick + '</td></tr>';
    
    // Add diagram if attached
    if (g.diagram) {
      rows += '<tr><td colspan="3" style="padding:10px;"><img src="' + g.diagram + '" style="max-width:100%;border:1px solid #ddd;"/></td></tr>';
    }
  });

  var html = '<!DOCTYPE html><html><head><title>Quote ' + d.num + '</title>';
  html += '<meta name="viewport" content="width=device-width,initial-scale=1.0">';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto;font-size:13px}';
  html += '.hdr{border-bottom:3px solid #00A3E8;padding-bottom:16px;margin-bottom:24px}';
  html += '.hdr h1{color:#00A3E8;margin:0;font-size:26px}';
  html += '.hdr p{margin:4px 0;font-size:11px;color:#666}';
  html += '.info{display:flex;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;}';
  html += '.info div{font-size:12px;margin-bottom:10px;}';
  html += '.info strong{color:#00A3E8}';
  html += '.sec{margin-bottom:20px}';
  html += '.sec h3{color:#00A3E8;border-bottom:1px solid #ddd;padding-bottom:6px;margin-bottom:12px;font-size:15px}';
  html += 'table{width:100%;border-collapse:collapse}';
  html += 'th,td{padding:8px;text-align:left;border-bottom:1px solid #eee;font-size:12px}';
  html += 'th{background:#f8f8f8}';
  html += '.tot-row{background:#00A3E8;color:#fff}';
  html += '.tot-row td{font-size:16px;font-weight:700;padding:12px}';
  html += '.terms{font-size:10px;color:#666;margin-top:24px;padding:12px;background:#f9f9f9;border-radius:6px;line-height:1.5}';
  html += '.ftr{margin-top:30px;text-align:center;font-size:10px;color:#999}';
  html += '@media print { #pdfToolbar { display:none !important; } body { padding-top: 0 !important; } }';
  html += '</style></head><body>';
  
  // Add toolbar
  html += getPdfToolbar('📄 Client Quote');
  
  // Header
  html += '<div class="hdr">';
  html += '<h1>KB Stone Pty Ltd</h1>';
  html += '<p>ABN: 75 686 625 801 | ACN: 686 625 801</p>';
  html += '<p>📞 0451 838 748 | ✉️ kieron@kbstone.org | 🌐 kbstone.org</p>';
  html += '</div>';
  
  // Quote Info
  html += '<div class="info">';
  html += '<div><strong>Quote To:</strong><br>' + (d.name || 'Client') + '<br>';
  if (d.phone) html += d.phone + '<br>';
  html += (d.addr || 'Address') + '</div>';
  html += '<div style="text-align:right"><strong>Quote #:</strong> ' + d.num + '<br>';
  html += '<strong>Date:</strong> ' + d.date + '<br>';
  html += '<strong>Valid:</strong> 30 days</div>';
  html += '</div>';
  
  // Project
  html += '<div class="sec"><h3>Project: ' + d.type + '</h3>';
  if (d.notes) html += '<p style="color:#666">' + d.notes + '</p>';
  if (d.soil) html += '<p style="color:#0369a1;font-weight:600;margin-top:8px;">Site Conditions: ' + d.soil + '</p>';
  html += '</div>';
  
  // Scope
  html += '<div class="sec"><h3>Scope of Works</h3>';
  html += '<table><tr><th>Item</th><th>Details</th><th style="text-align:right">Qty</th></tr>';
  html += rows;
  if (a.skipOn) html += '<tr><td>Skip Bin</td><td>' + a.skipSize + '</td><td style="text-align:right">1</td></tr>';
  if (a.staffD > 0) html += '<tr><td>Installation</td><td>Staff & Machine</td><td style="text-align:right">' + a.staffD + ' days</td></tr>';
  if (a.delL > 0) html += '<tr><td>Delivery</td><td>Loads</td><td style="text-align:right">' + a.delL + '</td></tr>';
  html += '</table></div>';
  
  // Total
  html += '<div class="sec"><h3>Quote Total</h3>';
  html += '<table>';
  html += '<tr><td>Materials & Labour</td><td style="text-align:right">$' + (a.sub + a.profit).toFixed(2) + '</td></tr>';
  html += '<tr><td>GST (10%)</td><td style="text-align:right">$' + a.gst.toFixed(2) + '</td></tr>';
  html += '<tr class="tot-row"><td>TOTAL</td><td style="text-align:right">$' + a.grand.toFixed(2) + '</td></tr>';
  html += '</table></div>';
  
  // Terms
  html += '<div class="terms"><strong>Terms:</strong> ';
  html += '50% deposit on booking • 50% on completion • Variations quoted separately • ';
  html += 'Client responsible for site access • Weather delays may apply • Valid 30 days</div>';
  
  // Footer
  html += '<div class="ftr">KB Stone Pty Ltd | Professional Limestone & Natural Stone | Swan Valley, Perth</div>';
  html += '</body></html>';
  
  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

// Materials Order PDF
function pdfMaterials() {
  var d = window.QD, a = d.agg;
  
  var rows = '';
  for (var k in a.blks) {
    var B = a.blks[k];
    rows += '<tr><td><div class="cb"></div></td><td>' + B.n + '</td><td><b>' + B.q + '</b></td><td></td></tr>';
  }
  rows += '<tr><td><div class="cb"></div></td><td>Brickies Sand</td><td><b>' + a.scoops + ' scoops</b></td><td>' + (a.scoops / 3).toFixed(1) + 'm³</td></tr>';
  rows += '<tr><td><div class="cb"></div></td><td>Cement 20kg</td><td><b>' + a.bags + ' bags</b></td><td></td></tr>';
  if (a.cap > 0) rows += '<tr><td><div class="cb"></div></td><td>Capping</td><td><b>' + a.cap + '</b></td><td></td></tr>';
  if (a.drain > 0) rows += '<tr><td><div class="cb"></div></td><td>AG Pipe</td><td><b>' + a.drain + 'm</b></td><td></td></tr>';
  if (a.reo > 0) rows += '<tr><td><div class="cb"></div></td><td>Reo Bar</td><td><b>' + a.reo + 'm</b></td><td></td></tr>';
  if (a.oxide > 0) rows += '<tr><td><div class="cb"></div></td><td>Oxide</td><td><b>' + a.oxide + '</b></td><td></td></tr>';
  if (a.stick > 0) rows += '<tr><td><div class="cb"></div></td><td>Stick Joints</td><td><b>' + a.stick + '</b></td><td></td></tr>';
  if (a.skipOn) rows += '<tr><td><div class="cb"></div></td><td>Skip Bin</td><td><b>' + a.skipSize + '</b></td><td></td></tr>';
  
  // Add diagrams if attached
  a.grps.forEach(function(x, i) {
    var g = x.g;
    if (g.diagram) {
      rows += '<tr><td colspan="4" style="padding:10px;"><div style="font-weight:600;margin-bottom:5px;">Group ' + (i + 1) + ' Diagram:</div><img src="' + g.diagram + '" style="max-width:100%;border:1px solid #ddd;"/></td></tr>';
    }
  });

  var html = '<!DOCTYPE html><html><head><title>Materials ' + d.num + '</title>';
  html += '<meta name="viewport" content="width=device-width,initial-scale=1.0">';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto}';
  html += 'h1{color:#00A3E8;font-size:20px;border-bottom:2px solid #00A3E8;padding-bottom:8px}';
  html += '.info{background:#f0f9ff;padding:12px;border-radius:6px;margin-bottom:16px;font-size:12px}';
  html += 'table{width:100%;border-collapse:collapse}';
  html += 'th,td{padding:10px;text-align:left;border:1px solid #ddd;font-size:12px}';
  html += 'th{background:#00A3E8;color:#fff}';
  html += '.cb{width:20px;height:20px;border:2px solid #333}';
  html += '@media print { #pdfToolbar { display:none !important; } body { padding-top: 0 !important; } }';
  html += '</style></head><body>';
  
  // Add toolbar
  html += getPdfToolbar('📦 Materials Order');
  
  html += '<h1>📦 Materials Order</h1>';
  html += '<div class="info"><b>Quote:</b> ' + d.num + ' | <b>Client:</b> ' + d.name + '<br>';
  html += '<b>Address:</b> ' + d.addr + ' | <b>Date:</b> ' + d.date;
  if (d.soil) html += '<br><b>Site:</b> ' + d.soil;
  html += '</div>';
  html += '<table><tr><th style="width:36px">✓</th><th>Item</th><th>Qty</th><th>Notes</th></tr>';
  html += rows + '</table>';
  html += '<p style="margin-top:24px;font-size:10px;color:#666">Generated: ' + new Date().toLocaleString() + '</p>';
  html += '</body></html>';
  
  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

// Job Sheet PDF
function pdfJob() {
  var d = window.QD, a = d.agg;
  
  var mats = '';
  a.grps.forEach(function(x, i) {
    var g = x.g, c = x.c;
    mats += '<tr style="background:#f0f9ff"><td colspan="2"><b>Section ' + (i + 1) + ': ' + c.b.n + '</b></td></tr>';
    mats += '<tr><td>Blocks</td><td>' + c.tot + '</td></tr>';
    mats += '<tr><td>Sand</td><td>' + c.scoops + ' scoops</td></tr>';
    mats += '<tr><td>Cement</td><td>' + c.bags + ' bags</td></tr>';
    if (g.ct > 0 && g.cq > 0) mats += '<tr><td>Cuts</td><td>' + g.cq + ' × ' + g.ct + ' cuts</td></tr>';
    
    // Add diagram if attached
    if (g.diagram) {
      mats += '<tr><td colspan="2" style="padding:10px;"><img src="' + g.diagram + '" style="max-width:100%;border:1px solid #ddd;"/></td></tr>';
    }
  });

  var html = '<!DOCTYPE html><html><head><title>Job ' + d.num + '</title>';
  html += '<meta name="viewport" content="width=device-width,initial-scale=1.0">';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:20px;max-width:700px;margin:0 auto;font-size:12px}';
  html += 'h1{color:#00A3E8;font-size:20px;border-bottom:2px solid #00A3E8;padding-bottom:8px}';
  html += '.sec{margin-bottom:16px;padding:12px;background:#f9f9f9;border-radius:6px}';
  html += '.sec h3{margin:0 0 10px 0;font-size:14px}';
  html += 'table{width:100%;border-collapse:collapse}';
  html += 'td{padding:6px;border-bottom:1px solid #eee}';
  html += '.lbl{font-weight:600;width:35%;background:#f8f8f8}';
  html += '.haz{background:#fee2e2;padding:12px;border-radius:6px;border-left:4px solid #ef4444;margin-bottom:16px}';
  html += '.sign{border:1px solid #ccc;height:50px;margin-top:6px}';
  html += '@media print { #pdfToolbar { display:none !important; } body { padding-top: 0 !important; } }';
  html += '</style></head><body>';
  
  // Add toolbar
  html += getPdfToolbar('👷 Job Sheet');
  
  html += '<h1>👷 Job Sheet</h1>';
  
  // Details
  html += '<div class="sec"><h3>📋 Details</h3><table>';
  html += '<tr><td class="lbl">Quote #</td><td>' + d.num + '</td></tr>';
  html += '<tr><td class="lbl">Client</td><td>' + d.name + '</td></tr>';
  html += '<tr><td class="lbl">Phone</td><td>' + d.phone + '</td></tr>';
  html += '<tr><td class="lbl">Address</td><td>' + d.addr + '</td></tr>';
  html += '<tr><td class="lbl">Project</td><td>' + d.type + '</td></tr>';
  if (d.soil) html += '<tr><td class="lbl">Site Conditions</td><td>' + d.soil + '</td></tr>';
  html += '<tr><td class="lbl">Est. Hours</td><td>' + a.labHrs.toFixed(1) + '</td></tr>';
  html += '<tr><td class="lbl">Staff Days</td><td>' + a.staffD + '</td></tr>';
  html += '</table></div>';
  
  // Materials
  html += '<div class="sec"><h3>🧱 Materials</h3><table>' + mats + '</table></div>';
  
  // Notes
  html += '<div class="sec"><h3>📝 Notes</h3><p>' + (d.notes || 'None') + '</p></div>';
  
  // Hazards
  html += '<div class="haz"><h3 style="margin:0 0 8px 0">⚠️ Hazards</h3><div class="sign"></div></div>';
  
  // Sign-off
  html += '<div class="sec"><h3>✅ Sign-off</h3><table>';
  html += '<tr><td class="lbl">Completed By</td><td></td></tr>';
  html += '<tr><td class="lbl">Date</td><td></td></tr>';
  html += '<tr><td class="lbl">Client Sig</td><td><div class="sign"></div></td></tr>';
  html += '</table></div>';
  
  html += '</body></html>';
  
  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}
