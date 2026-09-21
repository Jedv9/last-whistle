using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using LastWhistle.Core;
using LastWhistle.Skills;

namespace LastWhistle.Combat
{
    /// <summary>Punch Club-style fight chrome: green HP, yellow energy, blue skill slots. Not OnGUI.</summary>
    public class FightView
    {
        public readonly GameObject root;
        readonly Image _pHp, _pEn, _eHp, _eEn;
        readonly Text _pHpT, _pEnT, _eHpT, _eEnT, _pName, _eName, _round, _log, _pStats, _ePerks, _hint;
        readonly List<Text> _pSlots = new List<Text>();
        readonly List<Text> _eSlots = new List<Text>();
        readonly List<Button> _pSlotBtns = new List<Button>();
        readonly Transform _invRow;
        readonly GameObject _between;
        readonly Button _bell, _salts, _map;
        string _selectedSkill;
        readonly FightController _host;

        public FightView(Transform canvas, FightController host)
        {
            _host = host;
            var rootRt = UiKit.Panel(canvas, "FightView", Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero, new Color(0, 0, 0, 0.12f));
            rootRt.GetComponent<Image>().raycastTarget = false;
            root = rootRt.gameObject;

            var top = UiKit.Panel(root.transform, "Fighters", new Vector2(0.08f, 0.70f), new Vector2(0.92f, 0.90f), Vector2.zero, Vector2.zero, new Color(0.08f, 0.08f, 0.1f, 0.72f));
            _pName = UiKit.Label(top, "PN", "VALE", 22, Color.white, TextAnchor.UpperLeft);
            _pName.rectTransform.anchorMin = new Vector2(0, 0.55f);
            _pName.rectTransform.offsetMin = new Vector2(12, 0);
            _eName = UiKit.Label(top, "EN", "OPP", 22, Color.white, TextAnchor.UpperRight);
            _eName.rectTransform.anchorMin = new Vector2(0, 0.55f);
            _eName.rectTransform.offsetMax = new Vector2(-12, 0);
            _pStats = UiKit.Label(top, "PS", "STR  AGI  STA", 14, UiKit.Cream, TextAnchor.UpperLeft, FontStyle.Normal);
            _pStats.rectTransform.anchorMin = new Vector2(0, 0.35f);
            _pStats.rectTransform.anchorMax = new Vector2(0.45f, 0.58f);
            _pStats.rectTransform.offsetMin = new Vector2(12, 0);

            _pHp = UiKit.Bar(top, "PHP", new Vector2(0.01f, 0.18f), new Vector2(0.46f, 0.34f), Vector2.zero, Vector2.zero, UiKit.HpGreen);
            _pEn = UiKit.Bar(top, "PEN", new Vector2(0.01f, 0.02f), new Vector2(0.46f, 0.16f), Vector2.zero, Vector2.zero, UiKit.EnYellow);
            _eHp = UiKit.Bar(top, "EHP", new Vector2(0.54f, 0.18f), new Vector2(0.99f, 0.34f), Vector2.zero, Vector2.zero, UiKit.HpGreen);
            _eEn = UiKit.Bar(top, "EEN", new Vector2(0.54f, 0.02f), new Vector2(0.99f, 0.16f), Vector2.zero, Vector2.zero, UiKit.EnYellow);
            _pHpT = UiKit.Label(_pHp.transform.parent, "PHT", "", 13, Color.white, TextAnchor.MiddleLeft);
            _pHpT.rectTransform.anchorMin = new Vector2(0.01f, 0.18f);
            _pHpT.rectTransform.anchorMax = new Vector2(0.46f, 0.34f);
            _pEnT = UiKit.Label(_pEn.transform.parent, "PET", "", 13, Color.black, TextAnchor.MiddleLeft);
            _pEnT.rectTransform.anchorMin = new Vector2(0.01f, 0.02f);
            _pEnT.rectTransform.anchorMax = new Vector2(0.46f, 0.16f);
            _eHpT = UiKit.Label(_eHp.transform.parent, "EHT", "", 13, Color.white, TextAnchor.MiddleRight);
            _eHpT.rectTransform.anchorMin = new Vector2(0.54f, 0.18f);
            _eHpT.rectTransform.anchorMax = new Vector2(0.99f, 0.34f);
            _eEnT = UiKit.Label(_eEn.transform.parent, "EET", "", 13, Color.black, TextAnchor.MiddleRight);
            _eEnT.rectTransform.anchorMin = new Vector2(0.54f, 0.02f);
            _eEnT.rectTransform.anchorMax = new Vector2(0.99f, 0.16f);

            _round = UiKit.Label(root.transform, "Round", "ROUND 1   0:20", 28, UiKit.Cream, TextAnchor.MiddleCenter);
            var rr = _round.rectTransform;
            rr.anchorMin = new Vector2(0.3f, 0.62f);
            rr.anchorMax = new Vector2(0.7f, 0.70f);
            rr.offsetMin = rr.offsetMax = Vector2.zero;

            _log = UiKit.Label(root.transform, "Log", "", 18, Color.white, TextAnchor.MiddleCenter, FontStyle.Normal);
            var lr = _log.rectTransform;
            lr.anchorMin = new Vector2(0.15f, 0.54f);
            lr.anchorMax = new Vector2(0.85f, 0.63f);
            lr.offsetMin = lr.offsetMax = Vector2.zero;
            _log.horizontalOverflow = HorizontalWrapMode.Wrap;
            _log.verticalOverflow = VerticalWrapMode.Overflow;

            var slotBar = UiKit.Panel(root.transform, "Slots", new Vector2(0.06f, 0.38f), new Vector2(0.94f, 0.52f), Vector2.zero, Vector2.zero, new Color(0.07f, 0.08f, 0.12f, 0.8f));
            UiKit.Label(slotBar, "PL", "YOUR BLUE SLOTS", 12, UiKit.NavCyan, TextAnchor.UpperLeft, FontStyle.Bold).rectTransform.offsetMin = new Vector2(8, 0);
            UiKit.Label(slotBar, "EL", "THEIR SLOTS + PERKS", 12, new Color(1f, 0.55f, 0.45f), TextAnchor.UpperRight, FontStyle.Bold).rectTransform.offsetMax = new Vector2(-8, 0);

            for (int i = 0; i < 6; i++)
            {
                int idx = i;
                float x0 = 0.01f + i * 0.08f;
                var b = UiKit.MakeButton(slotBar, "PS" + i, new Vector2(x0, 0.08f), new Vector2(x0 + 0.075f, 0.72f), Vector2.zero, Vector2.zero, UiKit.SlotBlue, "", 13, Color.white, () => OnSlot(idx));
                _pSlotBtns.Add(b);
                _pSlots.Add(b.GetComponentInChildren<Text>());
                float x1 = 0.52f + i * 0.08f;
                var e = UiKit.Panel(slotBar, "ES" + i, new Vector2(x1, 0.08f), new Vector2(x1 + 0.075f, 0.72f), Vector2.zero, Vector2.zero, new Color(0.35f, 0.22f, 0.22f));
                _eSlots.Add(UiKit.Label(e, "T", "", 12, Color.white, TextAnchor.MiddleCenter));
            }
            _ePerks = UiKit.Label(root.transform, "Perks", "", 14, new Color(1f, 0.7f, 0.4f), TextAnchor.MiddleRight, FontStyle.Normal);
            var pr = _ePerks.rectTransform;
            pr.anchorMin = new Vector2(0.5f, 0.33f);
            pr.anchorMax = new Vector2(0.94f, 0.38f);
            pr.offsetMin = pr.offsetMax = Vector2.zero;

            _between = UiKit.Panel(root.transform, "Between", new Vector2(0.06f, 0.07f), new Vector2(0.94f, 0.33f), Vector2.zero, Vector2.zero, new Color(0.08f, 0.10f, 0.16f, 0.94f)).gameObject;
            UiKit.Label(_between.transform, "H", "BETWEEN ROUNDS — click a skill, then a blue slot. Low energy is punished.", 16, UiKit.Cream, TextAnchor.UpperCenter);
            _invRow = UiKit.Panel(_between.transform, "Inv", new Vector2(0.01f, 0.18f), new Vector2(0.99f, 0.72f), Vector2.zero, Vector2.zero, new Color(0, 0, 0, 0.15f));
            _hint = UiKit.Label(_between.transform, "Hint", "", 14, Color.white, TextAnchor.LowerCenter, FontStyle.Normal);
            var hr = _hint.rectTransform;
            hr.anchorMin = new Vector2(0.02f, 0.02f);
            hr.anchorMax = new Vector2(0.55f, 0.18f);

            _bell = UiKit.MakeButton(_between.transform, "Bell", new Vector2(0.72f, 0.04f), new Vector2(0.98f, 0.22f), Vector2.zero, Vector2.zero, new Color(0.75f, 0.16f, 0.16f), "BELL", 22, Color.white, () => _host.OnBell());
            _salts = UiKit.MakeButton(_between.transform, "Salts", new Vector2(0.52f, 0.04f), new Vector2(0.70f, 0.22f), Vector2.zero, Vector2.zero, new Color(0.55f, 0.45f, 0.15f), "SALTS", 16, Color.white, () => _host.OnSalts());
            _map = UiKit.MakeButton(root.transform, "Map", new Vector2(0.80f, 0.91f), new Vector2(0.96f, 0.98f), Vector2.zero, Vector2.zero, UiKit.WoodDark, "LEAVE", 16, UiKit.Cream, () => _host.OnLeave());
            _map.gameObject.SetActive(false);
        }

