using System.Collections.Generic;

namespace LastWhistle.Skills
{
    public static class SkillCatalog
    {
        static List<SkillDef> _all;
        static Dictionary<string, SkillDef> _byId;

        public static IReadOnlyList<SkillDef> All
        {
            get { Ensure(); return _all; }
        }

        public static SkillDef Get(string id)
        {
            Ensure();
            if (string.IsNullOrEmpty(id)) return null;
            return _byId.TryGetValue(id, out var d) ? d : null;
        }

        static void Ensure()
        {
            if (_all != null) return;
            _all = new List<SkillDef>();
            _byId = new Dictionary<string, SkillDef>();
            AddBasics();
            AddCrane();
            AddSlip();
            AddGalley();
            foreach (var s in _all) _byId[s.id] = s;
        }

        static SkillDef A(SkillDef d)
        {
            _all.Add(d);
            return d;
        }

        static void AddBasics()
        {
            A(new SkillDef
            {
                id = "jab", name = "Jab", path = SkillPath.Basic, kind = SkillKind.Attack, row = 0, col = 1,
                unlockedAtStart = true, blurb = "Cheap, honest, keeps the range.",
                dmgBase = 1, dmgStr = 0.7f, accBase = 78, accAgi = 2.0f, energyBase = 4, energyStr = 0.15f
            });
            A(new SkillDef
            {
                id = "guard", name = "Guard", path = SkillPath.Basic, kind = SkillKind.Defense, row = 0, col = 0,
                unlockedAtStart = true, blurb = "Hands up. Cuts incoming damage.",
                armor = 0.55f, energyBase = 5, energyStr = 0.1f, accBase = 100
            });
            A(new SkillDef
            {
                id = "breathe", name = "Breathe", path = SkillPath.Basic, kind = SkillKind.Utility, row = 0, col = 2,
                unlockedAtStart = true, skipAttack = true, blurb = "Skip the swing. Steal energy back.",
                energyBase = 0, energyRestore = 14f, accBase = 100
            });
            A(new SkillDef
            {
                id = "cross", name = "Cross", path = SkillPath.Basic, kind = SkillKind.Attack, row = 1, col = 1,
                requires = "jab", treeCost = 1, blurb = "Rear hand. Pays in energy.",
                dmgBase = 2, dmgStr = 0.95f, accBase = 70, accAgi = 1.5f, energyBase = 7, energyStr = 0.22f
            });
            A(new SkillDef
            {
                id = "duck", name = "Duck", path = SkillPath.Basic, kind = SkillKind.Defense, row = 1, col = 0,
                requires = "guard", treeCost = 1, blurb = "Head off the line.",
                dodge = 22f, energyBase = 6, accBase = 100
            });
            A(new SkillDef
            {
                id = "hook", name = "Hook", path = SkillPath.Basic, kind = SkillKind.Attack, row = 2, col = 1,
                requires = "cross", treeCost = 1, blurb = "Around the guard. Misses hurt.",
                dmgBase = 3, dmgStr = 1.15f, accBase = 58, accAgi = 1.2f, energyBase = 10, energyStr = 0.28f, knockdown = 0.08f
            });
            A(new SkillDef
            {
                id = "slot_basic", name = "Fourth Pocket", path = SkillPath.Basic, kind = SkillKind.Slot, row = 2, col = 2,
                treeCost = 2, blurb = "One more blue slot between rounds."
            });
            A(new SkillDef
            {
                id = "perk_callus", name = "Callus", path = SkillPath.Basic, kind = SkillKind.Perk, row = 2, col = 0,
                treeCost = 2, blurb = "A little armor from dock work.", armor = 0.8f
            });
        }

