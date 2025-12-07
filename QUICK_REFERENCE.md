# KB Stone Pro - Phase 1 Quick Reference

## 🎯 What Changed

### 1. WA Substrate System
**Location**: Client Details → Site Conditions dropdown

**Options**:
- Sand (easy) - hardness 0.9×, cut 0.8×, waste +0%
- Clay (medium) - hardness 1.2×, cut 1.1×, waste +2%
- Limestone/caprock (hard) - hardness 1.6×, cut 1.5×, waste +4%

**Effect**: Automatically adjusts labor hours, cutting costs, and waste percentage throughout quote.

### 2. Retaining Wall Slope Calculator
**Shows when**: Project Type = "Retaining Wall"

**Fields**: Start Height, End Height

**Auto-calculates**:
- Average wall height
- Required buried courses (min 2, or 1/3 of avg height)
- Extra blocks for slope transition
- Adds to base block count automatically

**Visual**: Blue box (⛰️) in each block group

### 3. Stairs/Steps Calculator
**Shows when**: Project Type = "Stairs" or "Steps"

**Fields**: Steps, Rise (mm), Depth (mm)

**Auto-calculates**:
- Total rise and run
- Stair angle in degrees
- Safety warning if angle outside 25-40°
- Block count with 1.5× complexity multiplier

**Visual**: Yellow box (🪜) in each block group

### 4. PDF Improvements
**Old behavior**: Auto-printed immediately

**New behavior**:
- Opens with toolbar (Back | Save PDF | Share)
- No auto-print
- Back button returns to app (iOS safe)
- Share button uses native share if available

## 📱 How to Use

### Basic Workflow
1. Select Project Type (Retaining Wall, Stairs, etc.)
2. Select Site Conditions (Sand, Clay, Limestone)
3. Fill in block group details
4. Calculator appears automatically if relevant
5. Soil hint shows multipliers being applied
6. Generate PDF when ready
7. Use toolbar to Save or Share (no auto-print!)

### Retaining Wall Example
```
Project Type: Retaining Wall
Site Conditions: Clay

Block Group 1:
  ⛰️ Slope Calculator
  Start Height: 1.5m
  End Height: 0.8m
  
  → Auto shows: Avg 1.15m, 4 buried courses, +25 blocks
  → Labor × 1.2 (clay hardness)
  → Cutting × 1.1 (clay)
  → Waste +2%
```

### Stairs Example
```
Project Type: Stairs
Site Conditions: Limestone

Block Group 1:
  🪜 Stairs Calculator
  Steps: 6
  Rise: 200mm
  Depth: 300mm
  
  → Total rise: 1.2m, run: 1.8m
  → Angle: 33.7° (safe ✓)
  → Blocks calculated with 1.5× multiplier
  → Labor × 1.6 (limestone hardness)
  → Waste +4%
```

## 🔧 Admin Panel

No changes to admin UI, but now saves/loads:
- Soil configuration (can be customized)
- Reset to Defaults includes soil reset

## 💾 What's Persisted

**localStorage saves**:
- Selected soil type
- Selected project type
- All admin settings (including soil multipliers)

**Persists across**:
- Page reloads
- Browser restarts
- PWA sessions

## ⚠️ Important Notes

1. **Manual Override Still Works**: If you enter a manual block count (Block Override > 0), it ignores all auto-calculations

2. **Soil Multipliers Are Transparent**: Look for the hint below block override:
   ```
   Soil: limestone | hardness 1.6× | cut 1.5× | waste +4%
   ```

3. **PDF Back Button**: Works on iOS Safari! Uses browser history, falls back to home if needed.

4. **Calculator Visibility**: Slope and Stairs calculators ONLY show for their specific project types. Other types show standard inputs.

5. **Dark Mode**: Everything still works in dark mode.

## 🐛 Troubleshooting

**Calculator not showing?**
- Check Project Type exactly matches "Retaining Wall", "Stairs", or "Steps"

**Soil multipliers not applying?**
- Refresh page to load from localStorage
- Check soil type is selected

**PDF opens but blank?**
- Check browser popup blocker
- Try different browser

**Back button doesn't work?**
- May need to close PDF tab manually first time
- Works better after one successful navigation

**Settings not persisting?**
- Check if in private/incognito mode
- Verify localStorage enabled in browser

## 📊 File List

**Deploy these 5 files**:
1. index.html (14KB)
2. worker.js (26KB)
3. pdf.js (14KB)
4. admin.js (10KB)
5. pwa.js (1.2KB)

**Plus existing** (unchanged):
- style.css
- manifest.json
- sw.js
- icons (180, 192, 512)

## ✅ Verification Checklist

After deployment, test:
- [ ] Soil dropdown works and persists
- [ ] Project type dropdown persists
- [ ] Slope calculator shows for Retaining Wall
- [ ] Stairs calculator shows for Stairs/Steps
- [ ] Soil hint visible in block groups
- [ ] PDF opens without auto-print
- [ ] PDF Back button returns to app
- [ ] PDF Save triggers print
- [ ] Dark mode still works
- [ ] Admin reset clears all

## 📞 Quick Support

**Soil not affecting calculations?**
1. Check the soil hint under block override
2. Verify numbers match selected soil type
3. If wrong, clear localStorage and reload

**PDF issues on iOS?**
1. Update to latest iOS
2. Use Safari (not Chrome)
3. Allow popups for this site
4. Test share button instead

**Lost all quotes?**
1. Check browser localStorage
2. May have cleared site data
3. Quotes are client-side only

## 🎓 Training Tips

**For Kieron (prefers mm)**:
- Can still enter dimensions as whole numbers (e.g., 1200)
- System auto-converts to meters

**For Kristen (prefers m)**:
- Can enter decimals (e.g., 1.2)
- System handles both formats

**For both**:
- Soil type makes a real difference - limestone jobs take ~60% more time
- Slope calculator saves manual buried course calculations
- Stairs calculator ensures safe angles automatically
- PDF toolbar eliminates accidental prints!