        void OnSlot(int idx)
        {
            if (string.IsNullOrEmpty(_selectedSkill)) return;
            var book = SkillBook.Instance;
            if (book == null) return;
            book.SetSlot(idx, _selectedSkill);
            _selectedSkill = null;
            _host.RefreshLoadout();
        }

        public void Destroy()
        {
            if (root != null) Object.Destroy(root);
        }

        public void Bind(FightSession f)
        {
            if (f == null) return;
            _pName.text = f.player.name.ToUpper();
            _eName.text = f.enemy.name.ToUpper();
            _pStats.text = $"STR {f.player.str}   AGI {f.player.agi}   STA {f.player.stm}";
            _ePerks.text = f.enemy.perks != null && f.enemy.perks.Length > 0 ? "Perks: " + string.Join(" · ", f.enemy.perks) : "Perks: none visible";
            Paint(f);
        }

        public void Paint(FightSession f)
        {
            if (f == null) return;
            UiKit.SetFill(_pHp, f.player.maxHp <= 0 ? 0 : (float)f.player.hp / f.player.maxHp);
            UiKit.SetFill(_pEn, f.player.energy / 100f);
            UiKit.SetFill(_eHp, f.enemy.maxHp <= 0 ? 0 : (float)f.enemy.hp / f.enemy.maxHp);
            UiKit.SetFill(_eEn, f.enemy.energy / 100f);
            _pHpT.text = "  HP  " + f.player.hp;
            _pEnT.text = "  EN  " + Mathf.RoundToInt(f.player.energy);
            _eHpT.text = f.enemy.hp + "  HP  ";
            _eEnT.text = Mathf.RoundToInt(f.enemy.energy) + "  EN  ";
            int sec = Mathf.Max(0, Mathf.CeilToInt(f.timeLeft));
            _round.text = f.over ? (f.playerWon ? "WIN" : "LOSS") : $"ROUND {f.round}/{f.maxRounds}    0:{sec:00}";
            _log.text = f.log;
            _between.SetActive(f.waiting && !f.over);
            _map.gameObject.SetActive(f.over);
            PaintSlots(f);
            if (f.waiting && !f.over) PaintInventory();
        }

