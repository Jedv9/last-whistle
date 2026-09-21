using System;
using System.Collections.Generic;
using UnityEngine;

namespace LastWhistle.World
{
    [Serializable] public class RectPct { public float x,y,w,h; }
    [Serializable] public class FloorPct { public float minX,maxX,minY,maxY; }
    [Serializable] public class HotspotPct
    {
        public string act;
        public string nav;
        public string travel;
        public float x,y,w,h;
        public float standX, standY;
        public string label;
        public bool bang;
    }

    public static class RoomCatalog
    {
        public static FloorPct Floor(string loc)
        {
            switch (loc)
            {
                case "bunk": return F(6,94,72,93);
                case "docks": return F(6,94,68,93);
                case "gym": return F(8,94,62,93);
                case "alley": return F(18,82,68,92);
                case "arena": return F(6,94,70,93);
                case "diner": return F(8,94,70,93);
                case "canteen": return F(8,94,70,93);
                case "market": return F(8,94,70,93);
                case "temple": return F(8,94,66,93);
                case "crane": return F(8,94,68,93);
                default: return F(6,94,68,93);
            }
        }

        public static List<RectPct> Solids(string loc)
        {
            var list = new List<RectPct>();
            void A(float x,float y,float w,float h){ list.Add(new RectPct{x=x,y=y,w=w,h=h}); }
            if (loc == "bunk")
            {
                A(0,58,13,16); A(10,54,13,16); A(21,50,12,18); A(32,50,24,12);
                A(26,60,11,10); A(41,64,17,9); A(50,40,9,16); A(58,44,20,18);
            }
            else if (loc == "gym")
            {
                A(0,28,18,28); A(18,8,22,28); A(42,18,36,22); A(78,28,16,22);
            }
            else if (loc == "docks")
            {
                A(1,48,15,20); A(20,22,30,28); A(27,54,22,16); A(80,64,14,16);
            }
            return list;
        }

        public static List<HotspotPct> Hotspots(string loc)
        {
            var list = new List<HotspotPct>();
            void H(string act, string nav, float x,float y,float w,float h, float sx,float sy, string label, bool bang=false)
            {
                list.Add(new HotspotPct{ act=act, nav=nav, x=x,y=y,w=w,h=h, standX=sx, standY=sy, label=label, bang=bang });
            }
            if (loc == "bunk")
            {
                H(null,"map", 78,16,20,48, 84,80, "Door — harbor");
                H("sleep",null, 58,40,20,24, 64,78, "Cot — sleep");
                H("fridge",null, 22,22,10,34, 28,78, "Fridge — eat");
                H("home_bag",null, 1,20,12,38, 14,80, "Garage bag");
                H("home_skip",null, 1,62,12,14, 12,84, "Skip rope");
                H("pushups",null, 8,72,16,16, 18,86, "Mats — push-ups");
                H("tv",null, 27,52,10,18, 34,80, "TV");
                H("sit_sofa",null, 36,48,20,16, 46,78, "Sofa — nap");
                H("replay",null, 43,62,8,12, 46,80, "Juno's tape", true);
                H("shadow",null, 48,22,10,28, 50,76, "Locker — shadowbox");
            }
            else if (loc == "gym")
            {
                H("bag",null, 18,4,22,38, 30,68, "Heavy bag");
                H("weights",null, 0,20,22,52, 20,78, "Bent bar");
                H("skip",null, 70,62,18,32, 80,82, "Skip rope");
                H("spar",null, 24,50,42,38, 48,80, "Spar mat");
                H("talk_kade",null, 70,34,12,28, 74,72, "Kade Ruiz");
                H(null,"map", 0,0,10,12, 10,66, "Leave gym");
            }
            else if (loc == "docks")
            {
                H("haul",null, 22,14,34,38, 44,76, "Crates — haul");
                H("overtime",null, 56,40,16,22, 60,76, "Double shift");
                H("locker",null, 2,16,16,50, 18,76, "Juno's locker", true);
                H(null,"map", 0,0,10,12, 8,72, "Leave docks");
            }
            else if (loc == "alley")
            {
                H("board",null, 3,2,28,54, 18,72, "Fight board");
                H("rope_alley",null, 20,70,52,24, 48,80, "Footwork");
                H("dumpster",null, 72,48,22,28, 68,80, "Bins — burger");
                H(null,"map", 42,18,16,22, 50,72, "Street — map");
            }
            else if (loc == "arena")
            {
                H("arena_board",null, 26,4,48,28, 22,82, "Commission card");
                H(null,"map", 0,0,10,14, 8,74, "Leave arena");
            }
            else if (loc == "diner")
            {
                H("coffee",null, 32,30,12,22, 38,78, "Coffee $4");
                H("plate",null, 16,56,28,24, 30,84, "Dock plate $14");
                H("talk_oz",null, 46,26,16,32, 54,78, "Oz Pell");
                H(null,"map", 80,8,18,58, 86,78, "Door — map");
            }
            else if (loc == "map")
            {
                // travel spots use travel field via MapHotspots builder
            }
            return list;
        }

        public static List<HotspotPct> MapSpots()
        {
            var list = new List<HotspotPct>();
            void T(string travel, float x,float y,float w,float h, string label)
            {
                list.Add(new HotspotPct{ travel=travel, x=x,y=y,w=w,h=h, standX=x+w/2, standY=y+h, label=label });
            }
            T("bunk", 2,30,14,28, "Bunkhouse 4C");
            T("docks", 16,30,13,26, "Blackwater Docks");
            T("gym", 38,32,11,26, "Rust Bucket Gym");
            T("alley", 40,56,12,10, "Bin Alley");
            T("diner", 49,32,14,26, "The Last Whistle");
            T("arena", 62,20,14,24, "Harbor Arena");
            return list;
        }

        static FloorPct F(float a,float b,float c,float d)=> new FloorPct{minX=a,maxX=b,minY=c,maxY=d};
    }
}