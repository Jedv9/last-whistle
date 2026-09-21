using UnityEngine;

namespace LastWhistle.Core
{
    public class GameClock : MonoBehaviour
    {
        public static GameClock Instance { get; private set; }
        public int minutesPerDay = 24 * 60;
        public int day = 1;
        public int minuteOfDay = 8 * 60;

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

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void AdvanceMinutes(int minutes)
        {
            if (minutes <= 0) return;
            var stats = FighterStats.Instance;
            if (stats != null) stats.ApplyDecayForMinutes(minutes);
            minuteOfDay += minutes;
            while (minuteOfDay >= minutesPerDay)
            {
                minuteOfDay -= minutesPerDay;
                day++;
            }
        }

        public string Stamp() => $"Day {day}  {Hour:00}:{Minute:00}  ({Period})";
    }
}