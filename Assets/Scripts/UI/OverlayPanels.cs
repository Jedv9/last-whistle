using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using LastWhistle.Core;
using LastWhistle.Skills;
using LastWhistle.Combat;
using LastWhistle.World;

namespace LastWhistle.UI
{
    public enum OverlayKind { None, Profile, Skills, Journal, FightCard, Shop, Dialogue }

    public class OverlayHub
    {
        readonly RectTransform _root;
        readonly GameShell _shell;
        GameObject _dim;
        OverlayKind _open;
        GameObject _profile, _skills, _journal, _card, _shop, _dialogue;
        Text _dialogueWho, _dialogueBody, _journalBody, _profileBody, _skillHint;
        readonly List<Button> _choiceBtns = new List<Button>();
        Transform _skillGrid;
        Transform _cardList;
        string _queueWho, _queueText;
        System.Action _onCloseDialogue;
        string[] _choiceA, _choiceB;
        System.Action _pickA, _pickB;

        public OverlayHub(RectTransform root, GameShell shell)
        {
            _root = root;
            _shell = shell;
            _dim = UiKit.Stretch(root, "Dim", UiKit.Dim).gameObject;
            _dim.SetActive(false);
            var dimBtn = _dim.AddComponent<Button>();
            dimBtn.onClick.AddListener(HideAll);
        }

        public void HideAll()
        {
            _open = OverlayKind.None;
            if (_dim != null) _dim.SetActive(false);
            if (_profile) _profile.SetActive(false);
            if (_skills) _skills.SetActive(false);
            if (_journal) _journal.SetActive(false);
            if (_card) _card.SetActive(false);
            if (_shop) _shop.SetActive(false);
            if (_dialogue && string.IsNullOrEmpty(_queueText)) _dialogue.SetActive(false);
        }

        public void Toggle(OverlayKind k)
        {
            if (_open == k) { HideAll(); return; }
            HideAll();
            _open = k;
            _dim.SetActive(true);
            switch (k)
            {
                case OverlayKind.Profile: ShowProfile(); break;
                case OverlayKind.Skills: ShowSkills(); break;
                case OverlayKind.Journal: ShowJournal(); break;
                case OverlayKind.FightCard: ShowCard(); break;
                case OverlayKind.Shop: ShowShop(); break;
            }
        }

        public void Tick()
        {
            if (_open == OverlayKind.Profile && _profile && _profile.activeSelf) FillProfile();
        }

        public void Talk(string who, string text, string aLabel = null, System.Action a = null, string bLabel = null, System.Action b = null)
        {
            EnsureDialogue();
            _dialogue.SetActive(true);
            _dim.SetActive(true);
            _open = OverlayKind.Dialogue;
            _dialogueWho.text = who ?? "";
            _dialogueBody.text = text ?? "";
            _queueText = text;
            _choiceA = aLabel != null ? new[] { aLabel } : null;
            _pickA = a;
            _choiceB = bLabel != null ? new[] { bLabel } : null;
            _pickB = b;
            bool choices = !string.IsNullOrEmpty(aLabel);
            var ok = _dialogue.transform.Find("OK");
            if (ok != null) ok.gameObject.SetActive(!choices);
            _choiceBtns[0].gameObject.SetActive(choices);
            _choiceBtns[1].gameObject.SetActive(!string.IsNullOrEmpty(bLabel));
            if (!string.IsNullOrEmpty(aLabel)) _choiceBtns[0].GetComponentInChildren<Text>().text = aLabel;
            if (!string.IsNullOrEmpty(bLabel)) _choiceBtns[1].GetComponentInChildren<Text>().text = bLabel;
        }

        public void CloseTalk()
        {
            _queueText = null;
            if (_dialogue) _dialogue.SetActive(false);
            if (_open == OverlayKind.Dialogue) HideAll();
        }