        static void AddCrane()
        {
            A(new SkillDef
            {
                id = "dock_hook", name = "Dock Hook", path = SkillPath.Crane, kind = SkillKind.Attack, row = 0, col = 0,
                requires = "cross", treeCost = 1, blurb = "Crane-path power. Heavy, hungry.",
                dmgBase = 4, dmgStr = 1.35f, accBase = 60, energyBase = 12, energyStr = 0.35f, knockdown = 0.1f
            });
            A(new SkillDef
            {
                id = "crane_lift", name = "Crane Lift", path = SkillPath.Crane, kind = SkillKind.Attack, row = 1, col = 0,
                requires = "dock_hook", treeCost = 1, blurb = "Body shot that saps yellow bar.",
                dmgBase = 2, dmgStr = 0.8f, accBase = 68, energyBase = 9, energyDamage = 10f
            });
            A(new SkillDef
            {
                id = "boom_straight", name = "Boom Straight", path = SkillPath.Crane, kind = SkillKind.Attack, row = 2, col = 0,
                requires = "crane_lift", treeCost = 1, blurb = "Walk-down cross. Keeps the turn if it dumps their energy.",
                dmgBase = 5, dmgStr = 1.5f, accBase = 62, energyBase = 14, energyStr = 0.4f, keepInitiative = true, knockdown = 0.12f
            });
            A(new SkillDef
            {
                id = "hawser", name = "Hawser Upper", path = SkillPath.Crane, kind = SkillKind.Attack, row = 3, col = 0,
                requires = "boom_straight", treeCost = 2, blurb = "From the hips. Canvas wants a word.",
                dmgBase = 6, dmgStr = 1.7f, accBase = 52, energyBase = 16, energyStr = 0.45f, knockdown = 0.22f
            });
            A(new SkillDef
            {
                id = "container", name = "Container", path = SkillPath.Crane, kind = SkillKind.Attack, row = 4, col = 0,
                requires = "hawser", treeCost = 2, blurb = "All-in. Miss and you pay the shift.",
                dmgBase = 9, dmgStr = 2.0f, accBase = 48, energyBase = 20, energyStr = 0.5f, knockdown = 0.3f
            });
            A(new SkillDef
            {
                id = "perk_forearm", name = "Iron Forearm", path = SkillPath.Crane, kind = SkillKind.Perk, row = 1, col = 1,
                requires = "dock_hook", treeCost = 1, blurb = "Blocks eat less of you.", armor = 1.4f
            });
            A(new SkillDef
            {
                id = "perk_wreck", name = "Wreck Hands", path = SkillPath.Crane, kind = SkillKind.Perk, row = 3, col = 1,
                requires = "boom_straight", treeCost = 2, blurb = "Misses cost half energy.", missHalfEnergy = true
            });
            A(new SkillDef
            {
                id = "slot_crane", name = "Crane Pocket", path = SkillPath.Crane, kind = SkillKind.Slot, row = 4, col = 1,
                requires = "hawser", treeCost = 2, blurb = "Another blue square."
            });
        }

