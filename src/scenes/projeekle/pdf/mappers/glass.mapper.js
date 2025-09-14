// requirements -> cam satırları (gruplanmış) üretir
export function mapGlass(requirements) {
  const map = new Map(); // key: `${glass_type_id}|${width}|${height}`

  const add = (g) => {
    const width  = Number(g.width_mm || 0);
    const height = Number(g.height_mm || 0);
    const count  = Number(g.count || 0);
    const cam_isim = g.glass_type?.cam_isim || g.glass_type_name || '-';
    const area_m2 = g.area_m2 != null
      ? Number(g.area_m2)
      : (width / 1000) * (height / 1000) * count;

    const key = `${g.glass_type_id || g.glass_type?.id || cam_isim}|${width}|${height}`;
    if (!map.has(key)) {
      map.set(key, { cam_isim, width_mm: width, height_mm: height, count: 0, m2: 0 });
    }
    const row = map.get(key);
    row.count += count;
    row.m2 += area_m2;
  };

  // systems > glasses
  (requirements?.systems || []).forEach(sys => (sys.glasses || []).forEach(add));

  // extra_glasses (varsa)
  (requirements?.extra_glasses || []).forEach(add);

  // çıktıyı diziye çevir ve m2 3 hane yuvarlama motoru Engine'de yapılacak;
  // burada ham değer dursun ki sum sağlıklı olsun
  return Array.from(map.values());
}
