using UnityEngine;
using UnityEngine.SceneManagement;
using LastWhistle.Core;
using LastWhistle.UI;

namespace LastWhistle.Story
{
    public static class StoryDirector
    {
        public static void OnLocationEnter(string loc)
        {
            var g = GameState.Instance;
            var c = GameClock.Instance;
            if (g == null) return;
            if (loc == "bunk" && !g.Flag("intro"))
            {
                g.SetFlag("intro");
                DialogueBanner.Talk("BUNKHOUSE 4C",
                    "The alarm goes off. You are alone in the bunk. Juno has been gone for six days.",
                    "Play the tape. Listen to the horn.",
                    () =>
                    {
                        g.SetFlag("hornEar");
                        g.Journal("The horn on the tape is Pier 9's old fog note — not the main channel.");
                        DialogueBanner.Talk("TAPE", "Juno: \"Ren— don't take the night bout. If I don't come back, the ledger is in the—\" The tape dies. Horn. Static.");
                    },
                    "Get dressed and go to work.",
                    () =>
                    {
                        g.SetFlag("grit");
                        DialogueBanner.Talk("YOU", "You leave the tape on the blanket, pull on your boots, and get ready for the docks.");
                    });
                return;
            }
            if (loc == "bunk" && g.Flag("intro") && !g.Flag("ateStart") && !g.Flag("day1Nudge"))
            {
                g.SetFlag("day1Nudge");
                DialogueBanner.Talk("FRIDGE", "Juno left a box of noodles in the fridge. Eat those first. Brant will not pay a person who faints on the quay.");
            }
            if (loc == "docks" && !g.Flag("brant") && g.Flag("intro"))
            {
                g.SetFlag("brant");
                DialogueBanner.Talk("FOREMAN BRANT", "Vale. You cover Juno's shift. Extra crate, extra coin. Cry on your own time. And stay out of Bay C.");
            }
            if (loc == "gym" && !g.Flag("kadeMet"))
            {
                g.SetFlag("kadeMet");
                g.Journal("Kade Ruiz will coach you at the Rust Bucket for $15 a week.");
            }
            if (loc == "canteen" && !g.Flag("maeSeen"))
            {
                g.SetFlag("maeSeen");
            }
            if (loc == "barge" && c != null && !c.IsNight && !c.IsEvening)
            {
                DialogueBanner.Show("Pier 9 is watched in daylight. Come back after the whistle.");
            }
        }

        public static void ReplayTape()
        {
            var g = GameState.Instance;
            g.SetFlag("replayTape");
            g.SetFlag("hornEar");
            g.Journal("You replayed the tape. The horn is Pier 9's fog note.");
            DialogueBanner.Talk("TAPE", "Juno: \"Ren— don't take the night bout. If I don't come back, the ledger is in the—\" Horn. Someone swears. Static.");
        }

        public static void OpenLocker()
        {
            var g = GameState.Instance;
            if (!g.Flag("heardLocker"))
            {
                DialogueBanner.Talk("LOCKER", "Bay C is locked in your head until someone names it. Ask around the canteen and diner.");
                return;
            }
            if (g.Flag("openedLocker"))
            {
                DialogueBanner.Talk("LOCKER", "Handwraps. A photo of you both on Crane 4. Half a ledger: Pier 9. Quiet Ledger. Night bell.");
                return;
            }
            g.SetFlag("openedLocker");
            g.Journal("Juno's locker: wraps, a photo on Crane 4, half a ledger. Pier 9. Quiet Ledger. Fighters used as cover.");
            DialogueBanner.Talk("JUNO'S LOCKER", "Handwraps. A photo of you both on Crane 4. Half a ledger page: Pier 9. Quiet Ledger. Night bell. Fighters as cover.");
        }

        public static void TalkKade()
        {
            var g = GameState.Instance;
            g.SetFlag("kadeMet");
            if (!g.rustMember)
                DialogueBanner.Talk("KADE RUIZ", "Keep your elbows in. Harbor don't forgive. Dues are fifteen. I don't coach tourists.");
            else
                DialogueBanner.Talk("KADE RUIZ", "Juno had a night bout they didn't want. They asked me about a horn on Pier 9. I told them to stay off the water.");
        }

