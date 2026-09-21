using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using LastWhistle.Core;
using LastWhistle.Skills;

namespace LastWhistle.UI
{
    public class TitleController : MonoBehaviour
    {
        GameObject _root;

        void Start()
        {
            var shell = GameShell.Ensure();
            shell.SetTitleMode(true);
            var parent = shell.OverlayRoot;
            _root = UiKit.Stretch(parent, "TitleRoot", new Color(0.03f, 0.04f, 0.05f, 0.55f)).gameObject;
            var art = ResourcesLoadTitleBg();
            if (art != null)
            {
                var img = _root.GetComponent<Image>();
                img.sprite = art;
                img.color = Color.white;
                img.preserveAspect = true;
            }
            var plate = UiKit.Panel(_root.transform, "Plate", new Vector2(0.22f, 0.18f), new Vector2(0.78f, 0.82f), Vector2.zero, Vector2.zero, new Color(0.07f, 0.07f, 0.09f, 0.82f));
            UiKit.Label(plate, "T", "LAST WHISTLE", 52, UiKit.Cream, TextAnchor.UpperCenter);
            UiKit.Label(plate, "S", "Blackwater Docks  ·  Juno is missing  ·  the ledger is a boat", 18, UiKit.NavCyan, TextAnchor.UpperCenter, FontStyle.Normal)
                .rectTransform.anchorMin = new Vector2(0.05f, 0.62f);
            UiKit.Label(plate, "B", "A boxing life sim. Click objects in painted rooms.\nFight is automatic — equip skills in blue slots between rounds.", 16, Color.white, TextAnchor.MiddleCenter, FontStyle.Normal)
                .rectTransform.anchorMin = new Vector2(0.08f, 0.38f);
            UiKit.MakeButton(plate, "New", new Vector2(0.28f, 0.10f), new Vector2(0.72f, 0.26f), Vector2.zero, Vector2.zero, UiKit.StrRed, "NEW GAME", 26, Color.white, NewGame);
        }

        static Sprite ResourcesLoadTitleBg()
        {
            foreach (var s in Resources.FindObjectsOfTypeAll<Sprite>())
                if (s != null && s.name.Contains("cine_01")) return s;
            var sr = Object.FindObjectOfType<SpriteRenderer>();
            return sr != null ? sr.sprite : null;
        }

        void OnDestroy()
        {
            if (_root != null) Destroy(_root);
        }

        static void NewGame()
        {
            GameBootstrap.Boot();
            FighterStats.Instance.ResetAll();
            GameClock.Instance.ResetAll();
            GameState.Instance.ResetAll();
            SkillBook.Instance.ResetAll();
            GameState.Instance.Journal("Juno has been missing for six days. Their tape cuts off on the word ledger. Rent is due in seven days.");
            GameShell.Instance.SetTitleMode(false);
            GameShell.Instance.CloseOverlays();
            SceneManager.LoadScene("Bunkhouse");
        }
    }
}
