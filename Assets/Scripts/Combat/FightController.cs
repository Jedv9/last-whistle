using UnityEngine;
using UnityEngine.SceneManagement;
using LastWhistle.Core;
using LastWhistle.UI;

namespace LastWhistle.Combat
{
    public class FightController : MonoBehaviour
    {
        int _round = 1;
        int _playerHp = 100;
        int _enemyHp = 100;
        string _enemy = "Scrap Kid";
        int _purse = 22;
        bool _over;
        string _log = "Pick a stance. Round auto-resolves.";

        enum Stance { Press, Box, Counter, Stall }
        Stance _stance = Stance.Box;

        void OnGUI()
        {
            var s = FighterStats.Instance;
            GUI.Box(new Rect(20, 70, 600, 160),
                $"FIGHT vs {_enemy}   Round {_round}\nYou HP {_playerHp}   Them HP {_enemyHp}\nStance: {_stance}\n{_log}");

            if (_over)
            {
                if (GUI.Button(new Rect(20, 250, 200, 40), "Back to Map"))
                    SceneManager.LoadScene("Map");
                return;
            }

            float x = 20;
            foreach (Stance st in System.Enum.GetValues(typeof(Stance)))
            {
                if (GUI.Button(new Rect(x, 250, 100, 36), st.ToString()))
                    _stance = st;
                x += 110;
            }
            if (GUI.Button(new Rect(20, 300, 220, 40), "Resolve Round"))
                Resolve();
        }

        void Resolve()
        {
            var s = FighterStats.Instance;
            int atk = 8 + (s != null ? s.strength : 5) + StanceBonus();
            int def = 6 + (s != null ? s.agility : 5);
            int enemyHit = Random.Range(6, 14);
            int myHit = Random.Range(atk - 3, atk + 4);
            _enemyHp = Mathf.Max(0, _enemyHp - Mathf.Max(1, myHit - 3));
            _playerHp = Mathf.Max(0, _playerHp - Mathf.Max(1, enemyHit - def / 3));
            _log = $"You {_stance}: deal {myHit}. They answer for {enemyHit - def / 3}.";
            _round++;

            if (_enemyHp <= 0) Win();
            else if (_playerHp <= 0) Lose();
            else if (_round > 8)
            {
                if (_playerHp >= _enemyHp) Win(); else Lose();
            }

            if (GameClock.Instance != null) GameClock.Instance.AdvanceMinutes(8);
        }

        int StanceBonus()
        {
            switch (_stance)
            {
                case Stance.Press: return 3;
                case Stance.Counter: return 2;
                case Stance.Stall: return 0;
                default: return 1;
            }
        }

        void Win()
        {
            _over = true;
            _log = $"Win. Purse +${_purse}.";
            var s = FighterStats.Instance;
            if (s != null)
            {
                s.money += _purse;
                s.skillPoints += 2;
                s.mood = Mathf.Clamp(s.mood + 8f, 0f, 100f);
            }
            DialogueBanner.Show("You take the purse.");
        }

        void Lose()
        {
            _over = true;
            _log = "Loss. Clinic money later.";
            var s = FighterStats.Instance;
            if (s != null)
            {
                s.health = Mathf.Clamp(s.health - 20f, 5f, 100f);
                s.mood = Mathf.Clamp(s.mood - 10f, 0f, 100f);
            }
            DialogueBanner.Show("You eat canvas.");
        }
    }
}