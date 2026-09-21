using UnityEngine;
using LastWhistle.UI;

namespace LastWhistle.UI
{
    public class PunchClubHud : MonoBehaviour
    {
        void Awake()
        {
            GameShell.Ensure();
            enabled = false;
        }
    }

    public class GameHud : PunchClubHud { }
}
