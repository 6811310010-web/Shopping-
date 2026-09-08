# map_plotter.py

import folium

# ============================================================
# STORE INFORMATION
# ============================================================

store_name = "CS Tech Store"

latitude = 1.3521
longitude = 103.8198

# ============================================================
# CREATE MAP
# ============================================================

store_map = folium.Map(
    location=[latitude, longitude],
    zoom_start=15
)

# ============================================================
# STORE INFORMATION POPUP
# ============================================================

popup_html = """
<div style="width: 250px; font-family: Arial;">

    <h3>🛒 CS Tech Store</h3>

    <p>
        <b>Rating:</b> ⭐ 4.5 / 5
    </p>

    <p>
        <b>Opening Hours:</b><br>
        Monday - Sunday<br>
        08:00 - 22:00
    </p>

    <p>
        <b>Categories:</b><br>
        Electronics, Fitness, Home
    </p>

</div>
"""

# ============================================================
# ADD STORE MARKER
# ============================================================

folium.Marker(
    location=[latitude, longitude],

    popup=folium.Popup(
        popup_html,
        max_width=300
    ),

    tooltip=store_name,

    icon=folium.Icon(
        icon="shopping-cart",
        prefix="fa"
    )
).add_to(store_map)

# ============================================================
# SAVE MAP
# ============================================================

store_map.save("templates/store_map.html")

print("✅ Store map generated successfully!")
print("📍 Saved to templates/store_map.html")