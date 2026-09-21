using UnityEngine;
using UnityEngine.UI;
using LastWhistle.Core;

namespace LastWhistle.World
{
    public class MapDirector : MonoBehaviour
    {
        public static MapDirector Ensure()
        {
            var existing = FindObjectOfType<MapDirector>();
            if (existing != null)
            {
                existing.BuildPins();
                return existing;
            }
            var go = new GameObject("MapDirector");
            return go.AddComponent<MapDirector>();
        }

        void Start() => BuildPins();

        public void BuildPins()
        {
            var space = FindObjectOfType<RoomSpace>();
            if (space == null || space.backdrop == null) return;
            var spr = ArtLibrary.Sprite("map");
            if (spr != null)
            {
                space.backdrop.sprite = spr;
                RoomRuntime.Fit(space.backdrop, Camera.main, 0.95f);
            }
            foreach (var hs in FindObjectsOfType<WorldHotspot>())
            {
                hs.gameObject.SetActive(false);
                Destroy(hs.gameObject);
            }
            foreach (var spot in RoomCatalog.MapSpots())
                RoomRuntime.SpawnHotspot(spot, "map", null, space);

            foreach (var hs in FindObjectsOfType<WorldHotspot>())
            {
                if (hs.data == null || string.IsNullOrEmpty(hs.data.travel)) continue;
                if (hs.transform.Find("Pin") != null) continue;
                var pin = new GameObject("Pin");
                pin.transform.SetParent(hs.transform, false);
                pin.transform.localPosition = new Vector3(0, 0.42f, 0);
                var canvas = pin.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.WorldSpace;
                canvas.worldCamera = Camera.main;
                var rt = pin.GetComponent<RectTransform>();
                if (rt == null) rt = pin.AddComponent<RectTransform>();
                rt.sizeDelta = new Vector2(260, 42);
                rt.localScale = Vector3.one * 0.015f;
                var img = pin.AddComponent<Image>();
                img.sprite = UiKit.Pixel;
                img.color = new Color(0.10f, 0.14f, 0.20f, 0.9f);
                img.raycastTarget = false;
                var t = UiKit.Label(rt, "L", hs.data.label, 20, UiKit.Cream, TextAnchor.MiddleCenter);
                t.raycastTarget = false;
            }
        }
    }
}
