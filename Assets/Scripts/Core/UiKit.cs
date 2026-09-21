using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace LastWhistle.Core
{
    /// <summary>Procedural uGUI so scenes do not depend on Punch Club art or prefabs.</summary>
    public static class UiKit
    {
        public static readonly Color Wood = new Color(0.42f, 0.30f, 0.18f, 0.97f);
        public static readonly Color WoodDark = new Color(0.22f, 0.15f, 0.09f, 0.96f);
        public static readonly Color Cream = new Color(0.93f, 0.86f, 0.70f);
        public static readonly Color Ink = new Color(0.12f, 0.10f, 0.08f);
        public static readonly Color StrRed = new Color(0.72f, 0.14f, 0.20f);
        public static readonly Color AgiBlue = new Color(0.14f, 0.38f, 0.74f);
        public static readonly Color StaGreen = new Color(0.20f, 0.55f, 0.22f);
        public static readonly Color BarGreen = new Color(0.42f, 0.82f, 0.28f);
        public static readonly Color HpGreen = new Color(0.28f, 0.78f, 0.30f);
        public static readonly Color EnYellow = new Color(0.95f, 0.82f, 0.16f);
        public static readonly Color SlotBlue = new Color(0.22f, 0.46f, 0.88f);
        public static readonly Color NavCyan = new Color(0.48f, 0.80f, 0.90f);
        public static readonly Color Gold = new Color(0.95f, 0.74f, 0.18f);
        public static readonly Color Money = new Color(0.32f, 0.72f, 0.32f);
        public static readonly Color Panel = new Color(0.10f, 0.11f, 0.13f, 0.94f);
        public static readonly Color Panel2 = new Color(0.16f, 0.17f, 0.20f, 0.96f);
        public static readonly Color Dim = new Color(0f, 0f, 0f, 0.55f);

        static Sprite _px;
        static Font _font;
        static readonly Dictionary<string, Sprite> Icons = new Dictionary<string, Sprite>();

        public static Sprite Pixel
        {
            get
            {
                if (_px == null)
                {
                    var t = new Texture2D(1, 1, TextureFormat.RGBA32, false);
                    t.SetPixel(0, 0, Color.white);
                    t.Apply();
                    t.filterMode = FilterMode.Point;
                    t.hideFlags = HideFlags.DontSave;
                    _px = Sprite.Create(t, new Rect(0, 0, 1, 1), new Vector2(0.5f, 0.5f), 1f);
                    _px.hideFlags = HideFlags.DontSave;
                }
                return _px;
            }
        }

        public static Font Font
        {
            get
            {
                if (_font == null)
                {
                    _font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                    if (_font == null) _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                }
                return _font;
            }
        }

        public static bool PointerOverUi()
        {
            if (EventSystem.current == null) return false;
            if (EventSystem.current.IsPointerOverGameObject()) return true;
            if (Input.touchCount > 0 && EventSystem.current.IsPointerOverGameObject(Input.GetTouch(0).fingerId))
                return true;
            return false;
        }

        public static Canvas MakeOverlayCanvas(string name, int sort)
        {
            var go = new GameObject(name);
            Object.DontDestroyOnLoad(go);
            var canvas = go.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = sort;
            var scaler = go.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;
            go.AddComponent<GraphicRaycaster>();
            if (Object.FindObjectOfType<EventSystem>() == null)
            {
                var es = new GameObject("EventSystem");
                Object.DontDestroyOnLoad(es);
                es.AddComponent<EventSystem>();
                es.AddComponent<StandaloneInputModule>();
            }
            return canvas;
        }

        public static RectTransform Panel(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            var rt = go.GetComponent<RectTransform>();
            rt.SetParent(parent, false);
            rt.anchorMin = anchorMin;
            rt.anchorMax = anchorMax;
            rt.offsetMin = offsetMin;
            rt.offsetMax = offsetMax;
            var img = go.GetComponent<Image>();
            img.sprite = Pixel;
            img.color = color;
            img.raycastTarget = true;
            return rt;
        }

        public static RectTransform Stretch(Transform parent, string name, Color color)
        {
            return Panel(parent, name, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero, color);
        }

        public static Text Label(Transform parent, string name, string text, int size, Color color, TextAnchor align, FontStyle style = FontStyle.Bold)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            var rt = go.GetComponent<RectTransform>();
            rt.SetParent(parent, false);
            StretchFill(rt);
            var t = go.GetComponent<Text>();
            t.font = Font;
            t.fontSize = size;
            t.color = color;
            t.alignment = align;
            t.fontStyle = style;
            t.text = text;
            t.horizontalOverflow = HorizontalWrapMode.Overflow;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            t.raycastTarget = false;
            return t;
        }

        public static void StretchFill(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        public static Button MakeButton(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax, Color bg, string caption, int size, Color fg, UnityEngine.Events.UnityAction onClick)
        {
            var rt = Panel(parent, name, anchorMin, anchorMax, offsetMin, offsetMax, bg);
            var btn = rt.gameObject.AddComponent<Button>();
            var colors = btn.colors;
            colors.highlightedColor = Color.Lerp(bg, Color.white, 0.22f);
            colors.pressedColor = Color.Lerp(bg, Color.black, 0.2f);
            colors.normalColor = Color.white;
            btn.colors = colors;
            Label(rt, "Cap", caption, size, fg, TextAnchor.MiddleCenter);
            if (onClick != null) btn.onClick.AddListener(onClick);
            return btn;
        }

        public static Image Bar(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax, Color fill)
        {
            var back = Panel(parent, name, anchorMin, anchorMax, offsetMin, offsetMax, new Color(0.12f, 0.12f, 0.12f, 0.9f));
            var fillRt = Panel(back, "Fill", Vector2.zero, new Vector2(1, 1), new Vector2(2, 2), new Vector2(-2, -2), fill);
            return fillRt.GetComponent<Image>();
        }

        public static void SetFill(Image img, float t)
        {
            if (img == null) return;
            t = Mathf.Clamp01(t);
            var rt = img.rectTransform;
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = new Vector2(t, 1f);
            rt.offsetMin = new Vector2(1, 1);
            rt.offsetMax = new Vector2(-1, -1);
        }

        public static Sprite Icon(string key)
        {
            if (Icons.TryGetValue(key, out var s) && s != null) return s;
            var tex = PaintIcon(key);
            tex.hideFlags = HideFlags.DontSave;
            s = Sprite.Create(tex, new Rect(0, 0, tex.width, tex.height), new Vector2(0.5f, 0.5f), 64f);
            s.hideFlags = HideFlags.DontSave;
            Icons[key] = s;
            return s;
        }

        static Texture2D PaintIcon(string key)
        {
            int n = 64;
            var t = new Texture2D(n, n, TextureFormat.RGBA32, false);
            t.filterMode = FilterMode.Point;
            var clear = new Color(0, 0, 0, 0);
            var px = new Color[n * n];
            for (int i = 0;  i < px.Length; i++) px[i] = clear;
            void P(int x, int y, Color c)
            {
                if ((uint)x >= n || (uint)y >= n) return;
                px[y * n + x] = c;
            }
            void Box(int x, int y, int w, int h, Color c)
            {
                for (int iy = y; iy < y + h; iy++)
                    for (int ix = x; ix < x + w; ix++) P(ix, iy, c);
            }
            var ink = new Color(0.12f, 0.18f, 0.28f, 1f);
            var hi = Color.white;
            switch (key)
            {
                case "profile":
                    Box(24, 38, 16, 16, ink);
                    Box(18, 8, 28, 28, ink);
                    Box(26, 42, 12, 12, hi);
                    break;
                case "fight":
                    Box(14, 22, 36, 22, ink);
                    Box(8, 28, 14, 14, ink);
                    Box(42, 28, 14, 14, ink);
                    Box(20, 40, 8, 10, ink);
                    Box(36, 40, 8, 10, ink);
                    break;
                case "map":
                    Box(10, 14, 18, 18, ink);
                    Box(30, 22, 16, 20, ink);
                    Box(18, 36, 22, 16, ink);
                    Box(40, 10, 14, 14, ink);
                    break;
                case "skills":
                    Box(28, 8, 8, 40, ink);
                    Box(16, 28, 32, 8, ink);
                    Box(10, 40, 12, 12, ink);
                    Box(42, 40, 12, 12, ink);
                    Box(26, 48, 12, 12, ink);
                    break;
                case "journal":
                    Box(16, 10, 32, 44, ink);
                    Box(20, 16, 24, 4, hi);
                    Box(20, 26, 24, 4, hi);
                    Box(20, 36, 18, 4, hi);
                    break;
                case "health": Box(22, 18, 20, 28, new Color(0.8f, 0.2f, 0.25f)); Box(18, 30, 28, 10, new Color(0.8f, 0.2f, 0.25f)); break;
                case "hunger": Box(16, 16, 32, 8, ink); Box(20, 24, 24, 24, ink); break;
                case "energy":
                    Box(28, 8, 8, 16, Gold);
                    Box(20, 24, 24, 8, Gold);
                    Box(28, 32, 8, 20, Gold);
                    break;
                case "mood":
                    Box(16, 16, 32, 32, Gold);
                    Box(24, 36, 6, 6, ink);
                    Box(36, 36, 6, 6, ink);
                    Box(24, 22, 16, 6, ink);
                    break;
                case "str": Box(12, 20, 40, 12, hi); Box(28, 12, 8, 40, hi); break;
                case "agi": Box(16, 12, 10, 28, hi); Box(30, 20, 18, 8, hi); Box(40, 12, 10, 28, hi); break;
                case "sta": Box(18, 12, 28, 16, hi); Box(28, 24, 8, 28, hi); Box(22, 40, 20, 10, hi); break;
                case "coin": Box(20, 16, 24, 32, Gold); Box(28, 24, 8, 16, ink); break;
                case "crane": Box(12, 12, 40, 12, new Color(0.85f, 0.45f, 0.15f)); Box(40, 12, 10, 40, new Color(0.85f, 0.45f, 0.15f)); break;
                case "slip": Box(14, 18, 12, 28, new Color(0.3f, 0.7f, 0.9f)); Box(34, 18, 12, 28, new Color(0.3f, 0.7f, 0.9f)); break;
                case "galley": Box(16, 14, 32, 36, new Color(0.35f, 0.7f, 0.4f)); break;
                default: Box(16, 16, 32, 32, ink); break;
            }
            t.SetPixels(px);
            t.Apply();
            return t;
        }
    }
}
