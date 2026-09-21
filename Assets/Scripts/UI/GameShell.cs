using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using LastWhistle.Core;
using LastWhistle.World;
using LastWhistle.Skills;

namespace LastWhistle.UI
{
    /// <summary>Persistent Punch Club chrome: wooden top bar + left icon rail.</summary>
    public class GameShell : MonoBehaviour
    {
        public static GameShell Instance { get; private set; }

        public Transform OverlayRoot => _overlay;
        public bool TitleMode { get; private set; } = true;

        Canvas _canvas;
        RectTransform _hud;
        RectTransform _nav;
        RectTransform _overlay;
        Image _hp, _hunger, _energy, _mood;
        Text _str, _agi, _sta, _gold, _cash, _day, _hex;
        OverlayHub _panels;
        bool _fightMode;

        public static GameShell Ensure()
        {
            if (Instance != null) return Instance;
            var go = new GameObject("GameShell");
            return go.AddComponent<GameShell>();
        }

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            _canvas = UiKit.MakeOverlayCanvas("WhistleHud", 50);
            _canvas.transform.SetParent(transform, false);
            BuildHud();
            _overlay = UiKit.Panel(_canvas.transform, "Overlays", Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero, new Color(0, 0, 0, 0)).GetComponent<RectTransform>();
            _overlay.GetComponent<Image>().raycastTarget = false;
            _panels = new OverlayHub(_overlay, this);
            SceneManager.sceneLoaded += OnScene;
            var scene = SceneManager.GetActiveScene().name;
            SetTitleMode(scene == "Title");
            SetFightMode(scene == "Fight");
        }

        void OnDestroy()
        {
            SceneManager.sceneLoaded -= OnScene;
            if (Instance == this) Instance = null;
        }

        void OnScene(Scene scene, LoadSceneMode mode)
        {
            bool title = scene.name == "Title";
            SetTitleMode(title);
            _fightMode = scene.name == "Fight";
            if (_nav != null) _nav.gameObject.SetActive(!title && !_fightMode);
            if (scene.name == "Map")
            {
                if (GameState.Instance != null) GameState.Instance.locationId = "map";
                MapDirector.Ensure();
            }
            else if (!title && scene.name != "Fight")
                RoomRuntime.Ensure();
            Refresh();
        }

        public static string LocFromScene(string scene)
        {
            switch (scene)
            {
                case "Bunkhouse": return "bunk";
                case "Gym": return "gym";
                case "Docks": return "docks";
                case "Alley": return "alley";
                case "Arena": return "arena";
                case "Diner": return "diner";
                case "Canteen": return "canteen";
                case "Market": return "market";
                case "Temple": return "temple";
                case "Crane": return "crane";
                case "Barge": return "barge";
                case "Map": return "map";
                case "Fight": return "fight";
                default: return "";
            }
        }

        public void SetTitleMode(bool on)
        {
            TitleMode = on;
            if (_hud != null) _hud.gameObject.SetActive(!on);
            if (_nav != null) _nav.gameObject.SetActive(!on);
            if (on) _panels?.HideAll();
        }

        public void SetFightMode(bool on)
        {
            _fightMode = on;
            if (_nav != null) _nav.gameObject.SetActive(!TitleMode && !on);
        }

        public void CloseOverlays() => _panels?.HideAll();

        public OverlayHub Panels => _panels;

