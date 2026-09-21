using UnityEngine;
using UnityEngine.UI;

namespace LastWhistle.UI
{
    public class HudClock : MonoBehaviour
    {
        public Text label;
        void Update()
        {
            var clock = LastWhistle.Core.GameClock.Instance;
            var stats = LastWhistle.Core.FighterStats.Instance;
            if (label == null || clock == null) return;
            string money = stats != null ? $"$ {stats.money}" : "";
            label.text = $"{clock.Stamp()}   {money}";
        }
    }
}
