using UnityEngine;
using UnityEngine.SceneManagement;
using LastWhistle.Core;
using LastWhistle.UI;

namespace LastWhistle.World
{
    public static class ActionRunner
    {
        public static void Run(HotspotPct hs, string loc, WalkController walk)
        {
            if (hs == null) return;
            if (!string.IsNullOrEmpty(hs.nav) && hs.nav == "map")
            {
                SceneManager.LoadScene("Map");
                return;
            }
            if (!string.IsNullOrEmpty(hs.travel))
            {
                var clock = GameClock.Instance;
                if (clock != null) clock.AdvanceMinutes(20);
                SceneManager.LoadScene(SceneFor(hs.travel));
                return;
            }
            DoAct(hs.act, walk);
        }

        static string SceneFor(string id)
        {
            switch (id)
            {
                case "bunk": return "Bunkhouse";
                case "gym": return "Gym";
                case "docks": return "Docks";
                case "alley": return "Alley";
                case "arena": return "Arena";
                case "diner": return "Diner";
                default: return "Map";
            }
        }

        static void DoAct(string act, WalkController walk)
        {
            var s = FighterStats.Instance;
            var c = GameClock.Instance;
            if (s == null || c == null) return;

            void Spend(int mins) { c.AdvanceMinutes(mins); }

            switch (act)
            {
                case "sleep":
                    walk?.SetPose("down");
                    s.energy = Mathf.Clamp(s.energy + 50f, 0, 100);
                    s.health = Mathf.Clamp(s.health + 10f, 0, 100);
                    s.hunger = Mathf.Clamp(s.hunger + 12f, 0, 100);
                    Spend(360); DialogueBanner.Show("You sleep on the cot."); break;
                case "fridge":
                    if (s.money < 3) { DialogueBanner.Show("Fridge is empty and you're broke."); break; }
                    s.money -= 3; s.hunger = Mathf.Clamp(s.hunger - 30f, 0, 100); Spend(20);
                    DialogueBanner.Show("Cold noodles. Hunger down."); break;
                case "home_bag":
                case "bag":
                case "temple_bag":
                    walk?.SetPose("punch");
                    s.strength += 1; s.energy = Mathf.Clamp(s.energy - 16f, 0, 100); Spend(120);
                    DialogueBanner.Show("Heavy bag work. STR up."); break;
                case "home_skip":
                case "skip":
                case "rope_alley":
                    walk?.SetPose("skip");
                    s.agility += 1; s.energy = Mathf.Clamp(s.energy - 14f, 0, 100); Spend(90);
                    DialogueBanner.Show("Footwork. AGI up."); break;
                case "pushups":
                    walk?.SetPose("down");
                    s.strength += 1; s.stamina += 1; Spend(60);
                    DialogueBanner.Show("Mats. STR/STA up."); break;
                case "weights":
                    walk?.SetPose("lift");
                    s.strength += 2; s.energy = Mathf.Clamp(s.energy - 20f, 0, 100); Spend(150);
                    DialogueBanner.Show("Iron. STR up."); break;
                case "haul":
                case "overtime":
                    walk?.SetPose("lift");
                    s.money += act == "overtime" ? 28 : 16;
                    s.stamina += 1; s.energy = Mathf.Clamp(s.energy - 22f, 0, 100); Spend(180);
                    DialogueBanner.Show("Dock shift. Cash earned."); break;
                case "tv":
                case "sit_sofa":
                    s.mood = Mathf.Clamp(s.mood + 8f, 0, 100); Spend(60);
                    DialogueBanner.Show("You zone out. Mood up."); break;
                case "spar":
                    walk?.SetPose("punch");
                    s.skillPoints += 1; s.energy = Mathf.Clamp(s.energy - 18f, 0, 100); Spend(90);
                    DialogueBanner.Show("Spar. +1 skill point."); break;
                case "board":
                case "arena_board":
                    SceneManager.LoadScene("Fight"); break;
                case "talk_kade":
                    DialogueBanner.Show("Kade: Keep your elbows in. Harbor don't forgive."); s.mood = Mathf.Clamp(s.mood + 3f, 0, 100); break;
                case "talk_oz":
                    DialogueBanner.Show("Oz: Coffee's burnt. Story checks out."); break;
                case "replay":
                case "locker":
                    DialogueBanner.Show("Juno's voice on the tape: '...ledger.' Clue sticks."); s.skillPoints += 1; break;
                case "coffee":
                    if (s.money < 4) { DialogueBanner.Show("Can't afford coffee."); break; }
                    s.money -= 4; s.energy = Mathf.Clamp(s.energy + 12f, 0, 100); Spend(15);
                    DialogueBanner.Show("Whistle coffee."); break;
                case "plate":
                    if (s.money < 14) { DialogueBanner.Show("Too rich for the plate."); break; }
                    s.money -= 14; s.hunger = Mathf.Clamp(s.hunger - 45f, 0, 100); Spend(30);
                    DialogueBanner.Show("Dock plate. Full."); break;
                case "dumpster":
                    s.hunger = Mathf.Clamp(s.hunger - 15f, 0, 100); s.mood = Mathf.Clamp(s.mood - 4f, 0, 100); Spend(20);
                    DialogueBanner.Show("Leftover burger. Gross. Helps."); break;
                default:
                    DialogueBanner.Show(act ?? "…"); break;
            }
        }
    }
}