        void EnsureDialogue()
        {
            if (_dialogue != null) return;
            _dialogue = Box("Dialogue", 0.18f, 0.08f, 0.82f, 0.36f);
            _dialogueWho = UiKit.Label(_dialogue.transform, "Who", "", 16, UiKit.Gold, TextAnchor.UpperLeft);
            _dialogueWho.rectTransform.anchorMin = new Vector2(0.03f, 0.72f);
            _dialogueWho.rectTransform.anchorMax = new Vector2(0.97f, 0.95f);
            _dialogueBody = UiKit.Label(_dialogue.transform, "Body", "", 18, Color.white, TextAnchor.UpperLeft, FontStyle.Normal);
            _dialogueBody.rectTransform.anchorMin = new Vector2(0.03f, 0.28f);
            _dialogueBody.rectTransform.anchorMax = new Vector2(0.97f, 0.72f);
            _dialogueBody.horizontalOverflow = HorizontalWrapMode.Wrap;
            _dialogueBody.verticalOverflow = VerticalWrapMode.Overflow;
            var ok = UiKit.MakeButton(_dialogue.transform, "OK", new Vector2(0.78f, 0.06f), new Vector2(0.96f, 0.24f), Vector2.zero, Vector2.zero, UiKit.SlotBlue, "OK", 16, Color.white, () =>
            {
                var cb = _pickA;
                _pickA = null;
                CloseTalk();
                cb?.Invoke();
            });
            var c0 = UiKit.MakeButton(_dialogue.transform, "A", new Vector2(0.04f, 0.06f), new Vector2(0.40f, 0.24f), Vector2.zero, Vector2.zero, UiKit.StaGreen, "A", 14, Color.white, () =>
            {
                var cb = _pickA; CloseTalk(); cb?.Invoke();
            });
            var c1 = UiKit.MakeButton(_dialogue.transform, "B", new Vector2(0.42f, 0.06f), new Vector2(0.76f, 0.24f), Vector2.zero, Vector2.zero, UiKit.AgiBlue, "B", 14, Color.white, () =>
            {
                var cb = _pickB; CloseTalk(); cb?.Invoke();
            });
            _choiceBtns.Add(c0);
            _choiceBtns.Add(c1);
            c0.gameObject.SetActive(false);
            c1.gameObject.SetActive(false);
        }

        GameObject Box(string name, float x0, float y0, float x1, float y1)
        {
            var rt = UiKit.Panel(_root, name, new Vector2(x0, y0), new Vector2(x1, y1), Vector2.zero, Vector2.zero, UiKit.Panel);
            UiKit.Panel(rt, "Edge", new Vector2(0.008f, 0.02f), new Vector2(0.992f, 0.98f), Vector2.zero, Vector2.zero, UiKit.Panel2);
            return rt.gameObject;
        }

        void ShowProfile()
        {
            if (_profile == null)
            {
                _profile = Box("Profile", 0.14f, 0.18f, 0.86f, 0.82f);
                UiKit.Label(_profile.transform, "T", "FIGHTER", 22, UiKit.Cream, TextAnchor.UpperCenter);
                _profileBody = UiKit.Label(_profile.transform, "B", "", 18, Color.white, TextAnchor.UpperLeft, FontStyle.Normal);
                _profileBody.rectTransform.anchorMin = new Vector2(0.06f, 0.08f);
                _profileBody.rectTransform.anchorMax = new Vector2(0.94f, 0.86f);
                _profileBody.horizontalOverflow = HorizontalWrapMode.Wrap;
                _profileBody.verticalOverflow = VerticalWrapMode.Overflow;
            }
            _profile.SetActive(true);
            FillProfile();
        }

        void FillProfile()
        {
            var s = FighterStats.Instance;
            var c = GameClock.Instance;
            var g = GameState.Instance;
            if (s == null || _profileBody == null) return;
            _profileBody.text =
                $"{s.fighterName}  —  {s.archetype}\n" +
                $"{(g != null ? g.ChapterName() : "")}\n\n" +
                $"STR {s.Str}    AGI {s.Agi}    STA {s.Sta}\n" +
                $"Health {s.health:0}    Hunger {s.hunger:0}    Energy {s.energy:0}    Mood {s.mood:0}\n" +
                $"Fight HP {s.FightHp}    Regen {s.EnergyRegen:0.0}    Armor {s.Armor:0.0}\n\n" +
                $"$ {s.money}    Skill points {s.skillPoints}    Fame {(g != null ? g.fame : 0)}\n" +
                $"Record {(g != null ? g.wins : 0)}–{(g != null ? g.losses : 0)}\n" +
                $"Hands: {(g != null && !string.IsNullOrEmpty(g.handsItem) ? g.handsItem : "tape")}\n" +
                $"Feet: {(g != null && !string.IsNullOrEmpty(g.feetItem) ? g.feetItem : "work boots")}\n" +
                $"Salts {(g != null ? g.salts : 0)}   Salve {(g != null ? g.salve : 0)}\n\n" +
                (c != null ? c.StampLong() : "") +
                (g != null ? $"\nRent due day {g.rentDueDay}  (${g.rentAmount})" : "");
        }

