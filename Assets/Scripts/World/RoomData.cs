using System;
using System.Collections.Generic;
using UnityEngine;

namespace LastWhistle.World
{
    [Serializable] public class RectPct { public float x, y, w, h; }
    [Serializable] public class FloorPct { public float minX, maxX, minY, maxY; }
    [Serializable]
    public class HotspotPct
    {
        public string act;
        public string nav;
        public string travel;
        public float x, y, w, h;
        public float standX, standY;
        public string label;
        public bool bang;
        public int minutes = 20;
    }

    public static class RoomCatalog
    {
        public static FloorPct Floor(string loc)
        {
            switch (loc)
            {
                case "bunk": return F(6, 94, 72, 93);
                case "docks": return F(6, 94, 68, 93);
                case "gym": return F(8, 94, 62, 93);
                case "alley": return F(18, 82, 68, 92);
                case "arena": return F(6, 94, 70, 93);
                case "diner": return F(8, 94, 70, 93);
                case "canteen": return F(8, 94, 70, 93);
                case "market": return F(8, 94, 70, 93);
                case "temple": return F(8, 94, 66, 93);
                case "crane": return F(8, 94, 68, 93);
                case "barge": return F(6, 94, 70, 93);
                default: return F(6, 94, 68, 93);
            }
        }

        public static List<RectPct> Solids(string loc)
        {
            var list = new List<RectPct>();
            void A(float x, float y, float w, float h) { list.Add(new RectPct { x = x, y = y, w = w, h = h }); }
            if (loc == "bunk")
            {
                A(0, 58, 13, 16); A(10, 54, 13, 16); A(21, 50, 12, 18); A(32, 50, 24, 12);
                A(26, 60, 11, 10); A(41, 64, 17, 9); A(50, 40, 9, 16); A(58, 44, 20, 18);
            }
            else if (loc == "gym")
            {
                A(0, 28, 18, 28); A(18, 8, 22, 28); A(42, 18, 36, 22); A(78, 28, 16, 22);
            }
            else if (loc == "docks")
            {
                A(1, 48, 15, 20); A(20, 22, 30, 28); A(27, 54, 22, 16); A(80, 64, 14, 16);
            }
            else if (loc == "diner")
            {
                A(8, 48, 22, 18); A(30, 28, 40, 22);
            }
            else if (loc == "canteen")
            {
                A(0, 20, 48, 36);
            }
            else if (loc == "temple")
            {
                A(4, 8, 28, 40); A(40, 48, 36, 12);
            }
            return list;
        }

