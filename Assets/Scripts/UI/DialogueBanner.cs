using UnityEngine;

namespace LastWhistle.UI
{
    public class DialogueBanner : MonoBehaviour
    {
        static string _line;
        static float _until;

        public static void Show(string line, float seconds = 3.5f)
        {
            _line = line;
            _until = Time.unscaledTime + seconds;
        }

        void OnGUI()
        {
            if (string.IsNullOrEmpty(_line) || Time.unscaledTime > _until) return;
            var area = new Rect(20, Screen.height - 90, Screen.width - 40, 70);
            GUI.Box(area, _line);
        }
    }
}