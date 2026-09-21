using UnityEngine;
using LastWhistle.UI;

namespace LastWhistle.World
{
    public class WorldHotspot : MonoBehaviour
    {
        public HotspotPct data;
        public WalkController walker;
        public string locationId;
        public bool showLabel;

        void OnMouseEnter() { showLabel = true; }
        void OnMouseExit() { showLabel = false; }

        void OnMouseDown()
        {
            HotspotClickGuard.Blocked = true;
            if (walker == null) return;
            walker.GoToPct(data.standX, data.standY, () =>
            {
                HotspotClickGuard.Blocked = false;
                ActionRunner.Run(data, locationId, walker);
            });
        }

        void OnGUI()
        {
            if (!showLabel || data == null) return;
            var cam = Camera.main;
            if (cam == null) return;
            var sp = cam.WorldToScreenPoint(transform.position);
            var r = new Rect(sp.x - 70, Screen.height - sp.y - 40, 140, 28);
            GUI.Box(r, data.bang ? ("! " + data.label) : data.label);
        }

        void LateUpdate()
        {
            if (Input.GetMouseButtonUp(0)) HotspotClickGuard.Blocked = false;
        }
    }
}