using UnityEngine;
using LastWhistle.UI;
using LastWhistle.World;

namespace LastWhistle.Core
{
    public static class GameBootstrap
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void EnsureCore()
        {
            Boot();
            GameShell.Ensure();
            var name = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
            if (name == "Map") MapDirector.Ensure();
            else if (name != "Title" && name != "Fight") RoomRuntime.Ensure();
        }

        public static void Boot()
        {
            if (GameClock.Instance == null) new GameObject("GameClock").AddComponent<GameClock>();
            if (FighterStats.Instance == null) new GameObject("FighterStats").AddComponent<FighterStats>();
            if (GameState.Instance == null) new GameObject("GameState").AddComponent<GameState>();
            if (LastWhistle.Skills.SkillBook.Instance == null) new GameObject("SkillBook").AddComponent<LastWhistle.Skills.SkillBook>();
        }
    }
}
