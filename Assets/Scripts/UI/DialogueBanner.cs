using UnityEngine;
using LastWhistle.Core;

namespace LastWhistle.UI
{
    public class DialogueBanner : MonoBehaviour
    {
        static string _line;
        static float _until;
        static string _who;

        public static void Show(string line, float seconds = 3.2f)
        {
            ShowAs(null, line, seconds);
        }

        public static void ShowAs(string who, string line, float seconds = 3.2f)
        {
            _who = who;
            _line = line;
            _until = Time.unscaledTime + seconds;
            if (GameShell.Instance != null && GameShell.Instance.Panels != null && !string.IsNullOrEmpty(line) && seconds >= 4.4f)
                GameShell.Instance.Panels.Talk(who ?? "", line);
        }

        public static void Talk(string who, string text, string a = null, System.Action onA = null, string b = null, System.Action onB = null)
        {
            if (GameShell.Instance != null && GameShell.Instance.Panels != null)
                GameShell.Instance.Panels.Talk(who, text, a, onA, b, onB);
            else
                ShowAs(who, text, 5f);
        }

        void OnGUI()
        {
            if (GameShell.Instance != null) return;
            if (string.IsNullOrEmpty(_line) || Time.unscaledTime > _until) return;
            GUI.Box(new Rect(20, Screen.height - 90, Screen.width - 40, 70), (_who != null ? _who + ": " : "") + _line);
        }
    }
}
