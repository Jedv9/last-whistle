using UnityEngine;
using UnityEngine.UI;
using LastWhistle.Core;

namespace LastWhistle.UI
{
    public class HudClock : MonoBehaviour
    {
        public Text label;
        void Update()
        {
            if (label == null) return;
            var clock = GameClock.Instance;
            var stats = FighterStats.Instance;
            if (clock == null) return;
            string money = stats != null ? $"$ {stats.money}" : "";
            label.text = $"{clock.Stamp()}   {money}";
        }
    }
}
