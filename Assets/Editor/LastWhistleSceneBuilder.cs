using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using LastWhistle.Core;
using LastWhistle.World;
using LastWhistle.UI;
using LastWhistle.Combat;

public static class LastWhistleSceneBuilder
{
    [MenuItem("Last Whistle/Build All Scenes")]
    public static void BuildAll()
    {
        EnsureFolders();
        MarkArtSprites();
        BuildRoom("Bunkhouse", "bunk", "Assets/Art/home.png");
        BuildRoom("Gym", "gym", "Assets/Art/gym.png");
        BuildRoom("Docks", "docks", "Assets/Art/docks.png");
        BuildRoom("Alley", "alley", "Assets/Art/alley.png");
        BuildRoom("Arena", "arena", "Assets/Art/arena.png");
        BuildRoom("Diner", "diner", "Assets/Art/diner.png");
        BuildMap();
        BuildFight();
        BuildTitle();
        EditorBuildSettings.scenes = new[]
        {
            S("Title"), S("Map"), S("Bunkhouse"), S("Gym"), S("Docks"), S("Alley"), S("Arena"), S("Diner"), S("Fight")
        };
        AssetDatabase.SaveAssets();
        Debug.Log("Last Whistle: all scenes built.");
    }

    public static void BuildAllCli() { BuildAll(); EditorApplication.Exit(0); }

    static EditorBuildSettingsScene S(string n) => new EditorBuildSettingsScene($"Assets/Scenes/{n}.unity", true);

    static void EnsureFolders() { Directory.CreateDirectory("Assets/Scenes"); Directory.CreateDirectory("Assets/Art"); }

    static void MarkArtSprites()
    {
        foreach (var path in Directory.GetFiles("Assets/Art", "*.png"))
        {
            var rel = path.Replace('\\', '/');
            var imp = AssetImporter.GetAtPath(rel) as TextureImporter;
            if (imp == null) continue;
            imp.textureType = TextureImporterType.Sprite;
            imp.spritePixelsPerUnit = 100;
            imp.mipmapEnabled = false;
            imp.filterMode = FilterMode.Point;
            imp.SaveAndReimport();
        }
    }

