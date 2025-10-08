// requirements -> cam satırları (gruplanmış) üretir
export function mapGlass(requirements) {
  const map = new Map(); // key: `${glass_type_id}|${width}|${height}|${colorKey}`

  const add = (g) => {
    const width  = Number(g.width_mm || 0);
    const height = Number(g.height_mm || 0);
    const count  = Number(g.count || 0);

    // isimler
    const cam_isim   = g.glass_type?.cam_isim || g.glass_type_name || '-';
    const color_name = g.glass_color?.name || "";

    // m2 (ham) — mevcut mantık korunur
    const area_m2 = g.area_m2 != null
      ? Number(g.area_m2)
      : (width / 1000) * (height / 1000) * count;

    // 🔑 YENİ: renk de anahtara dahil.
    // Önce id'yi kullan, yoksa name, o da yoksa "null"
    const colorKey =
      g.glass_color_id
      ?? g.glass_color?.id
      ?? (color_name || "null");

    const key = `${g.glass_type_id || g.glass_type?.id || cam_isim}|${width}|${height}|${colorKey}`;

    if (!map.has(key)) {
      map.set(key, {
        cam_isim,
        width_mm: width,
        height_mm: height,
        count: 0,
        m2: 0,
        color_name // PDF tarafında "cam_isim - renk" yazabilsin diye satıra koyuyoruz
      });
    }

    const row = map.get(key);
    row.count += count;
    row.m2    += area_m2;
  };

  // systems > glasses
  (requirements?.systems || []).forEach(sys => (sys.glasses || []).forEach(add));

  // extra_glasses (varsa)
  (requirements?.extra_glasses || []).forEach(add);

  // diziye çevir (m2 ham değer kalsın)
  return Array.from(map.values());
}