        void ShowJournal()
        {
            if (_journal == null)
            {
                _journal = Box("Journal", 0.16f, 0.14f, 0.84f, 0.84f);
                UiKit.Label(_journal.transform, "T", "JOURNAL", 22, UiKit.Cream, TextAnchor.UpperCenter);
                _journalBody = UiKit.Label(_journal.transform, "B", "", 16, Color.white, TextAnchor.UpperLeft, FontStyle.Normal);
                _journalBody.rectTransform.anchorMin = new Vector2(0.05f, 0.06f);
                _journalBody.rectTransform.anchorMax = new Vector2(0.95f, 0.88f);
                _journalBody.horizontalOverflow = HorizontalWrapMode.Wrap;
                _journalBody.verticalOverflow = VerticalWrapMode.Overflow;
            }
            _journal.SetActive(true);
            var g = GameState.Instance;
            if (g == null || g.JournalEntries.Count == 0)
                _journalBody.text = "Bunkhouse 4C. Juno has been missing for six days. The tape dies on the word ledger.";
            else
                _journalBody.text = string.Join("\n\n", g.JournalEntries);
        }

        void ShowSkills()
        {
            if (_skills == null)
            {
                _skills = Box("Skills", 0.10f, 0.10f, 0.90f, 0.86f);
                UiKit.Label(_skills.transform, "T", "SKILL TREE  —  Crane / Slip / Galley", 20, UiKit.Cream, TextAnchor.UpperCenter);
                _skillHint = UiKit.Label(_skills.transform, "H", "", 15, Color.white, TextAnchor.LowerCenter, FontStyle.Normal);
                _skillHint.rectTransform.anchorMin = new Vector2(0.04f, 0.02f);
                _skillHint.rectTransform.anchorMax = new Vector2(0.96f, 0.10f);
                _skillHint.horizontalOverflow = HorizontalWrapMode.Wrap;
                _skillGrid = UiKit.Panel(_skills.transform, "Grid", new Vector2(0.02f, 0.12f), new Vector2(0.98f, 0.88f), Vector2.zero, Vector2.zero, new Color(0, 0, 0, 0.15f));
            }
            _skills.SetActive(true);
            PaintTree();
        }

        void PaintTree()
        {
            for (int i = _skillGrid.childCount - 1; i >= 0; i--) Object.Destroy(_skillGrid.GetChild(i).gameObject);
            var book = SkillBook.Instance;
            var stats = FighterStats.Instance;
            UiKit.Label(_skillGrid, "cols", "BASIC                  CRANE (power)           SLIP (speed)            GALLEY (gas)", 14, UiKit.NavCyan, TextAnchor.UpperLeft);
            float[] colX = { 0.01f, 0.26f, 0.50f, 0.74f };
            SkillPath[] paths = { SkillPath.Basic, SkillPath.Crane, SkillPath.Slip, SkillPath.Galley };
            for (int p = 0; p < 4; p++)
            {
                var path = paths[p];
                var list = new List<SkillDef>();
                foreach (var d in SkillCatalog.All) if (d.path == path) list.Add(d);
                list.Sort((a, b) => a.row != b.row ? a.row.CompareTo(b.row) : a.col.CompareTo(b.col));
                for (int i = 0; i < list.Count; i++)
                {
                    var d = list[i];
                    bool own = book != null && book.Owns(d.id);
                    bool can = book != null && book.CanUnlock(d);
                    Color bg = own ? UiKit.StaGreen : can ? UiKit.SlotBlue : new Color(0.25f, 0.25f, 0.28f);
                    float y1 = 0.84f - i * 0.13f;
                    float y0 = y1 - 0.12f;
                    string id = d.id;
                    var btn = UiKit.MakeButton(_skillGrid, d.id, new Vector2(colX[p], y0), new Vector2(colX[p] + 0.23f, y1), Vector2.zero, Vector2.zero, bg, d.name, 14, Color.white, () =>
                    {
                        _skillHint.text = d.name + " — " + d.blurb + (own ? "  (owned)" : can ? "  Click to unlock for " + book.NextCost + " SP." : "  Locked.");
                        if (can && book.Unlock(id))
                        {
                            PaintTree();
                            DialogueBanner.Show("Unlocked " + d.name + ".");
                        }
                    });
                }
            }
            if (stats != null && book != null)
                _skillHint.text = $"Skill points {stats.skillPoints}   Next unlock {book.NextCost} SP   Slots {book.slotCount}";
        }

