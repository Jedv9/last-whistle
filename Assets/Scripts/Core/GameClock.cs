using UnityEngine;

namespace LastWhistle.Core
{
    public class GameClock : MonoBehaviour
    {
        public static GameClock Instance { get; private set; }
        public int minutesPerDay = 24 * 60;
        public int day = 1;
        public int minuteOfDay = 7 * 60 + 40;

        public int Hour => (minuteOfDay / 60) % 24;
        public int Minute => minuteOfDay % 60;
        public string Period
        {
            get
            {
                if (Hour < 12) return "Morning";
                if (Hour < 17) return "Afternoon";
                if (Hour < 21) return "Evening";
                return "Night";
            }
        }

        public bool IsNight => Hour >= 21 || Hour < 5;
        public bool IsEvening => Hour >= 17;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void ResetAll()
        {
            day = 1;
            minuteOfDay = 7 * 60 + 40;
        }

        public void AdvanceMinutes(int minutes)
        {
            if (minutes <= 0) return;
            var stats = FighterStats.Instance;
            if (stats != null) stats.ApplyDecayForMinutes(minutes);
            int before = day;
            minuteOfDay += minutes;
            while (minuteOfDay >= minutesPerDay)
            {
                minuteOfDay -= minutesPerDay;
                day++;
            }
            if (day != before) OnNewDays(before, day);
        }

        void OnNewDays(int from, int to)
        {
            var s = FighterStats.Instance;
            var g = GameState.Instance;
            if (s == null || g == null) return;
            for (int d = from + 1; d <= to; d++)
            {
                if (d >= g.rentDueDay)
                {
                    if (s.money >= g.rentAmount)
                    {
                        s.money -= g.rentAmount;
                        g.rentDueDay += 7;
                        g.Journal("Rent taken. Bunkhouse 4C is yours for another week.");
                        UI.DialogueBanner.Show("Rent's due. $" + g.rentAmount + " leaves the envelope.");
                    }
                    else
                    {
                        s.mood = Mathf.Clamp(s.mood - 18f, 0f, 100f);
                        g.Journal("Rent missed. Brant left a note on the cot. The bunk is not forever.");
                        UI.DialogueBanner.Show("Rent missed. Brant's note is not poetry.");
                        g.rentDueDay += 7;
                    }
                }
            }
        }

        public string Stamp() => $"Day {day}  {Hour:00}:{Minute:00}";
        public string StampLong() => $"Day {day}  {Hour:00}:{Minute:00}  ({Period})";
    }
}
