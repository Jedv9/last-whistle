using UnityEngine;
using UnityEngine.SceneManagement;
using LastWhistle.Core;
using LastWhistle.UI;
using LastWhistle.World;

namespace LastWhistle.Combat
{
    public class FightController : MonoBehaviour
    {
        FightSession _fight;
        FightView _view;
        float _acc;
        const float Step = 1.05f;

        void Start()
        {
            var gs = GameState.Instance;
            var id = gs != null ? gs.pendingOpponent : null;
            var opp = OpponentCatalog.Get(id) ?? OpponentCatalog.Get("tommy");
            _fight = FightEngine.Make(opp);
            var shell = GameShell.Instance;
            Transform parent = shell != null ? shell.OverlayRoot : null;
            if (parent == null)
            {
                var c = UiKit.MakeOverlayCanvas("FightCanvas", 80);
                parent = c.transform;
            }
            _view = new FightView(parent, this);
            _view.Bind(_fight);
            DialogueBanner.Show(opp.intro, 4.5f);
            if (GameShell.Instance != null) GameShell.Instance.SetFightMode(true);
        }

        void OnDestroy()
        {
            _view?.Destroy();
            if (GameShell.Instance != null) GameShell.Instance.SetFightMode(false);
        }

        void Update()
        {
            if (_fight == null || _view == null) return;
            if (_fight.running && !_fight.over)
            {
                _acc += Time.deltaTime;
                while (_acc >= Step && _fight.running && !_fight.over)
                {
                    _acc -= Step;
                    FightEngine.Tick(_fight);
                    _view.Paint(_fight);
                    if (_fight.over) FinishRewards();
                }
            }
        }

        public void OnBell()
        {
            if (_fight == null || _fight.over) return;
            FightEngine.Bell(_fight);
            _acc = 0f;
            _view.Paint(_fight);
        }

        public void OnSalts()
        {
            var gs = GameState.Instance;
            if (gs == null || gs.salts <= 0 || _fight == null || _fight.over) return;
            gs.salts--;
            _fight.player.energy = Mathf.Min(100f, _fight.player.energy + 18f);
            _fight.log = "Salts. The world gets sharp again.";
            _view.Paint(_fight);
        }

        public void RefreshLoadout()
        {
            FightEngine.RefreshPlayerLoadout(_fight);
            _view?.Paint(_fight);
        }

        public void OnLeave()
        {
            var gs = GameState.Instance;
            string loc = gs != null && !string.IsNullOrEmpty(gs.pendingVenue) ? gs.pendingVenue : "alley";
            if (gs != null) gs.pendingOpponent = null;
            SceneManager.LoadScene(ActionRunner.SceneName(loc));
        }

        void FinishRewards()
        {
            var s = FighterStats.Instance;
            var gs = GameState.Instance;
            var clock = GameClock.Instance;
            if (clock != null) clock.AdvanceMinutes(12);
            if (s == null || gs == null || _fight == null) return;
            s.skillPoints += _fight.playerWon ? 3 : 1;
            if (_fight.playerWon)
            {
                s.money += _fight.purse;
                s.mood = Mathf.Clamp(s.mood + 10f, 0, 100);
                gs.fame += 2;
                gs.wins++;
                gs.SetFlag("beat_" + _fight.opp.id);
                gs.Journal("Won against " + _fight.opp.name + ". Purse $" + _fight.purse + ".");
                if (_fight.opp.id == "lila") gs.SetFlag("craneOpen");
                if (_fight.opp.id == "vargas") gs.SetFlag("croweUnlocked");
                DialogueBanner.Show(_fight.opp.win, 4f);
            }
            else
            {
                s.health = Mathf.Clamp(s.health - 18f, 8f, 100f);
                s.mood = Mathf.Clamp(s.mood - 10f, 0, 100);
                gs.losses++;
                gs.Journal("Lost to " + _fight.opp.name + ".");
                DialogueBanner.Show(_fight.opp.lose, 4f);
            }
        }
    }
}
