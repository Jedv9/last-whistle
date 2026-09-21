using UnityEngine;
using UnityEngine.SceneManagement;
using LastWhistle.Core;

namespace LastWhistle.UI
{
    public class TitleController : MonoBehaviour
    {
        void OnGUI()
        {
            var style = new GUIStyle(GUI.skin.label) { fontSize = 42, alignment = TextAnchor.MiddleCenter };
            GUI.Label(new Rect(0, 80, Screen.width, 60), "LAST WHISTLE", style);
            GUI.Label(new Rect(0, 140, Screen.width, 30), "Blackwater Docks — Punch Club systems, Whistle story",
                new GUIStyle(GUI.skin.label) { alignment = TextAnchor.MiddleCenter });
            if (GUI.Button(new Rect(Screen.width / 2 - 120, 220, 240, 48), "New Game"))
            {
                if (GameClock.Instance == null)
                    new GameObject("GameClock").AddComponent<GameClock>();
                if (FighterStats.Instance == null)
                    new GameObject("FighterStats").AddComponent<FighterStats>();
                SceneManager.LoadScene("Map");
            }
        }
    }
}