        public static List<HotspotPct> Hotspots(string loc)
        {
            var list = new List<HotspotPct>();
            void H(string act, string nav, float x, float y, float w, float h, float sx, float sy, string label, bool bang = false)
            {
                list.Add(new HotspotPct { act = act, nav = nav, x = x, y = y, w = w, h = h, standX = sx, standY = sy, label = label, bang = bang });
            }
            if (loc == "bunk")
            {
                H(null, "map", 82, 14, 16, 52, 84, 80, "Door — harbor");
                H("look_quay", null, 78, 64, 22, 28, 86, 86, "Quay — look out");
                H("look_juno_bunk", null, 60, 22, 18, 18, 66, 76, "Juno's bunk");
                H("sleep", null, 60, 38, 22, 22, 64, 78, "Cot — sleep");
                H("sit_sofa", null, 38, 46, 22, 18, 46, 78, "Sofa — nap");
                H("home_bag", null, 2, 8, 14, 42, 14, 80, "Heavy bag");
                H("home_skip", null, 4, 68, 14, 12, 12, 84, "Skip rope");
                H("pushups", null, 10, 74, 18, 14, 18, 86, "Mats — push-ups");
                H("look_bench", null, 12, 42, 12, 22, 20, 80, "Workbench");
                H("fridge", null, 20, 20, 12, 36, 28, 78, "Fridge — eat");
                H("wash_sink", null, 32, 34, 10, 18, 36, 78, "Sink — wash up");
                H("kettle", null, 40, 32, 8, 16, 42, 78, "Kettle");
                H("look_mug", null, 38, 24, 10, 10, 42, 78, "Juno's mug");
                H("shadow", null, 40, 18, 10, 32, 50, 76, "Locker — shadowbox");
                H("tv", null, 30, 54, 12, 16, 34, 80, "TV");
                H("replay", null, 42, 64, 14, 12, 46, 80, "Juno's tape", true);
                H("look_note", null, 50, 64, 8, 10, 52, 80, "Scratch pad");
            }
            else if (loc == "gym")
            {
                H("join_rust", null, 86, 8, 13, 22, 84, 70, "Dues board $15");
                H("bag", null, 18, 4, 22, 38, 30, 68, "Heavy bag");
                H("weights", null, 0, 20, 22, 52, 20, 78, "Bent bar");
                H("skip", null, 70, 62, 18, 32, 80, 82, "Skip rope");
                H("spar", null, 24, 50, 42, 38, 48, 80, "Spar mat");
                H("talk_kade", null, 70, 34, 12, 28, 74, 72, "Kade Ruiz");
                H("pads", null, 56, 8, 16, 26, 62, 58, "Pads with Kade $8");
                H(null, "map", 0, 0, 10, 12, 10, 66, "Leave gym");
            }
            else if (loc == "docks")
            {
                H("haul", null, 22, 14, 34, 38, 44, 76, "Crates — haul");
                H("manifests", null, 30, 54, 22, 24, 42, 78, "Manifest desk");
                H("watch", null, 74, 10, 24, 48, 72, 76, "Fence — night watch");
                H("overtime", null, 56, 40, 16, 22, 60, 76, "Double shift");
                H("locker", null, 2, 16, 16, 50, 18, 76, "Juno's locker", true);
                H(null, "map", 0, 0, 10, 12, 8, 72, "Leave docks");
            }
            else if (loc == "alley")
            {
                H("board", null, 3, 2, 28, 54, 18, 72, "Fight board");
                H("rope_alley", null, 20, 70, 52, 24, 48, 80, "Potholes — footwork");
                H("dumpster", null, 72, 48, 22, 28, 68, 80, "Bins — burger");
                H(null, "map", 42, 18, 16, 22, 50, 72, "Street — map");
            }
            else if (loc == "arena")
            {
                H("arena_board", null, 26, 4, 48, 28, 22, 82, "Commission card");
                H("desk", null, 6, 42, 22, 28, 20, 80, "Bell desk");
                H(null, "map", 0, 0, 10, 14, 8, 74, "Leave arena");
            }
            else if (loc == "diner")
            {
                H("coffee", null, 32, 30, 12, 22, 38, 78, "Coffee $4");
                H("plate", null, 16, 56, 28, 24, 30, 84, "Dock plate $14");
                H("protein", null, 62, 52, 16, 20, 70, 80, "Protein pile $22");
                H("talk_oz", null, 46, 26, 16, 32, 54, 78, "Oz Pell");
                H("dishes", null, 62, 30, 14, 18, 68, 78, "Wash the stack");
                H(null, "map", 80, 8, 18, 58, 86, 78, "Door — map");
            }
            else if (loc == "canteen")
            {
                H("noodles", null, 0, 8, 16, 36, 14, 74, "Cup noodles $3");
                H("stew", null, 16, 28, 28, 28, 30, 74, "Union stew $8");
                H("talk_mae", null, 48, 20, 18, 60, 56, 76, "Mae Okonkwo");
                H(null, "map", 82, 8, 16, 58, 86, 74, "Door — map");
            }
            else if (loc == "market")
            {
                H("shop_gloves", null, 4, 40, 22, 40, 18, 78, "Gloves stall");
                H("shop_wraps", null, 26, 32, 22, 36, 36, 78, "Wraps & tape");
                H("shop_salve", null, 48, 30, 18, 34, 56, 78, "Salve jars");
                H("shop", null, 64, 38, 18, 36, 70, 78, "Boot stall");
                H(null, "map", 84, 18, 14, 52, 88, 76, "Street — map");
            }
            else if (loc == "temple")
            {
                H("join_temple", null, 78, 6, 20, 28, 84, 70, "Iron dues $40");
                H("temple_bag", null, 8, 8, 28, 54, 24, 74, "Temple bag");
                H("temple_spar", null, 32, 48, 40, 36, 50, 80, "Prospect spar");
                H(null, "map", 0, 0, 10, 12, 8, 72, "Leave temple");
            }
            else if (loc == "crane")
            {
                H("crane_board", null, 8, 4, 36, 34, 24, 76, "Exhibition board");
                H("talk_lila", null, 52, 26, 18, 60, 56, 78, "Neon Lila");
                H("bar_drink", null, 40, 18, 18, 22, 48, 74, "Neon pour $6");
                H(null, "map", 88, 0, 12, 28, 90, 74, "Stairs — map");
            }
            else if (loc == "barge")
            {
                H("sneak_barge", null, 20, 40, 42, 42, 40, 78, "Gangway", true);
                H(null, "map", 0, 70, 18, 24, 12, 80, "Back to pier");
            }
            return list;
        }

        public static List<HotspotPct> MapSpots()
        {
            var list = new List<HotspotPct>();
            void T(string travel, float x, float y, float w, float h, string label, int mins)
            {
                list.Add(new HotspotPct { travel = travel, x = x, y = y, w = w, h = h, standX = x + w / 2, standY = y + h, label = label, minutes = mins });
            }
            T("bunk", 2, 30, 14, 28, "Bunkhouse 4C", 12);
            T("docks", 16, 30, 13, 26, "Blackwater Docks", 8);
            T("canteen", 28, 32, 11, 26, "Union Canteen", 10);
            T("gym", 38, 32, 11, 26, "Rust Bucket Gym", 14);
            T("alley", 40, 56, 12, 10, "Bin Alley", 16);
            T("diner", 49, 32, 14, 26, "The Last Whistle", 14);
            T("arena", 62, 16, 14, 26, "Harbor Arena", 18);
            T("market", 62, 42, 14, 18, "Night Market", 16);
            T("crane", 74, 14, 12, 24, "Blue Crane", 18);
            T("temple", 84, 28, 14, 28, "Iron Temple", 20);
            T("barge", 78, 58, 18, 18, "Pier 9", 22);
            return list;
        }

        public static string DisplayName(string loc)
        {
            switch (loc)
            {
                case "bunk": return "Bunkhouse 4C";
                case "docks": return "Blackwater Docks";
                case "canteen": return "Union Canteen";
                case "gym": return "Rust Bucket Gym";
                case "alley": return "Bin Alley";
                case "diner": return "The Last Whistle";
                case "market": return "Night Market";
                case "temple": return "Iron Temple";
                case "crane": return "Blue Crane Club";
                case "arena": return "Harbor Arena";
                case "barge": return "Pier 9";
                case "map": return "Blackwater";
                default: return loc;
            }
        }

        static FloorPct F(float a, float b, float c, float d) => new FloorPct { minX = a, maxX = b, minY = c, maxY = d };
    }
}