        void ShowCard()
        {
            if (_card == null)
            {
                _card = Box("Card", 0.14f, 0.12f, 0.86f, 0.84f);
                UiKit.Label(_card.transform, "T", "FIGHT CARD", 22, UiKit.Cream, TextAnchor.UpperCenter);
                _cardList = UiKit.Panel(_card.transform, "List", new Vector2(0.04f, 0.08f), new Vector2(0.96f, 0.86f), Vector2.zero, Vector2.zero, new Color(0, 0, 0, 0.2f));
            }
            _card.SetActive(true);
            for (int i = _cardList.childCount - 1; i >= 0; i--) Object.Destroy(_cardList.GetChild(i).gameObject);
            var gs = GameState.Instance;
            var s = FighterStats.Instance;
            string loc = gs != null ? gs.locationId : "alley";
            var rows = new List<OpponentDef>();
            foreach (var o in OpponentCatalog.All)
            {
                if (!Available(o, gs, loc)) continue;
                rows.Add(o);
            }
            if (rows.Count == 0)
            {
                UiKit.Label(_cardList, "empty", "No bouts here. Travel to Bin Alley, the gym, Blue Crane, or the Arena.", 16, Color.white, TextAnchor.MiddleCenter, FontStyle.Normal);
                return;
            }
            for (int i = 0; i < rows.Count; i++)
            {
                var o = rows[i];
                float y1 = 1f - i * 0.16f;
                float y0 = y1 - 0.15f;
                string id = o.id;
                string locId = o.loc;
                UiKit.MakeButton(_cardList, o.id, new Vector2(0.02f, y0), new Vector2(0.98f, y1), Vector2.zero, Vector2.zero, new Color(0.18f, 0.22f, 0.32f),
                    $"{o.name}   {o.rank}   {o.rounds} rds   purse ${o.purse}\n{o.blurb}", 15, Color.white, () =>
                    {
                        if (s != null && o.fee > 0 && !s.SpendMoney(o.fee))
                        {
                            DialogueBanner.Show("Gate fee is $" + o.fee + ".");
                            return;
                        }
                        gs.pendingOpponent = id;
                        gs.pendingVenue = locId;
                        HideAll();
                        SceneManager.LoadScene("Fight");
                    });
            }
        }

        static bool Available(OpponentDef o, GameState gs, string loc)
        {
            if (gs == null) return o.id == "tommy";
            bool atVenue = loc == "alley" || loc == "gym" || loc == "crane" || loc == "arena";
            if (atVenue && o.loc != loc) return false;
            if (o.loc == "alley" && !gs.Flag("flyer") && !gs.Flag("intro")) return false;
            if (gs.fame < o.fameNeed) return false;
            if (gs.wins < o.winNeed) return false;
            if (!string.IsNullOrEmpty(o.needFlag) && !gs.Flag(o.needFlag)) return false;
            if (!string.IsNullOrEmpty(o.gym) && o.gym == "rust" && !gs.rustMember) return false;
            if (gs.Flag("beat_" + o.id) && !o.rematch && !o.story) return false;
            return true;
        }

        public void ShowShop()
        {
            HideAll();
            _open = OverlayKind.Shop;
            _dim.SetActive(true);
            if (_shop == null)
            {
                _shop = Box("Shop", 0.16f, 0.12f, 0.84f, 0.84f);
                UiKit.Label(_shop.transform, "T", "NIGHT MARKET", 22, UiKit.Cream, TextAnchor.UpperCenter);
            }
            _shop.SetActive(true);
            var list = _shop.transform.Find("List");
            if (list != null) Object.Destroy(list.gameObject);
            var row = UiKit.Panel(_shop.transform, "List", new Vector2(0.05f, 0.08f), new Vector2(0.95f, 0.86f), Vector2.zero, Vector2.zero, new Color(0, 0, 0, 0.15f));
            string[] items = { "wraps|Hand wraps|$12|hands", "scuffed|Scuffed gloves|$35|hands", "harbor|Harbor gloves|$90|hands", "decks|Deck shoes|$40|feet", "boots|Ring boots|$85|feet", "salve|Dock salve|$8|salve", "salts|Smelling salts|$15|salts" };
            for (int i = 0; i < items.Length; i++)
            {
                var p = items[i].Split('|');
                float y1 = 1f - i * 0.12f;
                float y0 = y1 - 0.11f;
                string id = p[0];
                int price = int.Parse(p[2].Replace("$", ""));
                string slot = p[3];
                UiKit.MakeButton(row, id, new Vector2(0.02f, y0), new Vector2(0.98f, y1), Vector2.zero, Vector2.zero, new Color(0.2f, 0.18f, 0.12f),
                    p[1] + "  " + p[2], 16, Color.white, () => Buy(id, price, slot, p[1]));
            }
        }

        static void Buy(string id, int price, string slot, string name)
        {
            var s = FighterStats.Instance;
            var g = GameState.Instance;
            if (s == null || g == null) return;
            if (!s.SpendMoney(price)) { DialogueBanner.Show("Not enough cash."); return; }
            if (slot == "hands") g.handsItem = id;
            else if (slot == "feet") g.feetItem = id;
            else if (slot == "salve") g.salve++;
            else if (slot == "salts") g.salts++;
            DialogueBanner.Show("Bought " + name + ".");
        }
    }
}
