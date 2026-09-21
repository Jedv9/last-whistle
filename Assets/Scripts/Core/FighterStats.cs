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
        public float hunger = 25f;
        public float energy = 85f;
        public float mood = 70f;

        public int money = 50;
        public int skillPoints = 0;
        public string fighterName = "Vale";
        public string archetype = "Crane kid";

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void ApplyDecayForMinutes(int minutes)
        {
            float hours = minutes / 60f;
            hunger = Mathf.Clamp(hunger + hours * 4f, 0f, 100f);
            energy = Mathf.Clamp(energy - hours * 2.5f, 0f, 100f);
            if (hunger > 80f) mood = Mathf.Clamp(mood - hours * 3f, 0f, 100f);
            if (energy < 15f) health = Mathf.Clamp(health - hours * 2f, 1f, 100f);
        }

        public bool CanAct() => energy >= 8f && health >= 15f;
    }
}