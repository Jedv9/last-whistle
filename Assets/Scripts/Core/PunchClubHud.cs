using UnityEngine;
using LastWhistle.Core;

namespace LastWhistle.UI
{
    /// <summary>Top bar closer to Punch Club: 4 vitals + STR/AGI/STA + money + day.</summary>
    public class PunchClubHud : MonoBehaviour
    {
        Texture2D _px;
        void Awake()
        {
            _px = new Texture2D(1, 1);
            _px.SetPixel(0, 0, Color.white);
            _px.Apply();
        }

        void OnGUI()
        {
            var s = FighterStats.Instance;
            var c = GameClock.Instance;
            if (s == null || c == null) return;

            float w = Screen.width;
            GUI.color = new Color(0.05f, 0.05f, 0.06f, 0.92f);
            GUI.DrawTexture(new Rect(0, 0, w, 64), _px);
            GUI.color = Color.white;

            DrawBar(12, 10, 110, 12, new Color(0.85f, 0.2f, 0.25f), s.health / 100f);
            DrawBar(12, 26, 110, 12, new Color(0.95f, 0.7f, 0.2f), 1f - s.hunger / 100f);
            DrawBar(12, 42, 110, 12, new Color(0.3f, 0.75f, 0.95f), s.energy / 100f);

            GUI.Box(new Rect(140, 8, 54, 48), $"STR\n{s.strength}");
            GUI.Box(new Rect(200, 8, 54, 48), $"AGI\n{s.agility}");
            GUI.Box(new Rect(260, 8, 54, 48), $"STA\n{s.stamina}");
            GUI.Box(new Rect(330, 8, 90, 48), $"$ {s.money}\nSP {s.skillPoints}");
            GUI.Box(new Rect(w - 210, 8, 198, 48), $"{c.Stamp()}\n{s.archetype}");
        }

        void DrawBar(float x, float y, float w, float h, Color col, float fill)
        {
            GUI.color = new Color(0.15f, 0.15f, 0.15f);
            GUI.DrawTexture(new Rect(x, y, w, h), _px);
            GUI.color = col;
            GUI.DrawTexture(new Rect(x, y, w * Mathf.Clamp01(fill), h), _px);
            GUI.color = Color.white;
        }
    }
}