        public static void TalkMae()
        {
            var g = GameState.Instance;
            g.SetFlag("maeMet");
            g.SetFlag("heardLocker");
            g.Journal("Mae: Juno filed a safety complaint the morning they vanished. The file disappeared. Bay C locker is still theirs.");
            DialogueBanner.Talk("MAE OKONKWO", "Juno filed a safety complaint the morning they vanished. The file walked. Bay C, third locker from the horn. Don't let Brant watch you open it.");
        }

        public static void TalkOz()
        {
            var g = GameState.Instance;
            g.SetFlag("ozMet");
            g.Journal("Oz saw Juno that last night. They paid with a Harbor Commission chip. The Quiet Ledger is a boat, not a book.");
            DialogueBanner.Talk("OZ PELL", "Juno sat in that booth. Paid with a Commission chip. Said the Quiet Ledger is a boat, not a book. Then they walked toward the water.");
            if (g.Flag("hornEar")) g.SetFlag("hornEcho");
        }

        public static void TalkLila()
        {
            var g = GameState.Instance;
            g.SetFlag("lilaTalk");
            g.SetFlag("craneOpen");
            g.SetFlag("vargasUnlocked");
            g.Journal("Lila fought Juno. After the win, Silas Crowe whispered. Crane Vargas walked Juno toward the water.");
            DialogueBanner.Talk("NEON LILA", "I fought your sibling. They won. Crowe whispered something, and Vargas walked them toward the water. Don't take Crowe's title fight as a rescue. It's a trap.");
        }

        public static void LookQuay()
        {
            var g = GameState.Instance;
            var c = GameClock.Instance;
            if (c != null && (c.IsNight || c.IsEvening) && g.Flag("hornEar"))
            {
                g.SetFlag("quayNight");
                g.SetFlag("hornEcho");
                g.Journal("The horn on the tape is coming from the water at night. Someone is still signaling Pier 9.");
                DialogueBanner.Talk("QUAY", "The same horn. Longer than the main channel. It comes off the water, not the yard.");
            }
            else
                DialogueBanner.Talk("QUAY", "Cranes, water, a bollard. The yard pretends it sleeps.");
        }

        public static void SneakBarge()
        {
            var g = GameState.Instance;
            var c = GameClock.Instance;
            if (c != null && !c.IsNight && !c.IsEvening)
            {
                DialogueBanner.Talk("PIER 9", "Daylight on the gangway is a good way to get catalogued. Come back at night.");
                return;
            }
            if (!g.Flag("openedLocker"))
            {
                DialogueBanner.Talk("PIER 9", "A dark hull. You do not know which door is a door. Find the locker first.");
                return;
            }
            g.SetFlag("bargeLook");
            if (g.Flag("planMae"))
            {
                g.SetFlag("junoSaved");
                g.Journal("Mae's launch hit Pier 9. Juno is alive. Thin. Angry. Home.");
                DialogueBanner.Talk("JUNO", "You took the long way. The Quiet Ledger moves people when the arena is loud. Don't make me do this twice.");
            }
            else
            {
                DialogueBanner.Talk("HOLD", "A padlock. Voices below. Someone says Vale like a barcode. You back up the gangway.");
            }
        }

        public static void RadioOz()
        {
            var g = GameState.Instance;
            if (!g.Flag("ozMet") || !g.Flag("lilaTalk")) return;
            g.SetFlag("radio");
            g.SetFlag("planMae");
            g.SetFlag("croweUnlocked");
            g.Journal("Shortwave: Juno is alive on the Quiet Ledger. Crowe's title fight is a trap. Mae has a launch boat.");
        }

        public static void OnScene(Scene scene, LoadSceneMode mode)
        {
            if (scene.name == "Title" || scene.name == "Fight" || scene.name == "Map") return;
            string loc = GameState.Instance != null ? GameState.Instance.locationId : GameShell.LocFromScene(scene.name);
            if (!string.IsNullOrEmpty(loc) && loc != "map" && loc != "fight")
                OnLocationEnter(loc);
        }
    }
}
