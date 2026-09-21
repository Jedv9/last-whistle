namespace LastWhistle.Skills
{
    public enum SkillKind { Attack, Defense, Utility, Perk, Slot }
    public enum SkillPath { Basic, Crane, Slip, Galley }

    public class SkillDef
    {
        public string id;
        public string name;
        public string blurb;
        public SkillKind kind;
        public SkillPath path;
        public int row;
        public int col;
        public string requires;
        public int treeCost = 1;
        public bool unlockedAtStart;

        public float dmgBase;
        public float dmgStr;
        public float dmgAgi;
        public float accBase = 70f;
        public float accAgi = 1.6f;
        public float energyBase = 6f;
        public float energyStr;
        public float armor;
        public float dodge;
        public float energyRestore;
        public float energyDamage;
        public float knockdown;
        public bool skipAttack;
        public bool keepInitiative;
        public bool counterBonus;
        public bool comboChance;
        public bool missHalfEnergy;
        public bool extraRegen;
        public bool chin;
        public bool lightFeet;

        public bool IsEquipable => kind == SkillKind.Attack || kind == SkillKind.Defense || kind == SkillKind.Utility;
        public bool IsPerk => kind == SkillKind.Perk;
        public bool IsSlot => kind == SkillKind.Slot;
    }
}