        static void AddSlip()
        {
            A(new SkillDef
            {
                id = "feather", name = "Feather Jab", path = SkillPath.Slip, kind = SkillKind.Attack, row = 0, col = 0,
                requires = "jab", treeCost = 1, blurb = "Slip-path speed. Cheap and mean.",
                dmgBase = 1, dmgStr = 0.45f, dmgAgi = 0.55f, accBase = 84, accAgi = 2.4f, energyBase = 3, energyStr = 0.08f
            });
            A(new SkillDef
            {
                id = "counter_rip", name = "Counter Rip", path = SkillPath.Slip, kind = SkillKind.Attack, row = 1, col = 0,
                requires = "feather", treeCost = 1, blurb = "Pays extra if they swung first.",
                dmgBase = 2, dmgStr = 0.6f, dmgAgi = 0.7f, accBase = 72, energyBase = 8, counterBonus = true
            });
            A(new SkillDef
            {
                id = "weave", name = "Weave", path = SkillPath.Slip, kind = SkillKind.Defense, row = 1, col = 1,
                requires = "duck", treeCost = 1, blurb = "Shoulders and eyes. High dodge.",
                dodge = 38f, energyBase = 7, accBase = 100
            });
            A(new SkillDef
            {
                id = "one_two", name = "One-Two", path = SkillPath.Slip, kind = SkillKind.Attack, row = 2, col = 0,
                requires = "counter_rip", treeCost = 1, blurb = "Chance to fire twice at half energy.",
                dmgBase = 2, dmgStr = 0.5f, dmgAgi = 0.6f, accBase = 76, energyBase = 9, comboChance = true
            });
            A(new SkillDef
            {
                id = "ghost", name = "Ghost Bell", path = SkillPath.Slip, kind = SkillKind.Attack, row = 3, col = 0,
                requires = "one_two", treeCost = 2, blurb = "Almost never misses. Almost never knocks down.",
                dmgBase = 3, dmgAgi = 1.1f, accBase = 90, accAgi = 2.2f, energyBase = 8
            });
            A(new SkillDef
            {
                id = "perk_feet", name = "Light Feet", path = SkillPath.Slip, kind = SkillKind.Perk, row = 2, col = 1,
                requires = "weave", treeCost = 1, blurb = "Passive dodge even without a defense slotted.", lightFeet = true
            });
            A(new SkillDef
            {
                id = "perk_beat", name = "Second Beat", path = SkillPath.Slip, kind = SkillKind.Perk, row = 3, col = 1,
                requires = "one_two", treeCost = 2, blurb = "Combos land more often.", comboChance = true
            });
            A(new SkillDef
            {
                id = "slot_slip", name = "Slip Pocket", path = SkillPath.Slip, kind = SkillKind.Slot, row = 4, col = 0,
                requires = "ghost", treeCost = 2, blurb = "Another blue square."
            });
        }

        static void AddGalley()
        {
            A(new SkillDef
            {
                id = "cover", name = "Cover Up", path = SkillPath.Galley, kind = SkillKind.Defense, row = 0, col = 0,
                requires = "guard", treeCost = 1, blurb = "Galley-path shell. Thick.",
                armor = 1.2f, energyBase = 6, accBase = 100
            });
            A(new SkillDef
            {
                id = "clinch", name = "Clinch", path = SkillPath.Galley, kind = SkillKind.Utility, row = 1, col = 0,
                requires = "cover", treeCost = 1, blurb = "Tie up. Steal their yellow, feed yours.",
                energyBase = 5, energyRestore = 8, energyDamage = 8, skipAttack = true, accBase = 100
            });
            A(new SkillDef
            {
                id = "work_rate", name = "Work Rate", path = SkillPath.Galley, kind = SkillKind.Utility, row = 2, col = 0,
                requires = "clinch", treeCost = 1, skipAttack = true, blurb = "Skip the swing. Big energy back.",
                energyBase = 0, energyRestore = 22, accBase = 100
            });
            A(new SkillDef
            {
                id = "hull", name = "Hull Plate", path = SkillPath.Galley, kind = SkillKind.Defense, row = 2, col = 1,
                requires = "cover", treeCost = 1, blurb = "Damage reduction you can feel.",
                armor = 2.0f, energyBase = 9, accBase = 100
            });
            A(new SkillDef
            {
                id = "last_bell", name = "Last Bell", path = SkillPath.Galley, kind = SkillKind.Defense, row = 3, col = 0,
                requires = "work_rate", treeCost = 2, blurb = "When green is low, the shell thickens.",
                armor = 1.6f, energyBase = 8, accBase = 100, chin = true
            });
            A(new SkillDef
            {
                id = "perk_chin", name = "Iron Chin", path = SkillPath.Galley, kind = SkillKind.Perk, row = 1, col = 1,
                requires = "cover", treeCost = 1, blurb = "Knockdowns need more of a punch.", chin = true
            });
            A(new SkillDef
            {
                id = "perk_wind", name = "Second Wind", path = SkillPath.Galley, kind = SkillKind.Perk, row = 3, col = 1,
                requires = "work_rate", treeCost = 2, blurb = "Energy regen per exchange climbs.", extraRegen = true
            });
            A(new SkillDef
            {
                id = "slot_galley", name = "Galley Pocket", path = SkillPath.Galley, kind = SkillKind.Slot, row = 4, col = 0,
                requires = "last_bell", treeCost = 2, blurb = "Another blue square."
            });
        }
    }
}
