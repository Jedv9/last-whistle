using System.Collections.Generic;
using UnityEngine;

namespace LastWhistle.Core
{
    public class GameState : MonoBehaviour
    {
        public static GameState Instance { get; private set; }

        public string locationId = "bunk";
        public int fame;
        public int wins;
        public int losses;
        public int rentDueDay = 8;
        public int rentAmount = 35;
        public bool rustMember;
        public bool templeMember;
        public int rustPaidThroughDay;
        public int templePaidThroughDay;
        public string handsItem = "";
        public string feetItem = "";
        public int salts;
        public int salve;
        public int tape;
        public int chapter;
        public string pendingOpponent;
        public string pendingVenue;

        readonly Dictionary<string, bool> _flags = new Dictionary<string, bool>();
        readonly List<string> _journal = new List<string>();
        readonly Dictionary<string, int> _trainedToday = new Dictionary<string, int>();
        int _trainDay = -1;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void ResetAll()
        {
            locationId = "bunk";
            fame = 0;
            wins = 0;
            losses = 0;
            rentDueDay = 8;
            rustMember = false;
            templeMember = false;
            rustPaidThroughDay = 0;
            templePaidThroughDay = 0;
            handsItem = "";
            feetItem = "";
            salts = 0;
            salve = 0;
            tape = 0;
            chapter = 0;
            pendingOpponent = null;
            pendingVenue = null;
            _flags.Clear();
            _journal.Clear();
            _trainedToday.Clear();
            _trainDay = -1;
        }

        public bool Flag(string id) => !string.IsNullOrEmpty(id) && _flags.TryGetValue(id, out var v) && v;

        public void SetFlag(string id, bool v = true)
        {
            if (string.IsNullOrEmpty(id)) return;
            _flags[id] = v;
        }

        public void Journal(string line)
        {
            if (string.IsNullOrEmpty(line)) return;
            if (_journal.Contains(line)) return;
            _journal.Add(line);
        }

        public IReadOnlyList<string> JournalEntries => _journal;

        public int TrainedToday(string key)
        {
            SyncTrainDay();
            return _trainedToday.TryGetValue(key, out var n) ? n : 0;
        }

        public void CountTrain(string key)
        {
            SyncTrainDay();
            _trainedToday.TryGetValue(key, out var n);
            _trainedToday[key] = n + 1;
        }

        void SyncTrainDay()
        {
            var day = GameClock.Instance != null ? GameClock.Instance.day : 1;
            if (_trainDay != day)
            {
                _trainDay = day;
                _trainedToday.Clear();
            }
        }

        public bool GymOk(string gym)
        {
            var day = GameClock.Instance != null ? GameClock.Instance.day : 1;
            if (gym == "temple") return templeMember && templePaidThroughDay >= day;
            if (gym == "rust") return rustMember && rustPaidThroughDay >= day;
            return true;
        }

        public int ItemBonus(string stat)
        {
            int n = 0;
            n += BonusOf(handsItem, stat);
            n += BonusOf(feetItem, stat);
            return n;
        }

        static int BonusOf(string item, string stat)
        {
            switch (item)
            {
                case "wraps": return stat == "tec" ? 1 : 0;
                case "scuffed": return stat == "str" || stat == "tec" ? 1 : 0;
                case "harbor": return stat == "str" ? 2 : stat == "tec" ? 1 : 0;
                case "decks": return stat == "agi" ? 2 : 0;
                case "boots": return stat == "agi" ? 2 : stat == "stm" ? 1 : 0;
                default: return 0;
            }
        }

        public string ChapterName()
        {
            if (Flag("croweUnlocked") || Flag("croweInvite")) return "12  THE WHISTLE";
            if (Flag("raidReady") || Flag("planMae")) return "11  LAUNCH";
            if (Flag("vargasOffer") || Flag("vargasUnlocked")) return "10  EXHIBITION";
            if (Flag("radio")) return "9  SHORTWAVE";
            if (Flag("craneOpen") || Flag("beat_lila") || Flag("lilaTalk")) return "8  BLUE CRANE";
            if (Flag("hornEcho") || Flag("quayNight")) return "7  FOG NOTE";
            if (Flag("ozMet")) return "6  WAFFLE";
            if (Flag("maeMet")) return "5  UNION";
            if (Flag("openedLocker") || Flag("heardLocker")) return "4  BAY C";
            if (Flag("kadeMet") || rustMember) return "3  RUST";
            if (Flag("flyer")) return "2  ALLEY CARD";
            return "1  CLOCK IN";
        }
    }
}
