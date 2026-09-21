using UnityEngine;
using UnityEngine.SceneManagement;
using LastWhistle.Core;
using LastWhistle.UI;
using LastWhistle.Story;

namespace LastWhistle.World
{
    public static class ActionRunner
    {
        public static string SceneName(string id)
        {
            switch (id)
            {
                case "bunk": return "Bunkhouse";
                case "gym": return "Gym";
                case "docks": return "Docks";
                case "alley": return "Alley";
                case "arena": return "Arena";
                case "diner": return "Diner";
                case "canteen": return SceneExists("Canteen") ? "Canteen" : "Bunkhouse";
                case "market": return SceneExists("Market") ? "Market" : "Bunkhouse";
                case "temple": return SceneExists("Temple") ? "Temple" : "Bunkhouse";
                case "crane": return SceneExists("Crane") ? "Crane" : "Bunkhouse";
                case "barge": return SceneExists("Barge") ? "Barge" : "Bunkhouse";
                case "map": return "Map";
                case "fight": return "Fight";
                default: return "Map";
            }
        }

        static bool SceneExists(string name)
        {
            for (int i = 0; i < SceneManager.sceneCountInBuildSettings; i++)
            {
                var path = SceneUtility.GetScenePathByBuildIndex(i);
                if (string.IsNullOrEmpty(path)) continue;
                if (System.IO.Path.GetFileNameWithoutExtension(path) == name) return true;
            }
            return false;
        }

        public static void Run(HotspotPct hs, string loc, WalkController walk)
        {
            if (hs == null) return;
            if (!string.IsNullOrEmpty(hs.nav) && hs.nav == "map")
            {
                if (GameClock.Instance != null) GameClock.Instance.AdvanceMinutes(8);
                SceneManager.LoadScene("Map");
                return;
            }
            if (!string.IsNullOrEmpty(hs.travel))
            {
                int mins = hs.minutes > 0 ? hs.minutes : 20;
                if (GameClock.Instance != null) GameClock.Instance.AdvanceMinutes(mins);
                if (GameState.Instance != null) GameState.Instance.locationId = hs.travel;
                SceneManager.LoadScene(SceneName(hs.travel));
                return;
            }
            DoAct(hs.act, walk);
        }

