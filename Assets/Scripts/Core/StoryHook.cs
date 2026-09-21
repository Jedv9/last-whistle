using UnityEngine;
using UnityEngine.SceneManagement;
using LastWhistle.Story;

namespace LastWhistle.Core
{
    public static class StoryHook
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Hook()
        {
            SceneManager.sceneLoaded -= StoryDirector.OnScene;
            SceneManager.sceneLoaded += StoryDirector.OnScene;
            var scene = SceneManager.GetActiveScene();
            StoryDirector.OnScene(scene, LoadSceneMode.Single);
        }
    }
}