        void BuildHud()
        {
            _hud = UiKit.Panel(_canvas.transform, "TopBar", new Vector2(0.18f, 0.905f), new Vector2(0.82f, 0.995f), Vector2.zero, Vector2.zero, UiKit.Wood);
            var inner = UiKit.Panel(_hud, "Inner", new Vector2(0.01f, 0.08f), new Vector2(0.99f, 0.92f), Vector2.zero, Vector2.zero, UiKit.WoodDark);

            var vitals = UiKit.Panel(inner, "Vitals", new Vector2(0.01f, 0.08f), new Vector2(0.22f, 0.92f), Vector2.zero, Vector2.zero, new Color(0, 0, 0, 0.2f));
            _hp = TinyBar(vitals, "H", 0.76f, UiKit.BarGreen);
            _hunger = TinyBar(vitals, "U", 0.52f, UiKit.BarGreen);
            _energy = TinyBar(vitals, "E", 0.28f, UiKit.BarGreen);
            _mood = TinyBar(vitals, "M", 0.04f, UiKit.BarGreen);
            Icon(vitals, "health", 0.76f);
            Icon(vitals, "hunger", 0.52f);
            Icon(vitals, "energy", 0.28f);
            Icon(vitals, "mood", 0.04f);

            _hex = UiKit.Label(inner, "Hex", "C  S  G", 14, UiKit.Cream, TextAnchor.MiddleCenter);
            var hx = _hex.rectTransform;
            hx.anchorMin = new Vector2(0.22f, 0.1f);
            hx.anchorMax = new Vector2(0.30f, 0.9f);
            hx.offsetMin = hx.offsetMax = Vector2.zero;

            StatBox(inner, "STR", UiKit.StrRed, 0.305f, out _str);
            StatBox(inner, "AGI", UiKit.AgiBlue, 0.395f, out _agi);
            StatBox(inner, "STA", UiKit.StaGreen, 0.485f, out _sta);

            var money = UiKit.Panel(inner, "Money", new Vector2(0.58f, 0.08f), new Vector2(0.78f, 0.92f), Vector2.zero, Vector2.zero, new Color(0.18f, 0.14f, 0.08f, 0.7f));
            _gold = UiKit.Label(money, "G", "0", 20, UiKit.Gold, TextAnchor.MiddleLeft);
            _gold.rectTransform.offsetMin = new Vector2(28, 20);
            _cash = UiKit.Label(money, "$", "$ 0", 20, UiKit.Money, TextAnchor.MiddleLeft);
            _cash.rectTransform.offsetMax = new Vector2(0, -18);
            var coin = new GameObject("Coin", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            var crt = coin.GetComponent<RectTransform>();
            crt.SetParent(money, false);
            crt.anchorMin = new Vector2(0.02f, 0.52f);
            crt.anchorMax = new Vector2(0.18f, 0.92f);
            crt.offsetMin = crt.offsetMax = Vector2.zero;
            coin.GetComponent<Image>().sprite = UiKit.Icon("coin");
            coin.GetComponent<Image>().color = Color.white;
            coin.GetComponent<Image>().raycastTarget = false;

            var day = UiKit.Panel(inner, "Day", new Vector2(0.80f, 0.08f), new Vector2(0.99f, 0.92f), Vector2.zero, Vector2.zero, new Color(0.35f, 0.40f, 0.42f, 0.95f));
            UiKit.Label(day, "L", "day", 12, Color.white, TextAnchor.UpperCenter, FontStyle.Normal);
            _day = UiKit.Label(day, "N", "1", 28, Color.white, TextAnchor.MiddleCenter);

            _nav = UiKit.Panel(_canvas.transform, "LeftNav", new Vector2(0.008f, 0.38f), new Vector2(0.055f, 0.88f), Vector2.zero, Vector2.zero, new Color(0.18f, 0.38f, 0.48f, 0.55f));
            NavBtn(_nav, "profile", 0.80f, () => _panels.Toggle(OverlayKind.Profile));
            NavBtn(_nav, "fight", 0.60f, () => _panels.Toggle(OverlayKind.FightCard));
            NavBtn(_nav, "map", 0.40f, GoMap);
            NavBtn(_nav, "skills", 0.20f, () => _panels.Toggle(OverlayKind.Skills));
            NavBtn(_nav, "journal", 0.00f, () => _panels.Toggle(OverlayKind.Journal));
        }

        static Image TinyBar(RectTransform parent, string n, float y, Color c)
        {
            return UiKit.Bar(parent, n, new Vector2(0.28f, y), new Vector2(0.96f, y + 0.20f), Vector2.zero, Vector2.zero, c);
        }

        static void Icon(RectTransform parent, string key, float y)
        {
            var go = new GameObject(key, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            var rt = go.GetComponent<RectTransform>();
            rt.SetParent(parent, false);
            rt.anchorMin = new Vector2(0.02f, y);
            rt.anchorMax = new Vector2(0.26f, y + 0.20f);
            rt.offsetMin = rt.offsetMax = Vector2.zero;
            var img = go.GetComponent<Image>();
            img.sprite = UiKit.Icon(key);
            img.color = Color.white;
            img.preserveAspect = true;
            img.raycastTarget = false;
        }

        static RectTransform StatBox(RectTransform parent, string label, Color col, float x, out Text num)
        {
            var box = UiKit.Panel(parent, label, new Vector2(x, 0.06f), new Vector2(x + 0.085f, 0.94f), Vector2.zero, Vector2.zero, col);
            num = UiKit.Label(box, "N", "0", 26, Color.white, TextAnchor.MiddleCenter);
            var cap = UiKit.Label(box, "C", label, 11, new Color(1, 1, 1, 0.85f), TextAnchor.UpperCenter, FontStyle.Bold);
            cap.rectTransform.anchorMin = new Vector2(0, 0.72f);
            cap.rectTransform.offsetMin = Vector2.zero;
            return box;
        }

        static void NavBtn(RectTransform parent, string icon, float y, UnityEngine.Events.UnityAction click)
        {
            var b = UiKit.MakeButton(parent, icon, new Vector2(0.08f, y), new Vector2(0.92f, y + 0.18f), Vector2.zero, Vector2.zero, UiKit.NavCyan, "", 1, Color.clear, click);
            var imgGo = new GameObject("I", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            var rt = imgGo.GetComponent<RectTransform>();
            rt.SetParent(b.transform, false);
            UiKit.StretchFill(rt);
            rt.offsetMin = new Vector2(8, 8);
            rt.offsetMax = new Vector2(-8, -8);
            var img = imgGo.GetComponent<Image>();
            img.sprite = UiKit.Icon(icon);
            img.color = new Color(0.12f, 0.22f, 0.32f);
            img.raycastTarget = false;
            img.preserveAspect = true;
        }

        void GoMap()
        {
            if (TitleMode) return;
            _panels.HideAll();
            if (SceneManager.GetActiveScene().name == "Map") return;
            if (GameClock.Instance != null) GameClock.Instance.AdvanceMinutes(8);
            if (GameState.Instance != null) GameState.Instance.locationId = "map";
            SceneManager.LoadScene("Map");
        }

        void Update()
        {
            if (TitleMode) return;
            Refresh();
        }

        public void Refresh()
        {
            var s = FighterStats.Instance;
            var c = GameClock.Instance;
            if (s == null || c == null) return;
            UiKit.SetFill(_hp, s.health / 100f);
            UiKit.SetFill(_hunger, 1f - s.hunger / 100f);
            UiKit.SetFill(_energy, s.energy / 100f);
            UiKit.SetFill(_mood, s.mood / 100f);
            _str.text = s.Str.ToString();
            _agi.text = s.Agi.ToString();
            _sta.text = s.Sta.ToString();
            _gold.text = s.skillPoints.ToString();
            _cash.text = "$ " + s.money;
            _day.text = c.day.ToString();
            if (_hex != null && SkillBook.Instance != null)
            {
                int cr = 0, sl = 0, ga = 0;
                foreach (var id in SkillBook.Instance.owned)
                {
                    var d = SkillCatalog.Get(id);
                    if (d == null) continue;
                    if (d.path == SkillPath.Crane) cr++;
                    if (d.path == SkillPath.Slip) sl++;
                    if (d.path == SkillPath.Galley) ga++;
                }
                _hex.text = $"C{cr}  S{sl}  G{ga}";
            }
            _panels?.Tick();
        }
    }
}
