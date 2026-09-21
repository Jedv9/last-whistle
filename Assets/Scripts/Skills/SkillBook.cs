using System.Collections.Generic;
using UnityEngine;
using LastWhistle.Core;

namespace LastWhistle.Skills
{
    public class SkillBook : MonoBehaviour
    {
        public static SkillBook Instance { get; private set; }

        public int slotCount = 3;
        public readonly List<string> owned = new List<string>();
        public readonly List<string> equipped = new List<string>();
        public readonly HashSet<string> perks = new HashSet<string>();
        public int unlocksBought;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            if (owned.Count == 0) ResetAll();
        }

        public void ResetAll()
        {
            owned.Clear();
            equipped.Clear();
            perks.Clear();
            slotCount = 3;
            unlocksBought = 0;
            foreach (var s in SkillCatalog.All)
                if (s.unlockedAtStart) owned.Add(s.id);
            equipped.Add("jab");
            equipped.Add("guard");
            equipped.Add("breathe");
        }

        public int NextCost => Mathf.Min(8, 1 + unlocksBought);

        public bool Owns(string id) => owned.Contains(id);

        public bool CanUnlock(SkillDef def)
        {
            if (def == null || Owns(def.id)) return false;
            var stats = FighterStats.Instance;
            if (stats == null || stats.skillPoints < NextCost) return false;
            if (!string.IsNullOrEmpty(def.requires) && !Owns(def.requires)) return false;
            return true;
        }

        public bool Unlock(string id)
        {
            var def = SkillCatalog.Get(id);
            if (!CanUnlock(def)) return false;
            var stats = FighterStats.Instance;
            stats.skillPoints -= NextCost;
            unlocksBought++;
            owned.Add(id);
            if (def.IsPerk) perks.Add(id);
            if (def.IsSlot) slotCount = Mathf.Min(6, slotCount + 1);
            return true;
        }

        public void SetSlot(int index, string skillId)
        {
            while (equipped.Count < slotCount) equipped.Add("");
            if (index < 0 || index >= slotCount) return;
            if (!string.IsNullOrEmpty(skillId) && !Owns(skillId)) return;
            var def = SkillCatalog.Get(skillId);
            if (def != null && !def.IsEquipable) return;
            equipped[index] = skillId ?? "";
        }

        public List<SkillDef> EquippedDefs()
        {
            var list = new List<SkillDef>();
            for (int i = 0; i < slotCount && i < equipped.Count; i++)
            {
                var d = SkillCatalog.Get(equipped[i]);
                if (d != null && d.IsEquipable) list.Add(d);
            }
            if (list.Count == 0)
            {
                var jab = SkillCatalog.Get("jab");
                if (jab != null) list.Add(jab);
            }
            return list;
        }

        public bool HasPerkFlag(string flag)
        {
            foreach (var id in perks)
            {
                var d = SkillCatalog.Get(id);
                if (d == null) continue;
                if (flag == "missHalf" && d.missHalfEnergy) return true;
                if (flag == "chin" && d.chin) return true;
                if (flag == "lightFeet" && d.lightFeet) return true;
                if (flag == "extraRegen" && d.extraRegen) return true;
                if (flag == "combo" && d.comboChance) return true;
            }
            return false;
        }

        public float PerkArmor()
        {
            float a = 0f;
            foreach (var id in perks)
            {
                var d = SkillCatalog.Get(id);
                if (d != null) a += d.armor;
            }
            return a;
        }
    }
}
