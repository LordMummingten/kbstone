/* KB Stone Pro - PDF Generators */

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
  });

  var html = '<!DOCTYPE html><html><head><title>Quote ' + d.num + '</title>';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;font-size:13px}';
  html += '.hdr{border-bottom:3px solid #00A3E8;padding-bottom:16px;margin-bottom:24px}';
  html += '.hdr h1{color:#00A3E8;margin:0;font-size:26px}';
  html += '.hdr p{margin:4px 0;font-size:11px;color:#666}';
  html += '.info{display:flex;justify-content:space-between;margin-bottom:24px}';
  html += '.info div{font-size:12px}';
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
  html += '</style></head><body>';
  
  // Header
  html += '<div class="hdr">';
  html += '<h1>KB Stone Pty Ltd</h1>';
  html += '<p>ABN: 75 686 625 801 | ACN: 686 625 801</p>';
  html += '<p>Ã°Å¸â€œÅ¾ 0451 838 748 | Ã¢Å“â€°Ã¯Â¸Â kieron@kbstone.org | Ã°Å¸Å’Â kbstone.org</p>';
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
  html += '50% deposit on booking Ã¢â‚¬Â¢ 50% on completion Ã¢â‚¬Â¢ Variations quoted separately Ã¢â‚¬Â¢ ';
  html += 'Client responsible for site access Ã¢â‚¬Â¢ Weather delays may apply Ã¢â‚¬Â¢ Valid 30 days</div>';
  
  // Footer
  html += '<div class="ftr">KB Stone Pty Ltd | Professional Limestone & Natural Stone | Swan Valley, Perth</div>';
  html += '</body></html>';
  
  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}

