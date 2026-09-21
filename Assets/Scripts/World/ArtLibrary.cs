using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

namespace LastWhistle.World
{
    public static class ArtLibrary
    {
        public static Sprite Sprite(string fileNoExt)
        {
            if (string.IsNullOrEmpty(fileNoExt)) return null;
            string path = "Assets/Art/" + fileNoExt + ".png";
#if UNITY_EDITOR
            foreach (var a in AssetDatabase.LoadAllAssetsAtPath(path))
                if (a is Sprite s) return s;
            var one = AssetDatabase.LoadAssetAtPath<Sprite>(path);
            if (one != null) return one;
#endif
            foreach (var s in Resources.FindObjectsOfTypeAll<Sprite>())
            {
                if (s != null && s.name == fileNoExt) return s;
            }
            return null;
        }

        public static string FileForLoc(string loc)
        {
            switch (loc)
            {
                case "bunk": return "home";
                case "gym": return "gym";
                case "docks": return "docks";
                case "alley": return "alley";
                case "arena": return "arena";
                case "diner": return "diner";
                case "canteen": return "canteen";
                case "market": return "market";
                case "temple": return "temple";
                case "crane": return "crane";
                case "barge": return "barge";
                case "map": return "map";
                case "fight": return "ring";
                default: return "home";
            }
        }
    }
}
