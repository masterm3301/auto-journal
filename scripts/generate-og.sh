#!/bin/bash
# Regenerates app/opengraph-image.png (the social-share cover) and
# app/apple-icon.png using headless Chrome, which shapes Arabic correctly
# (unlike next/og's Satori renderer, which renders disjointed letters).
# Run from the repo root: bash scripts/generate-og.sh
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
FONT_B64=$(base64 -i assets/fonts/ArefRuqaa-Bold.ttf)

cat > "$TMP/og.html" <<EOF
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8">
<style>
@font-face { font-family: "Aref Ruqaa"; src: url(data:font/ttf;base64,$FONT_B64) format("truetype"); font-weight: 700; }
* { margin: 0; padding: 0; }
body { width: 1200px; height: 630px; background: #111111; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: "Aref Ruqaa", serif; }
.name { color: #ffffff; font-size: 230px; font-weight: 700; line-height: 1.05; }
.rule { width: 520px; border-top: 2px solid #666666; margin-top: 10px; }
.tag { color: #cccccc; font-size: 42px; margin-top: 34px; }
</style></head>
<body><div class="name">ماجد</div><div class="rule"></div><div class="tag">صحيفة إلكترونية مغربية — الأخبار على مدار الساعة</div></body>
</html>
EOF

cat > "$TMP/apple.html" <<'EOF'
<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; }
body { width: 180px; height: 180px; background: #111111; display: flex; align-items: center; justify-content: center; }
div { color: #ffffff; font-size: 130px; font-weight: 700; font-family: Georgia, "Times New Roman", serif; }
</style></head><body><div>M</div></body></html>
EOF

"$CHROME" --headless --disable-gpu --screenshot=app/opengraph-image.png --window-size=1200,630 --hide-scrollbars "file://$TMP/og.html"
"$CHROME" --headless --disable-gpu --screenshot=app/apple-icon.png --window-size=180,180 --hide-scrollbars "file://$TMP/apple.html"
rm -rf "$TMP"
echo "done: app/opengraph-image.png + app/apple-icon.png"