    static void BuildTitle()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        NewCam(5f);
        new GameObject("TitleUI").AddComponent<LastWhistle.UI.TitleController>();
        new GameObject("HUD").AddComponent<PunchClubHud>();
        new GameObject("Dialogue").AddComponent<DialogueBanner>();
        EditorSceneManager.SaveScene(scene, "Assets/Scenes/Title.unity");
    }

    static void BuildMap()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var cam = NewCam(5.8f);
        var bg = MakeBackdrop("Assets/Art/map.png", cam, 0.95f);
        var space = bg.AddComponent<RoomSpace>();
        space.backdrop = bg.GetComponent<SpriteRenderer>();
        space.camScale = 0.74f;

        foreach (var hs in RoomCatalog.MapSpots())
            MakeHotspot(hs, "map", null, space);

        // invisible player not needed on map — clicks on spots travel
        new GameObject("HUD").AddComponent<PunchClubHud>();
        new GameObject("Dialogue").AddComponent<DialogueBanner>();
        EnsureManagers();
        EditorSceneManager.SaveScene(scene, "Assets/Scenes/Map.unity");
    }

    static void BuildFight()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var cam = NewCam(5f);
        MakeBackdrop("Assets/Art/ring.png", cam, 0.9f);
        new GameObject("Fight").AddComponent<FightController>();
        new GameObject("HUD").AddComponent<PunchClubHud>();
        new GameObject("Dialogue").AddComponent<DialogueBanner>();
        EnsureManagers();
        EditorSceneManager.SaveScene(scene, "Assets/Scenes/Fight.unity");
    }

    static void BuildRoom(string sceneName, string locId, string art)
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var cam = NewCam(5.2f);
        var bg = MakeBackdrop(art, cam, 0.88f);
        var space = bg.AddComponent<RoomSpace>();
        space.backdrop = bg.GetComponent<SpriteRenderer>();
        space.camScale = 0.84f;

        // solids as invisible blockers in world space
        foreach (var solid in RoomCatalog.Solids(locId))
        {
            var go = new GameObject("Solid");
            var center = space.PctToWorld(solid.x + solid.w / 2f, solid.y + solid.h / 2f);
            var size = space.PctSizeToWorld(solid.w, solid.h);
            go.transform.position = center;
            var box = go.AddComponent<BoxCollider2D>();
            box.size = size;
        }

        var player = new GameObject("Player");
        var psr = player.AddComponent<SpriteRenderer>();
        psr.sprite = LoadSprite("Assets/Art/hero_idle.png");
        psr.sortingOrder = 20;
        var spawn = RoomCatalog.Floor(locId);
        player.transform.position = space.PctToWorld(50, spawn.minY + 6);
        player.transform.localScale = Vector3.one * 0.48f;
        player.AddComponent<CircleCollider2D>().radius = 0.28f;
        var rb = player.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0; rb.freezeRotation = true;
        var walk = player.AddComponent<WalkController>();
        walk.space = space;
        walk.locationId = locId;
        walk.body = psr;
        walk.idle = LoadSprite("Assets/Art/hero_idle.png");
        walk.walkA = LoadSprite("Assets/Art/hero_walk.png");
        walk.walkB = LoadSprite("Assets/Art/hero_walk2.png");
        walk.punch = LoadSprite("Assets/Art/hero_punch.png");
        walk.lift = LoadSprite("Assets/Art/hero_lift.png");
        walk.down = LoadSprite("Assets/Art/hero_down.png");
        walk.skip = LoadSprite("Assets/Art/hero_skip.png");

        foreach (var hs in RoomCatalog.Hotspots(locId))
            MakeHotspot(hs, locId, walk, space);

        new GameObject("HUD").AddComponent<PunchClubHud>();
        new GameObject("Dialogue").AddComponent<DialogueBanner>();
        EnsureManagers();
        EditorSceneManager.SaveScene(scene, $"Assets/Scenes/{sceneName}.unity");
    }

    static void MakeHotspot(HotspotPct hs, string loc, WalkController walk, RoomSpace space)
    {
        var go = new GameObject(string.IsNullOrEmpty(hs.label) ? "Hotspot" : hs.label);
        var center = space.PctToWorld(hs.x + hs.w / 2f, hs.y + hs.h / 2f);
        var size = space.PctSizeToWorld(Mathf.Max(hs.w, 6f), Mathf.Max(hs.h, 6f));
        go.transform.position = center;
        var box = go.AddComponent<BoxCollider2D>();
        box.isTrigger = true;
        box.size = size;
        // kinematic rigidbody so OnMouseDown works reliably with triggers sometimes — use collider non-trigger for mouse
        box.isTrigger = false;
        var rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        var wh = go.AddComponent<WorldHotspot>();
        wh.data = hs;
        wh.walker = walk;
        wh.locationId = loc;
        // visual hint only for story bangs
        if (hs.bang)
        {
            var marker = new GameObject("Bang");
            marker.transform.SetParent(go.transform, false);
            marker.transform.localPosition = new Vector3(0, size.y * 0.5f + 0.2f, 0);
            var tr = marker.AddComponent<TextMesh>();
            tr.text = "!";
            tr.fontSize = 32;
            tr.color = new Color(1f, 0.85f, 0.2f);
            tr.anchor = TextAnchor.MiddleCenter;
            marker.transform.localScale = Vector3.one * 0.15f;
        }
    }

    static GameObject MakeBackdrop(string art, Camera cam, float fill)
    {
        var go = new GameObject("Backdrop");
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadSprite(art);
        sr.sortingOrder = 0;
        if (sr.sprite != null)
        {
            float worldH = cam.orthographicSize * 2f * fill;
            float worldW = worldH * cam.aspect;
            var b = sr.sprite.bounds.size;
            float scale = Mathf.Min(worldW / Mathf.Max(0.01f, b.x), worldH / Mathf.Max(0.01f, b.y));
            go.transform.localScale = Vector3.one * scale;
        }
        return go;
    }

    static void EnsureManagers()
    {
        if (Object.FindObjectOfType<GameClock>() == null) new GameObject("GameClock").AddComponent<GameClock>();
        if (Object.FindObjectOfType<FighterStats>() == null) new GameObject("FighterStats").AddComponent<FighterStats>();
    }

    static Camera NewCam(float size)
    {
        var go = new GameObject("Main Camera");
        var cam = go.AddComponent<Camera>();
        cam.tag = "MainCamera";
        cam.orthographic = true;
        cam.orthographicSize = size;
        cam.backgroundColor = new Color(0.04f, 0.045f, 0.05f);
        cam.transform.position = new Vector3(0, 0, -10);
        go.AddComponent<AudioListener>();
        return cam;
    }

    static Sprite LoadSprite(string path)
    {
        foreach (var a in AssetDatabase.LoadAllAssetsAtPath(path))
            if (a is Sprite s) return s;
        return AssetDatabase.LoadAssetAtPath<Sprite>(path);
    }
}