        void PaintSlots(FightSession f)
        {
            var book = SkillBook.Instance;
            int n = book != null ? book.slotCount : 3;
            for (int i = 0; i < _pSlots.Count; i++)
            {
                bool on = i < n;
                _pSlotBtns[i].gameObject.SetActive(on);
                if (!on) continue;
                string id = (book != null && i < book.equipped.Count) ? book.equipped[i] : "";
                var d = SkillCatalog.Get(id);
                _pSlots[i].text = d != null ? d.name : "—";
            }
            for (int i = 0; i < _eSlots.Count; i++)
            {
                bool on = i < f.enemy.skills.Count;
                _eSlots[i].transform.parent.gameObject.SetActive(on);
                if (on) _eSlots[i].text = f.enemy.skills[i].name;
            }
        }

        void PaintInventory()
        {
            for (int i = _invRow.childCount - 1; i >= 0; i--) Object.Destroy(_invRow.GetChild(i).gameObject);
            var book = SkillBook.Instance;
            if (book == null) return;
            var equipable = new List<SkillDef>();
            foreach (var id in book.owned)
            {
                var d = SkillCatalog.Get(id);
                if (d != null && d.IsEquipable) equipable.Add(d);
            }
            int count = Mathf.Max(1, equipable.Count);
            for (int i = 0; i < equipable.Count; i++)
            {
                var d = equipable[i];
                float x0 = (float)i / count;
                float x1 = (float)(i + 1) / count;
                var col = d.kind == SkillKind.Attack ? UiKit.StrRed : d.kind == SkillKind.Defense ? UiKit.AgiBlue : UiKit.StaGreen;
                if (d.id == _selectedSkill) col = Color.Lerp(col, Color.white, 0.35f);
                string id = d.id;
                UiKit.MakeButton(_invRow, d.id, new Vector2(x0 + 0.004f, 0.08f), new Vector2(x1 - 0.004f, 0.92f), Vector2.zero, Vector2.zero, col, d.name + "\n" + Mathf.RoundToInt(d.energyBase) + "en", 13, Color.white, () =>
                {
                    _selectedSkill = id;
                    _hint.text = d.name + " — " + d.blurb + "  (click a blue slot)";
                    PaintInventory();
                });
            }
            var gs = GameState.Instance;
            _salts.gameObject.SetActive(gs != null && gs.salts > 0);
        }
    }
}
