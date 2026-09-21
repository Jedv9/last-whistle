using System.Collections.Generic;

namespace LastWhistle.Combat
{
    public class OpponentDef
    {
        public string id;
        public string name;
        public string rank;
        public string loc;
        public int purse;
        public int fee;
        public int fameNeed;
        public int winNeed;
        public int rounds = 3;
        public bool rematch;
        public bool story;
        public string needFlag;
        public string gym;
        public int str, agi, stm, tec, hp;
        public string[] skillIds;
        public string[] perkNames;
        public string intro, win, lose;
        public string blurb;
    }

    public static class OpponentCatalog
    {
        static List<OpponentDef> _all;
        static Dictionary<string, OpponentDef> _byId;

        public static IReadOnlyList<OpponentDef> All
        {
            get { Ensure(); return _all; }
        }

        public static OpponentDef Get(string id)
        {
            Ensure();
            if (string.IsNullOrEmpty(id)) return null;
            return _byId.TryGetValue(id, out var o) ? o : null;
        }

        static void Ensure()
        {
            if (_all != null) return;
            _all = new List<OpponentDef>();
            _byId = new Dictionary<string, OpponentDef>();

            Add("tommy", "Bin Rat Tommy", "Alley", "alley", 24, 0, 0, 0, 3, false,
                7, 9, 8, 4, 88,
                new[] { "jab", "hook", "breathe" }, new[] { "Seagull cutman" },
                "A seagull sits on the ropes. Tommy nods at it like it is his cutman.",
                "Tommy offers you a sandwich from a bag. You decline. The seagull does not.",
                "You wake up next to a bin. Tommy says rent is still due.",
                "First cash. Ugly canvas.");
            Add("moss", "Pallet Moss", "Alley", "alley", 28, 0, 2, 1, 3, true,
                8, 8, 9, 5, 94,
                new[] { "jab", "clinch", "guard", "breathe" }, new[] { "Clincher" },
                "Moss smells like wet wood. He clinches until you cannot breathe.",
                "Moss sits on a pallet. Card night, he says.",
                "He held on until you ran out of air.",
                "He will hug you until the yellow bar dies.");
            Add("wren", "Pipe Wren", "Alley", "alley", 32, 0, 4, 1, 3, true,
                10, 7, 9, 6, 100,
                new[] { "cross", "dock_hook", "guard" }, new[] { "Pipe ribs" },
                "Wren used to fit pipes. Your ribs are the next measurement.",
                "Wren shakes your hand like they mean it.",
                "Your ribs have a new bruise. Wren files it under done.",
                "Walk-forward power.");
            Add("cobb", "Cobb the Bolt", "Alley", "alley", 36, 0, 6, 2, 3, true,
                11, 8, 10, 6, 104,
                new[] { "hook", "dock_hook", "cover" }, new[] { "Tightener" },
                "Cobb tightens a bolt on the rope. Then he tries to do the same to you.",
                "Cobb nods. The bolt is still tighter than you were.",
                "Your shoulder will remember that for a few days.",
                "Gym-adjacent alley muscle.");
            Add("sal", "Hook-Hand Sal", "Alley", "alley", 40, 0, 10, 2, 4, false,
                9, 10, 10, 8, 108,
                new[] { "counter_rip", "hook", "weave", "jab" }, new[] { "Nickname hands" },
                "Hook is a nickname. The hands are real.",
                "Sal grins. Tell Juno the docks still bite.",
                "Sal taps your cheek. Come back when the ledger is heavier.",
                "Needs Bay C rumors.");
            _all[_all.Count - 1].needFlag = "heardLocker";

            Add("nunzio", "Brick Nunzio", "Gym", "gym", 36, 0, 6, 1, 4, false,
                12, 6, 11, 5, 120,
                new[] { "dock_hook", "cover", "hook", "breathe" }, new[] { "Corner house" },
                "Kade said don't let Nunzio walk you to the corner. That corner is his house.",
                "Nunzio laughs through a nosebleed. Kade's pet has teeth.",
                "The corner was his house. You left on the floor.",
                "Rust Bucket regular.");
            _all[_all.Count - 1].gym = "rust";

            Add("delia", "Delia Pins", "Gym", "gym", 42, 0, 8, 2, 4, true,
                9, 11, 10, 8, 110,
                new[] { "feather", "weave", "one_two", "duck" }, new[] { "Light feet" },
                "Delia pins the bag still with a look. Then she pins you.",
                "Delia says Kade still oversteeps the tea. You, less so.",
                "Your footwork goes back to where it started.",
                "Timing over muscle.");
            _all[_all.Count - 1].gym = "rust";

            Add("hoss", "Hoss Plate", "Gym", "gym", 52, 0, 14, 4, 4, false,
                14, 7, 13, 6, 128,
                new[] { "container", "cover", "dock_hook", "clinch" }, new[] { "Iron chin", "Loading plate" },
                "Hoss is built like a loading plate. Do not let him walk through you.",
                "Hoss laughs. The windows rattle.",
                "He walked through you.",
                "Galley-path nightmare.");
            _all[_all.Count - 1].gym = "rust";

            Add("lila", "Neon Lila", "Club", "crane", 70, 10, 14, 3, 4, false,
                9, 13, 11, 12, 115,
                new[] { "ghost", "counter_rip", "weave", "one_two" }, new[] { "Second beat", "Pink light" },
                "Pink light. She fought Juno. She is not here to be kind.",
                "Lila touches gloves. Your sibling hit like that. Then they got quiet.",
                "She helps you up. That is worse than the round.",
                "Exhibition queen.");

            Add("kit", "Kit Neon", "Club", "crane", 62, 8, 16, 3, 4, true,
                10, 13, 11, 11, 118,
                new[] { "feather", "one_two", "weave", "jab" }, new[] { "Borrowed light" },
                "Kit borrows Lila's pink light and none of her patience.",
                "Kit says tell Lila the echo got louder.",
                "The light stays. You sit down.",
                "Opens with the crane club.");
            _all[_all.Count - 1].needFlag = "craneOpen";

            Add("perry", "Glassjaw Perry", "Club", "crane", 55, 8, 18, 4, 4, false,
                11, 11, 9, 10, 96,
                new[] { "boom_straight", "cross", "duck", "breathe" }, new[] { "Glass rumor" },
                "Everyone says Perry has a glass chin. Perry says he has timing.",
                "Perry sits down like a man remembering gravity.",
                "Tonight it was the chin.",
                "Hit him first.");

            Add("marlow", "Marlow Vein", "Club", "crane", 78, 10, 20, 5, 5, false,
                12, 12, 12, 12, 124,
                new[] { "counter_rip", "hawser", "weave", "work_rate" }, new[] { "Rumor mill" },
                "Marlow sells rumors between rounds. Tonight you are the rumor.",
                "Marlow says Pier 9 has been loud. He did not say that.",
                "He is already selling the story of your loss.",
                "Balanced and mean.");

            Add("reed", "Reed the Invoice", "Commission", "arena", 100, 12, 24, 6, 5, false,
                13, 12, 14, 12, 142,
                new[] { "cross", "cover", "crane_lift", "work_rate" }, new[] { "Second wind" },
                "Reed jabs like he is writing an invoice. Crowe likes his math.",
                "Reed says the whistle still is not yours. The numbers moved.",
                "The card has your name. You paid in lights.",
                "Commission math.");
            _all[_all.Count - 1].needFlag = "vargasUnlocked";

            Add("sophie", "Iron Sophie", "Title", "arena", 120, 15, 26, 7, 5, false,
                13, 12, 14, 13, 150,
                new[] { "ghost", "hull", "boom_straight", "last_bell" }, new[] { "Iron chin", "Temple code" },
                "Temple champion. She nods once, like she is filing you under Later.",
                "Sophie: if you take Crowe's whistle, don't swallow it.",
                "A clinic. You were the demonstration.",
                "Honor, then hurt.");

            Add("vargas", "Crane Vargas", "Commission", "arena", 90, 0, 0, 0, 5, false,
                14, 10, 13, 9, 140,
                new[] { "container", "dock_hook", "cover", "clinch" }, new[] { "Inventory man", "Iron forearm" },
                "Crowe's enforcer. He calls fighters inventory. He walked Juno toward the water.",
                "Vargas hits the canvas. Juno is cargo, he says. Cargo moves.",
                "The lights are honest. You are not winning this fight.",
                "Story gate.");
            _all[_all.Count - 1].story = true;
            _all[_all.Count - 1].needFlag = "vargasUnlocked";

            Add("crowe", "Silas Crowe", "The Whistle", "arena", 200, 0, 0, 0, 6, false,
                15, 13, 15, 14, 165,
                new[] { "ghost", "container", "hull", "work_rate", "counter_rip" }, new[] { "Sold ending", "Second wind", "Wreck hands" },
                "This is the night fight Juno warned you about. Crowe smiles like he already sold the ending.",
                "The whistle in his pocket is just metal. The man was the trap.",
                "He does not knock you out. He catalogues you.",
                "Finale.");
            _all[_all.Count - 1].story = true;
            _all[_all.Count - 1].needFlag = "croweUnlocked";

            foreach (var o in _all) _byId[o.id] = o;
        }

        static void Add(string id, string name, string rank, string loc, int purse, int fee, int fame, int wins, int rounds, bool rematch,
            int str, int agi, int stm, int tec, int hp, string[] skills, string[] perks,
            string intro, string win, string lose, string blurb)
        {
            _all.Add(new OpponentDef
            {
                id = id, name = name, rank = rank, loc = loc, purse = purse, fee = fee,
                fameNeed = fame, winNeed = wins, rounds = rounds, rematch = rematch,
                str = str, agi = agi, stm = stm, tec = tec, hp = hp,
                skillIds = skills, perkNames = perks, intro = intro, win = win, lose = lose, blurb = blurb
            });
        }
    }
}
