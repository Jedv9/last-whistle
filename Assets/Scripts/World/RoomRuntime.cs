using UnityEngine;
using LastWhistle.Core;
using LastWhistle.UI;

namespace LastWhistle.World
{
    /// <summary>Rebuilds painted-room hotspots at runtime so catalog changes work without a fresh scene bake.</summary>
    public class RoomRuntime : MonoBehaviour
    {
        public static void Ensure()
        {
            var scene = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
            if (scene == "Title" || scene == "Fight" || scene == "Map") return;
            var space = Object.FindObjectOfType<RoomSpace>();
            var walk = Object.FindObjectOfType<WalkController>();
            if (space == null || walk == null) return;
            string loc = GameState.Instance != null ? GameState.Instance.locationId : walk.locationId;
            if (string.IsNullOrEmpty(loc) || loc == "map" || loc == "fight")
                loc = GameShell.LocFromScene(scene);
            if (string.IsNullOrEmpty(loc)) loc = "bunk";
            Configure(loc, space, walk);
        }

        public static void Configure(string loc, RoomSpace space, WalkController walk)
        {
            walk.locationId = loc;
            if (GameState.Instance != null) GameState.Instance.locationId = loc;

            var file = ArtLibrary.FileForLoc(loc);
            var spr = ArtLibrary.Sprite(file);
            if (spr != null && space.backdrop != null)
            {
                space.backdrop.sprite = spr;
                Fit(space.backdrop, Camera.main, 0.88f);
            }

            foreach (var hs in Object.FindObjectsOfType<WorldHotspot>())
            {
                hs.gameObject.SetActive(false);
                Object.Destroy(hs.gameObject);
            }
            foreach (var t in Object.FindObjectsOfType<Transform>())
            {
                if (t != null && t.name == "Solid")
                {
                    t.gameObject.SetActive(false);
                    Object.Destroy(t.gameObject);
                }
            }

            foreach (var solid in RoomCatalog.Solids(loc))
            {
                var go = new GameObject("Solid");
                go.transform.position = space.PctToWorld(solid.x + solid.w / 2f, solid.y + solid.h / 2f);
                var box = go.AddComponent<BoxCollider2D>();
                box.size = space.PctSizeToWorld(solid.w, solid.h);
            }

            foreach (var hs in RoomCatalog.Hotspots(loc))
                SpawnHotspot(hs, loc, walk, space);

            var floor = RoomCatalog.Floor(loc);
            walk.transform.position = space.PctToWorld(50, floor.minY + 6);
        }

        public static void SpawnHotspot(HotspotPct hs, string loc, WalkController walk, RoomSpace space)
        {
            var go = new GameObject(string.IsNullOrEmpty(hs.label) ? "Hotspot" : hs.label);
            var center = space.PctToWorld(hs.x + hs.w / 2f, hs.y + hs.h / 2f);
            var size = space.PctSizeToWorld(Mathf.Max(hs.w, 6f), Mathf.Max(hs.h, 6f));
            go.transform.position = center;
            var box = go.AddComponent<BoxCollider2D>();
            box.isTrigger = true;
            box.size = size;
            var rb = go.AddComponent<Rigidbody2D>();
            rb.bodyType = RigidbodyType2D.Kinematic;
            var wh = go.AddComponent<WorldHotspot>();
            wh.data = hs;
            wh.walker = walk;
            wh.locationId = loc;
            if (hs.bang)
            {
                var marker = new GameObject("Bang");
                marker.transform.SetParent(go.transform, false);
                marker.transform.localPosition = new Vector3(0, size.y * 0.5f + 0.2f, 0);
                var tr = marker.AddComponent<TextMesh>();
                tr.text = "!";
                tr.fontSize = 32;
                tr.color = new Color(1f, 0.85f, 0.2f);
                tr.anchor = TextAnchor.MiddleCenter;
                marker.transform.localScale = Vector3.one * 0.15f;
            }
        }

        public static void Fit(SpriteRenderer sr, Camera cam, float fill)
        {
            if (sr == null || sr.sprite == null || cam == null) return;
            float worldH = cam.orthographicSize * 2f * fill;
            float worldW = worldH * cam.aspect;
            var b = sr.sprite.bounds.size;
            float scale = Mathf.Min(worldW / Mathf.Max(0.01f, b.x), worldH / Mathf.Max(0.01f, b.y));
            sr.transform.localScale = Vector3.one * scale;
        }
    }
}
