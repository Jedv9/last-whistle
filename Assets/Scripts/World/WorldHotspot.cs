using UnityEngine;
using UnityEngine.UI;
using LastWhistle.Core;

namespace LastWhistle.World
{
    public class WorldHotspot : MonoBehaviour
    {
        public HotspotPct data;
        public WalkController walker;
        public string locationId;
        GameObject _tip;
        Text _tipText;

        void Start()
        {
            EnsureTip();
        }

        void EnsureTip()
        {
            if (_tip != null || data == null) return;
            var canvas = new GameObject("Tip", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvas.transform.SetParent(transform, false);
            var c = canvas.GetComponent<Canvas>();
            c.renderMode = RenderMode.WorldSpace;
            c.worldCamera = Camera.main;
            var rt = canvas.GetComponent<RectTransform>();
            rt.sizeDelta = new Vector2(220, 36);
            rt.localScale = Vector3.one * 0.012f;
            rt.localPosition = new Vector3(0, 0.55f, 0);
            var img = canvas.AddComponent<Image>();
            img.sprite = UiKit.Pixel;
            img.color = new Color(0.08f, 0.08f, 0.1f, 0.9f);
            img.raycastTarget = false;
            _tipText = UiKit.Label(rt, "L", data.label ?? "", 18, data.bang ? new Color(1f, 0.85f, 0.3f) : Color.white, TextAnchor.MiddleCenter);
            _tip = canvas;
            _tip.SetActive(false);
        }

        void OnMouseEnter()
        {
            if (UiKit.PointerOverUi()) return;
            EnsureTip();
            if (_tip != null) _tip.SetActive(true);
        }

        void OnMouseExit()
        {
            if (_tip != null) _tip.SetActive(false);
        }

        void OnMouseDown()
        {
            if (UiKit.PointerOverUi()) return;
            HotspotClickGuard.Blocked = true;
            if (data != null && (!string.IsNullOrEmpty(data.travel) || data.nav == "map"))
            {
                ActionRunner.Run(data, locationId, walker);
                return;
            }
            if (walker == null)
            {
                ActionRunner.Run(data, locationId, null);
                return;
            }
            walker.GoToPct(data.standX, data.standY, () =>
            {
                HotspotClickGuard.Blocked = false;
                ActionRunner.Run(data, locationId, walker);
            });
        }

        void LateUpdate()
        {
            if (Input.GetMouseButtonUp(0)) HotspotClickGuard.Blocked = false;
        }
    }
}
