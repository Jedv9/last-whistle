using UnityEngine;

namespace LastWhistle.Core
{
    public class FighterStats : MonoBehaviour
    {
        public static FighterStats Instance { get; private set; }

        public int strength = 6;
        public int agility = 5;
        public int stamina = 5;

        public float health = 100f;
        public float hunger = 22f;
        public float energy = 88f;
        public float mood = 70f;

        public int money = 42;
        public int skillPoints = 1;
        public string fighterName = "Ren Vale";
        public string archetype = "Crane kid";

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void ResetAll()
        {
            strength = 6;
            agility = 5;
            stamina = 5;
            health = 100f;
            hunger = 22f;
            energy = 88f;
            mood = 70f;
            money = 42;
            skillPoints = 1;
            fighterName = "Ren Vale";
            archetype = "Crane kid";
        }

        public int Str => strength + (GameState.Instance != null ? GameState.Instance.ItemBonus("str") : 0);
        public int Agi => agility + (GameState.Instance != null ? GameState.Instance.ItemBonus("agi") : 0);
        public int Sta => stamina + (GameState.Instance != null ? GameState.Instance.ItemBonus("stm") : 0);

        public int BaseFightHp
        {
            get
            {
                int mn = Mathf.Min(Str, Mathf.Min(Agi, Sta));
                return 38 + 6 * Str + 3 * Agi + 8 * Sta + 16 * mn;
            }
        }

        public int FightHp
        {
            get
            {
                float h = Mathf.Clamp01(health / 100f);
                return Mathf.Max(20, Mathf.RoundToInt(BaseFightHp * 0.5f + BaseFightHp * h * 0.5f));
            }
        }

        public float EnergyRegen => 5f + Sta * 1.5f;
        public float Armor => Sta * 0.35f;

        public void ApplyDecayForMinutes(int minutes)
        {
            float hours = minutes / 60f;
            hunger = Mathf.Clamp(hunger + hours * 4.2f, 0f, 100f);
            energy = Mathf.Clamp(energy - hours * 2.4f, 0f, 100f);
            if (hunger > 80f) mood = Mathf.Clamp(mood - hours * 3f, 0f, 100f);
            if (energy < 15f) health = Mathf.Clamp(health - hours * 2f, 1f, 100f);
            if (hunger > 92f) health = Mathf.Clamp(health - hours * 3f, 1f, 100f);
        }

        public bool CanAct() => energy >= 8f && health >= 12f;

        public bool SpendEnergy(float amt)
        {
            if (energy < amt) return false;
            energy = Mathf.Clamp(energy - amt, 0f, 100f);
            return true;
        }

        public bool SpendMoney(int amt)
        {
            if (money < amt) return false;
            money -= amt;
            return true;
        }

        public void GainStat(string which, int amount)
        {
            switch (which)
            {
                case "str": strength = Mathf.Min(30, strength + amount); break;
                case "agi": agility = Mathf.Min(30, agility + amount); break;
                case "stm": stamina = Mathf.Min(30, stamina + amount); break;
            }
        }
    }
}
