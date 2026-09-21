using UnityEngine;

namespace LastWhistle.Core
{
    public static class GameBootstrap
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void EnsureCore()
        {
            if (GameClock.Instance == null)
                new GameObject("GameClock").AddComponent<GameClock>();
            if (FighterStats.Instance == null)
                new GameObject("FighterStats").AddComponent<FighterStats>();
        }
    }
}