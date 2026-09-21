using UnityEngine;

namespace LastWhistle.World
{
    [RequireComponent(typeof(Rigidbody2D))]
    public class WalkController : MonoBehaviour
    {
        public float moveSpeed = 3.6f;
        public RoomSpace space;
        public string locationId;
        public SpriteRenderer body;
        public Sprite idle, walkA, walkB, punch, lift, down, skip;

        Vector2 _target;
        bool _moving;
        float _anim;
        System.Action _onArrive;
        Rigidbody2D _rb;
        Camera _cam;

        void Awake()
        {
            _rb = GetComponent<Rigidbody2D>();
            _rb.gravityScale = 0;
            _rb.freezeRotation = true;
            _rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            _cam = Camera.main;
            _target = _rb.position;
        }

        public void GoToWorld(Vector2 world, System.Action onArrive = null)
        {
            _target = world;
            _moving = true;
            _onArrive = onArrive;
        }

        public void GoToPct(float px, float py, System.Action onArrive = null)
        {
            if (space == null) return;
            // slide to nearest walkable-ish stand
            for (int i = 0; i < 12; i++)
            {
                float nx = px + (i % 2 == 0 ? i : -i) * 0.8f;
                float ny = py + ((i / 2) % 2 == 0 ? i * 0.4f : -i * 0.4f);
                if (!space.Blocked(locationId, nx, ny)) { px = nx; py = ny; break; }
            }
            GoToWorld(space.PctToWorld(px, py), onArrive);
        }

        void Update()
        {
            if (_cam == null) _cam = Camera.main;
            if (Input.GetMouseButtonDown(0) && !HotspotClickGuard.Blocked)
            {
                // empty floor click: walk there if convertible
                var w = _cam.ScreenToWorldPoint(Input.mousePosition);
                GoToWorld(new Vector2(w.x, w.y), null);
            }

            if (body != null)
            {
                _anim += Time.deltaTime * (_moving ? 8f : 0f);
                if (_moving && walkA != null && walkB != null)
                    body.sprite = ((int)_anim % 2 == 0) ? walkA : walkB;
                else if (!_moving && idle != null)
                    body.sprite = idle;
            }
        }

        void FixedUpdate()
        {
            if (!_moving) { _rb.velocity = Vector2.zero; return; }
            var delta = _target - _rb.position;
            if (delta.magnitude < 0.08f)
            {
                _rb.velocity = Vector2.zero;
                _moving = false;
                var cb = _onArrive; _onArrive = null; cb?.Invoke();
                return;
            }
            _rb.velocity = delta.normalized * moveSpeed;
            if (body != null && Mathf.Abs(delta.x) > 0.02f) body.flipX = delta.x < 0;
        }

        public void SetPose(string pose)
        {
            if (body == null) return;
            switch (pose)
            {
                case "punch": if (punch) body.sprite = punch; break;
                case "lift": if (lift) body.sprite = lift; break;
                case "down": if (down) body.sprite = down; break;
                case "skip": if (skip) body.sprite = skip; break;
                default: if (idle) body.sprite = idle; break;
            }
        }
    }

    public static class HotspotClickGuard
    {
        public static bool Blocked;
    }
}