        static void DoAct(string act, WalkController walk)
        {
            var s = FighterStats.Instance;
            var c = GameClock.Instance;
            var g = GameState.Instance;
            if (s == null || c == null || g == null) return;

            void Spend(int mins) { c.AdvanceMinutes(mins); }

            bool NeedEnergy(float n)
            {
                if (s.energy < n) { DialogueBanner.Show("You're spent. Sleep or eat."); return false; }
                return true;
            }

            bool NeedGym(string gym)
            {
                if (g.GymOk(gym)) return true;
                DialogueBanner.Show(gym == "temple" ? "Iron Temple wants dues." : "Kade won't coach a tourist. Pay the board.");
                return false;
            }

            bool Train(string key, string statA, int a, string statB, int b, float energy, int mins, string pose, string line)
            {
                if (!NeedEnergy(energy)) return false;
                walk?.SetPose(pose);
                int times = g.TrainedToday(key);
                int gain = times >= 4 ? 0 : times >= 2 && Random.value < 0.5f ? 0 : 1;
                if (gain > 0)
                {
                    s.GainStat(statA, a * gain);
                    if (statB != null) s.GainStat(statB, b * gain);
                }
                s.SpendEnergy(energy);
                s.hunger = Mathf.Clamp(s.hunger + energy * 0.35f, 0, 100);
                g.CountTrain(key);
                Spend(mins);
                DialogueBanner.Show(gain > 0 ? line : line + " No more gain today.");
                return true;
            }

            switch (act)
            {
                case "sleep":
                    walk?.SetPose("down");
                    s.energy = Mathf.Clamp(s.energy + 55f, 0, 100);
                    s.health = Mathf.Clamp(s.health + 12f, 0, 100);
                    s.hunger = Mathf.Clamp(s.hunger + 14f, 0, 100);
                    s.mood = Mathf.Clamp(s.mood + 4f, 0, 100);
                    Spend(420);
                    DialogueBanner.Show("You sleep on the cot. Harbor dreams.");
                    break;
                case "fridge":
                    if (!g.Flag("ateStart"))
                    {
                        g.SetFlag("ateStart");
                        s.hunger = Mathf.Clamp(s.hunger - 35f, 0, 100);
                        s.mood = Mathf.Clamp(s.mood + 6f, 0, 100);
                        Spend(15);
                        if (!g.Flag("flyer"))
                        {
                            g.SetFlag("flyer");
                            g.Journal("A Bin Alley fight card slid under the door. Cash fights. Purse goes in a hat.");
                            DialogueBanner.Talk("FRIDGE", "Juno's leftover noodles. While you eat, a card slides under the door: BIN ALLEY CIRCUIT. Winner takes the hat.");
                        }
                        else DialogueBanner.Show("Juno's leftover noodles. Hunger down.");
                        break;
                    }
                    if (s.money < 3) { DialogueBanner.Show("Fridge is empty and you're broke."); break; }
                    s.money -= 3; s.hunger = Mathf.Clamp(s.hunger - 28f, 0, 100); Spend(20);
                    DialogueBanner.Show("Cold noodles. Hunger down."); break;
                case "home_bag":
                case "bag":
                case "temple_bag":
                    if (act == "bag" && !NeedGym("rust")) break;
                    if (act == "temple_bag" && !NeedGym("temple")) break;
                    Train(act, "str", 1, "stm", 0, 16f, 90, "punch", "Heavy bag. Shoulders talk back.");
                    break;
                case "home_skip":
                case "skip":
                case "rope_alley":
                    if (act == "skip" && !NeedGym("rust")) break;
                    Train(act, "agi", 1, "stm", 1, 14f, 70, "skip", "Footwork. The rope is honest.");
                    break;
                case "pushups":
                    Train("pushups", "str", 1, "stm", 1, 12f, 50, "down", "Mats. Slow strength.");
                    break;
                case "weights":
                    if (!NeedGym("rust")) break;
                    Train("weights", "str", 1, "stm", 1, 18f, 100, "lift", "Iron. The bar is bent for a reason.");
                    break;
                case "shadow":
                    Train("shadow", "agi", 1, null, 0, 12f, 50, "punch", "You box the locker. It does not box back.");
                    break;
                case "spar":
                case "temple_spar":
                    if (act == "spar" && !NeedGym("rust")) break;
                    if (act == "temple_spar" && !NeedGym("temple")) break;
                    if (!NeedEnergy(20)) break;
                    walk?.SetPose("punch");
                    if (g.TrainedToday("spar") == 0) s.skillPoints += 1;
                    Train(act, "agi", 1, "stm", 0, 18f, 80, "punch", "Spar. Timing, gas, a little blood.");
                    break;
                case "pads":
                    if (!NeedGym("rust")) break;
                    if (!s.SpendMoney(8)) { DialogueBanner.Show("Pads are $8."); break; }
                    Train("pads", "agi", 1, null, 0, 10f, 40, "punch", "Kade's pads. He does not praise.");
                    break;
                case "haul":
                    if (!NeedEnergy(22)) break;
                    walk?.SetPose("lift");
                    s.money += 16; s.GainStat("stm", g.TrainedToday("haul") < 2 ? 1 : 0);
                    s.SpendEnergy(22); Spend(180);
                    g.CountTrain("haul");
                    DialogueBanner.Show("Dock shift. Cash in the envelope.");
                    break;
                case "overtime":
                    if (!NeedEnergy(28)) break;
                    walk?.SetPose("lift");
                    s.money += 28; s.GainStat("stm", 1); s.SpendEnergy(26); Spend(300);
                    DialogueBanner.Show("Double shift. Brant pays. Your hands file a complaint.");
                    break;
                case "manifests":
                    if (!NeedEnergy(10)) break;
                    s.money += 9; s.SpendEnergy(10); Spend(90);
                    if (!g.Flag("heardLocker") && Random.value < 0.35f)
                    {
                        g.SetFlag("heardLocker");
                        DialogueBanner.Talk("MANIFEST", "A dockhand named Rui: Bay C, third locker from the horn. Brant told you not to look. That's why you should.");
                    }
                    else DialogueBanner.Show("Paper work. Light on the back.");
                    break;
                case "watch":
                    if (c.Hour < 17) { DialogueBanner.Show("Night watch is an evening job."); break; }
                    if (!NeedEnergy(18)) break;
                    s.money += 14; s.SpendEnergy(16); Spend(150);
                    if (g.Flag("hornEar")) StoryDirector.LookQuay();
                    else DialogueBanner.Show("Fence, thermos, rumor.");
                    break;
                case "tv":
                case "sit_sofa":
                    s.mood = Mathf.Clamp(s.mood + 8f, 0, 100); s.energy = Mathf.Clamp(s.energy + 6f, 0, 100); Spend(60);
                    DialogueBanner.Show("You zone out. Mood up."); break;
                case "wash_sink":
                    s.mood = Mathf.Clamp(s.mood + 3f, 0, 100); s.health = Mathf.Clamp(s.health + 2f, 0, 100); Spend(10);
                    DialogueBanner.Show("Cold water. Files a complaint with your face."); break;
                case "kettle":
                    s.energy = Mathf.Clamp(s.energy + 5f, 0, 100); Spend(15);
                    DialogueBanner.Show("Tea that tastes like a pipe with manners."); break;
                case "look_quay": StoryDirector.LookQuay(); Spend(8); break;
                case "look_mug": DialogueBanner.Show("Juno's mug. Still waiting for too much sugar."); break;
                case "look_bench": DialogueBanner.Show("Tape, wrenches, a glove that lost its twin."); break;
                case "look_note":
                    g.Journal("Scratch pad: Pier 9 underlined twice. A horn interval. Don't take the night bout.");
                    DialogueBanner.Show("Pier 9 underlined twice. Don't take the night bout.");
                    break;
                case "look_juno_bunk": DialogueBanner.Show("Top bunk. Navy-wrong fold. Don't touch it."); break;
                case "replay": StoryDirector.ReplayTape(); Spend(10); break;
                case "locker": StoryDirector.OpenLocker(); Spend(12); break;
                case "board":
                case "arena_board":
                case "crane_board":
                    GameShell.Instance?.Panels.Toggle(OverlayKind.FightCard);
                    break;
                case "desk":
                    DialogueBanner.Show("Harbor Commission. Fair fights. No fouls. Honor the sea. Crowe prints the card.");
                    break;
                case "talk_kade": StoryDirector.TalkKade(); s.mood = Mathf.Clamp(s.mood + 2f, 0, 100); break;
                case "talk_oz":
                    StoryDirector.TalkOz();
                    if (g.Flag("lilaTalk") && !g.Flag("radio")) StoryDirector.RadioOz();
                    break;
                case "talk_mae": StoryDirector.TalkMae(); break;
                case "talk_lila": StoryDirector.TalkLila(); break;
                case "coffee":
                    if (!s.SpendMoney(4)) { DialogueBanner.Show("Can't afford coffee."); break; }
                    s.energy = Mathf.Clamp(s.energy + 14f, 0, 100); s.hunger = Mathf.Clamp(s.hunger - 6f, 0, 100); Spend(15);
                    DialogueBanner.Show("Whistle coffee. A dare in a cup."); break;
                case "plate":
                    if (!s.SpendMoney(14)) { DialogueBanner.Show("Too rich for the plate."); break; }
                    s.hunger = Mathf.Clamp(s.hunger - 50f, 0, 100); s.health = Mathf.Clamp(s.health + 8f, 0, 100); s.mood = Mathf.Clamp(s.mood + 8f, 0, 100); Spend(30);
                    DialogueBanner.Show("Dock plate. Eggs and a pickle with opinions."); break;
                case "protein":
                    if (!s.SpendMoney(22)) { DialogueBanner.Show("Protein pile is $22."); break; }
                    s.hunger = Mathf.Clamp(s.hunger - 36f, 0, 100); s.health = Mathf.Clamp(s.health + 8f, 0, 100); Spend(25);
                    DialogueBanner.Show("Tomorrow's bag work will thank you."); break;
                case "noodles":
                    if (!s.SpendMoney(3)) { DialogueBanner.Show("Noodles are $3."); break; }
                    s.hunger = Mathf.Clamp(s.hunger - 28f, 0, 100); Spend(15);
                    DialogueBanner.Show("Hot water and optimism."); break;
                case "stew":
                    if (!s.SpendMoney(8)) { DialogueBanner.Show("Stew is $8."); break; }
                    s.hunger = Mathf.Clamp(s.hunger - 44f, 0, 100); s.mood = Mathf.Clamp(s.mood + 8f, 0, 100); s.health = Mathf.Clamp(s.health + 6f, 0, 100); Spend(25);
                    DialogueBanner.Show("Mae's stew. It builds something."); break;
                case "dumpster":
                    s.hunger = Mathf.Clamp(s.hunger - 15f, 0, 100); s.mood = Mathf.Clamp(s.mood - 4f, 0, 100); s.health = Mathf.Clamp(s.health - 3f, 1, 100); Spend(20);
                    DialogueBanner.Show("Leftover burger. Gross. Helps."); break;
                case "dishes":
                    if (!NeedEnergy(8)) break;
                    s.money += 7; s.SpendEnergy(8); Spend(120);
                    DialogueBanner.Show("Oz points. You become the stack."); break;
                case "join_rust":
                    if (g.GymOk("rust")) { DialogueBanner.Show("Dues are current."); break; }
                    if (!s.SpendMoney(15)) { DialogueBanner.Show("Fifteen a week."); break; }
                    g.rustMember = true; g.rustPaidThroughDay = c.day + 7;
                    g.Journal("Rust Bucket dues paid. Kade will look at you now.");
                    DialogueBanner.Show("Kade stamps the card. Don't waste the bags."); break;
                case "join_temple":
                    if (g.GymOk("temple")) { DialogueBanner.Show("Iron dues current."); break; }
                    if (!s.SpendMoney(40)) { DialogueBanner.Show("Forty a week."); break; }
                    g.templeMember = true; g.templePaidThroughDay = c.day + 7;
                    DialogueBanner.Show("They polish the bell. They do not polish you."); break;
                case "shop":
                case "shop_gloves":
                case "shop_wraps":
                case "shop_salve":
                    GameShell.Instance?.Panels.ShowShop();
                    break;
                case "bar_drink":
                    if (!s.SpendMoney(6)) { DialogueBanner.Show("Neon pour is $6."); break; }
                    s.mood = Mathf.Clamp(s.mood + 6f, 0, 100); s.energy = Mathf.Clamp(s.energy - 4f, 0, 100); Spend(20);
                    DialogueBanner.Show("Sweet and mean. The ring in the back stays hungry."); break;
                case "sneak_barge":
                    StoryDirector.SneakBarge(); Spend(25); break;
                default:
                    DialogueBanner.Show(act ?? "…"); break;
            }
        }
    }
}