// Materials Order PDF
function pdfMaterials() {
  var d = window.QD, a = d.agg;
  
  var rows = '';
  for (var k in a.blks) {
    var B = a.blks[k];
    rows += '<tr><td><div class="cb"></div></td><td>' + B.n + '</td><td><b>' + B.q + '</b></td><td></td></tr>';
  }
  rows += '<tr><td><div class="cb"></div></td><td>Brickies Sand</td><td><b>' + a.scoops + ' scoops</b></td><td>' + (a.scoops / 3).toFixed(1) + 'mÃ‚Â³</td></tr>';
  rows += '<tr><td><div class="cb"></div></td><td>Cement 20kg</td><td><b>' + a.bags + ' bags</b></td><td></td></tr>';
  if (a.cap > 0) rows += '<tr><td><div class="cb"></div></td><td>Capping</td><td><b>' + a.cap + '</b></td><td></td></tr>';
  if (a.drain > 0) rows += '<tr><td><div class="cb"></div></td><td>AG Pipe</td><td><b>' + a.drain + 'm</b></td><td></td></tr>';
  if (a.reo > 0) rows += '<tr><td><div class="cb"></div></td><td>Reo Bar</td><td><b>' + a.reo + 'm</b></td><td></td></tr>';
  if (a.oxide > 0) rows += '<tr><td><div class="cb"></div></td><td>Oxide</td><td><b>' + a.oxide + '</b></td><td></td></tr>';
  if (a.stick > 0) rows += '<tr><td><div class="cb"></div></td><td>Stick Joints</td><td><b>' + a.stick + '</b></td><td></td></tr>';
  if (a.skipOn) rows += '<tr><td><div class="cb"></div></td><td>Skip Bin</td><td><b>' + a.skipSize + '</b></td><td></td></tr>';

  var html = '<!DOCTYPE html><html><head><title>Materials ' + d.num + '</title>';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto}';
  html += 'h1{color:#00A3E8;font-size:20px;border-bottom:2px solid #00A3E8;padding-bottom:8px}';
  html += '.info{background:#f0f9ff;padding:12px;border-radius:6px;margin-bottom:16px;font-size:12px}';
  html += 'table{width:100%;border-collapse:collapse}';
  html += 'th,td{padding:10px;text-align:left;border:1px solid #ddd;font-size:12px}';
  html += 'th{background:#00A3E8;color:#fff}';
  html += '.cb{width:20px;height:20px;border:2px solid #333}';
  html += '</style></head><body>';
  
  html += '<h1>Ã°Å¸â€œÂ¦ Materials Order</h1>';
  html += '<div class="info"><b>Quote:</b> ' + d.num + ' | <b>Client:</b> ' + d.name + '<br>';
  html += '<b>Address:</b> ' + d.addr + ' | <b>Date:</b> ' + d.date + '</div>';
  html += '<table><tr><th style="width:36px">Ã¢Å“â€œ</th><th>Item</th><th>Qty</th><th>Notes</th></tr>';
  html += rows + '</table>';
  html += '<p style="margin-top:24px;font-size:10px;color:#666">Generated: ' + new Date().toLocaleString() + '</p>';
  html += '</body></html>';
  
  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
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
    if (g.ct > 0 && g.cq > 0) mats += '<tr><td>Cuts</td><td>' + g.cq + ' Ãƒâ€” ' + g.ct + ' cuts</td></tr>';
  });

  var html = '<!DOCTYPE html><html><head><title>Job ' + d.num + '</title>';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:0 auto;font-size:12px}';
  html += 'h1{color:#00A3E8;font-size:20px;border-bottom:2px solid #00A3E8;padding-bottom:8px}';
  html += '.sec{margin-bottom:16px;padding:12px;background:#f9f9f9;border-radius:6px}';
  html += '.sec h3{margin:0 0 10px 0;font-size:14px}';
  html += 'table{width:100%;border-collapse:collapse}';
  html += 'td{padding:6px;border-bottom:1px solid #eee}';
  html += '.lbl{font-weight:600;width:35%;background:#f8f8f8}';
  html += '.haz{background:#fee2e2;padding:12px;border-radius:6px;border-left:4px solid #ef4444;margin-bottom:16px}';
  html += '.sign{border:1px solid #ccc;height:50px;margin-top:6px}';
  html += '</style></head><body>';
  
  html += '<h1>Ã°Å¸â€˜Â· Job Sheet</h1>';
  
  // Details
  html += '<div class="sec"><h3>Ã°Å¸â€œâ€¹ Details</h3><table>';
  html += '<tr><td class="lbl">Quote #</td><td>' + d.num + '</td></tr>';
  html += '<tr><td class="lbl">Client</td><td>' + d.name + '</td></tr>';
  html += '<tr><td class="lbl">Phone</td><td>' + d.phone + '</td></tr>';
  html += '<tr><td class="lbl">Address</td><td>' + d.addr + '</td></tr>';
  html += '<tr><td class="lbl">Project</td><td>' + d.type + '</td></tr>';
  html += '<tr><td class="lbl">Est. Hours</td><td>' + a.labHrs.toFixed(1) + '</td></tr>';
  html += '<tr><td class="lbl">Staff Days</td><td>' + a.staffD + '</td></tr>';
  html += '</table></div>';
  
  // Materials
  html += '<div class="sec"><h3>Ã°Å¸Â§Â± Materials</h3><table>' + mats + '</table></div>';
  
  // Notes
  html += '<div class="sec"><h3>Ã°Å¸â€œÂ Notes</h3><p>' + (d.notes || 'None') + '</p></div>';
  
  // Hazards
  html += '<div class="haz"><h3 style="margin:0 0 8px 0">Ã¢Å¡Â Ã¯Â¸Â Hazards</h3><div class="sign"></div></div>';
  
  // Sign-off
  html += '<div class="sec"><h3>Ã¢Å“â€¦ Sign-off</h3><table>';
  html += '<tr><td class="lbl">Completed By</td><td></td></tr>';
  html += '<tr><td class="lbl">Date</td><td></td></tr>';
  html += '<tr><td class="lbl">Client Sig</td><td><div class="sign"></div></td></tr>';
  html += '</table></div>';
  
  html += '</body></html>';
  
  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}