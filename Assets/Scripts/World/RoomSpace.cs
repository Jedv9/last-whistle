using UnityEngine;

namespace LastWhistle.World
{
    /// <summary>Converts Punch Club / Whistle room % coords into Unity world space on a backdrop sprite.</summary>
    public class RoomSpace : MonoBehaviour
    {
        public SpriteRenderer backdrop;
        public float camScale = 0.84f;

        public Vector2 PctToWorld(float px, float py)
        {
            var b = backdrop.bounds;
            // room %: x 0-100 left-right, y 0-100 top-bottom (web style)
            float x = Mathf.Lerp(b.min.x, b.max.x, px / 100f);
            float y = Mathf.Lerp(b.max.y, b.min.y, py / 100f);
            return new Vector2(x, y);
        }

        public Vector2 PctSizeToWorld(float pw, float ph)
        {
            var b = backdrop.bounds;
            return new Vector2(b.size.x * pw / 100f, b.size.y * ph / 100f);
        }

        public bool Blocked(string loc, float px, float py)
        {
            var floor = RoomCatalog.Floor(loc);
            if (px < floor.minX || px > floor.maxX || py < floor.minY || py > floor.maxY) return true;
            foreach (var s in RoomCatalog.Solids(loc))
            {
                if (px >= s.x - 1.1f && px <= s.x + s.w + 1.1f && py >= s.y - 1.1f && py <= s.y + s.h + 1.1f)
                    return true;
            }
            return false;
        }
    }
}