using System.Collections.Generic;
using UnityEngine;
using LastWhistle.Core;
using LastWhistle.Skills;

namespace LastWhistle.Combat
{
    public class FightFighter
    {
        public string name;
        public bool player;
        public int hp, maxHp;
        public float energy, maxEnergy = 100f;
        public int str, agi, stm, tec;
        public int knockdowns;
        public bool skippingTurn;
        public List<SkillDef> skills = new List<SkillDef>();
        public string[] perks = new string[0];
        public float perkArmor;
        public bool missHalf, chin, lightFeet, extraRegen, comboPerk;
        public SkillDef lastUsed;
        public bool lastWasAttack;
    }

    public class FightExchange
    {
        public bool playerActed;
        public string actor;
        public string skillName;
        public string line;
        public int damage;
        public float energyDelta;
        public bool miss, knockdown, tired;
    }

    public class FightSession
    {
        public OpponentDef opp;
        public FightFighter player;
        public FightFighter enemy;
        public int round = 1;
        public int maxRounds = 3;
        public float roundTime = 20f;
        public float timeLeft = 20f;
        public bool waiting = true;
        public bool running;
        public bool over;
        public bool playerWon;
        public bool playerTurn = true;
        public string log = "";
        public int purse;
        public readonly List<FightExchange> history = new List<FightExchange>();
        public FightExchange last;
    }

    public static class FightEngine
    {
        public static FightSession Make(OpponentDef o)
        {
            var s = FighterStats.Instance;
            var book = SkillBook.Instance;
            var gs = GameState.Instance;
            var fight = new FightSession { opp = o, maxRounds = o.rounds, purse = o.purse };
            fight.player = new FightFighter
            {
                name = s != null ? s.fighterName : "Vale",
                player = true,
                hp = s != null ? s.FightHp : 100,
                maxHp = s != null ? s.FightHp : 100,
                energy = 100f,
                str = s != null ? s.Str : 6,
                agi = s != null ? s.Agi : 5,
                stm = s != null ? s.Sta : 5,
                tec = 5 + (gs != null ? gs.ItemBonus("tec") : 0),
                skills = book != null ? book.EquippedDefs() : new List<SkillDef> { SkillCatalog.Get("jab") },
                perkArmor = book != null ? book.PerkArmor() : 0,
                missHalf = book != null && book.HasPerkFlag("missHalf"),
                chin = book != null && book.HasPerkFlag("chin"),
                lightFeet = book != null && book.HasPerkFlag("lightFeet"),
                extraRegen = book != null && book.HasPerkFlag("extraRegen"),
                comboPerk = book != null && book.HasPerkFlag("combo")
            };
            fight.enemy = new FightFighter
            {
                name = o.name,
                player = false,
                hp = o.hp,
                maxHp = o.hp,
                energy = 100f,
                str = o.str, agi = o.agi, stm = o.stm, tec = o.tec,
                perks = o.perkNames ?? new string[0]
            };
            foreach (var id in o.skillIds)
            {
                var d = SkillCatalog.Get(id);
                if (d != null) fight.enemy.skills.Add(d);
            }
            if (fight.enemy.skills.Count == 0) fight.enemy.skills.Add(SkillCatalog.Get("jab"));
            foreach (var p in fight.enemy.perks)
            {
                if (p != null && p.ToLower().Contains("chin")) fight.enemy.chin = true;
                if (p != null && p.ToLower().Contains("wind")) fight.enemy.extraRegen = true;
                if (p != null && p.ToLower().Contains("wreck")) fight.enemy.missHalf = true;
                if (p != null && p.ToLower().Contains("light")) fight.enemy.lightFeet = true;
            }
            fight.log = o.intro;
            fight.waiting = true;
            return fight;
        }

        public static void RefreshPlayerLoadout(FightSession f)
        {
            var book = SkillBook.Instance;
            if (book == null || f == null || f.over) return;
            f.player.skills = book.EquippedDefs();
        }

        public static void Bell(FightSession f)
        {
            if (f == null || f.over) return;
            RefreshPlayerLoadout(f);
            f.waiting = false;
            f.running = true;
            f.timeLeft = f.roundTime;
            f.playerTurn = f.player.agi >= f.enemy.agi;
            f.log = "Bell. Round " + f.round + ".";
        }

        public static FightExchange Tick(FightSession f)
        {
            if (f == null || f.over || !f.running) return null;
            var actor = f.playerTurn ? f.player : f.enemy;
            var other = f.playerTurn ? f.enemy : f.player;
            if (actor.skippingTurn)
            {
                actor.skippingTurn = false;
                Regen(actor);
                f.playerTurn = !f.playerTurn;
                f.timeLeft -= 1.1f;
                return EndCheck(f, new FightExchange { actor = actor.name, line = actor.name + " gets up slow.", playerActed = actor.player });
            }

            var skill = Pick(actor, other);
            var ex = Resolve(f, actor, other, skill);
            f.last = ex;
            f.history.Add(ex);
            while (f.history.Count > 8) f.history.RemoveAt(0);
            f.log = ex.line;

            bool keep = skill != null && skill.keepInitiative && other.energy <= 0f && ex.damage > 0 && !ex.miss;
            if (!keep) f.playerTurn = !f.playerTurn;
            f.timeLeft -= 1.1f;

            Regen(actor);
            return EndCheck(f, ex);
        }

        static FightExchange EndCheck(FightSession f, FightExchange ex)
        {
            if (f.player.hp <= 0 || f.player.knockdowns >= 3) { Finish(f, false); return ex; }
            if (f.enemy.hp <= 0 || f.enemy.knockdowns >= 3) { Finish(f, true); return ex; }
            if (f.timeLeft <= 0f)
            {
                f.running = false;
                if (f.round >= f.maxRounds)
                {
                    Finish(f, f.player.hp > f.enemy.hp);
                }
                else
                {
                    f.round++;
                    f.waiting = true;
                    f.player.energy = Mathf.Min(100f, f.player.energy + 12f);
                    f.enemy.energy = Mathf.Min(100f, f.enemy.energy + 12f);
                    f.log = "Round over. Swap the blue slots if the yellow bar is dying.";
                }
            }
            return ex;
        }

        static void Finish(FightSession f, bool playerWin)
        {
            f.over = true;
            f.running = false;
            f.waiting = false;
            f.playerWon = playerWin;
            f.log = playerWin ? f.opp.win : f.opp.lose;
        }

        static void Regen(FightFighter a)
        {
            float r = 5f + a.stm * 1.5f;
            if (a.extraRegen) r += 4f;
            a.energy = Mathf.Min(a.maxEnergy, a.energy + r * 0.35f);
        }

        static SkillDef Pick(FightFighter a, FightFighter b)
        {
            var atk = new List<SkillDef>();
            var def = new List<SkillDef>();
            var util = new List<SkillDef>();
            foreach (var s in a.skills)
            {
                if (s == null) continue;
                if (s.kind == SkillKind.Attack) atk.Add(s);
                else if (s.kind == SkillKind.Defense) def.Add(s);
                else util.Add(s);
            }
            if (a.energy < 18f && util.Count > 0 && Random.value < 0.7f) return util[Random.Range(0, util.Count)];
            if (a.hp < a.maxHp * 0.3f && def.Count > 0 && Random.value < 0.45f) return def[Random.Range(0, def.Count)];
            if (b.lastWasAttack && def.Count > 0 && Random.value < 0.4f) return def[Random.Range(0, def.Count)];
            if (atk.Count > 0 && Random.value < 0.7f) return atk[Random.Range(0, atk.Count)];
            if (def.Count > 0) return def[Random.Range(0, def.Count)];
            if (util.Count > 0) return util[Random.Range(0, util.Count)];
            if (atk.Count > 0) return atk[0];
            return SkillCatalog.Get("jab");
        }

        static FightExchange Resolve(FightSession f, FightFighter atk, FightFighter def, SkillDef skill)
        {
            atk.lastUsed = skill;
            var ex = new FightExchange { actor = atk.name, skillName = skill != null ? skill.name : "Flail", playerActed = atk.player };
            float cost = skill != null ? skill.energyBase + skill.energyStr * atk.str : 8f;
            if (atk.energy <= 0.5f)
            {
                ex.tired = true;
                ex.line = atk.name + " is empty. Hands down.";
                atk.lastWasAttack = false;
                return ex;
            }
            if (atk.energy < cost)
            {
                cost = atk.energy;
                ex.tired = true;
            }
            atk.energy = Mathf.Max(0f, atk.energy - cost);
            ex.energyDelta = -cost;

            if (skill != null && (skill.kind == SkillKind.Defense || skill.skipAttack))
            {
                atk.lastWasAttack = false;
                if (skill.energyRestore > 0) atk.energy = Mathf.Min(100f, atk.energy + skill.energyRestore + atk.stm * 0.3f);
                if (skill.energyDamage > 0 && skill.skipAttack) def.energy = Mathf.Max(0f, def.energy - skill.energyDamage);
                ex.line = atk.name + " uses " + skill.name + ".";
                return ex;
            }

            atk.lastWasAttack = true;
            float acc = (skill != null ? skill.accBase : 60f) + (skill != null ? skill.accAgi : 1f) * atk.agi * 0.35f;
            acc -= def.agi * 0.45f;
            if (def.lightFeet) acc -= 8f;
            if (def.lastUsed != null && def.lastUsed.kind == SkillKind.Defense) acc -= def.lastUsed.dodge;
            if (atk.energy < 12f) acc -= 14f;
            acc = Mathf.Clamp(acc, 18f, 94f);
            if (Random.value * 100f > acc)
            {
                ex.miss = true;
                if (atk.missHalf || (skill != null && skill.missHalfEnergy))
                    atk.energy = Mathf.Min(100f, atk.energy + cost * 0.5f);
                ex.line = atk.name + " fires " + (skill != null ? skill.name : "a punch") + ". Air.";
                return ex;
            }

            float dmg = (skill != null ? skill.dmgBase : 1f) + (skill != null ? skill.dmgStr : 0.7f) * atk.str + (skill != null ? skill.dmgAgi : 0f) * atk.agi;
            dmg += atk.tec * 0.15f;
            if (skill != null && skill.counterBonus && def.lastWasAttack) dmg *= 1.35f;
            dmg *= 0.88f + Random.value * 0.28f;
            if (atk.energy < 12f) dmg *= 0.72f;
            float armor = def.stm * 0.35f + def.perkArmor;
            if (def.lastUsed != null && def.lastUsed.kind == SkillKind.Defense) armor += def.lastUsed.armor * (3f + def.str * 0.4f);
            if (def.lastUsed != null && def.lastUsed.chin && def.hp < def.maxHp * 0.35f) armor += 4f;
            dmg = Mathf.Max(1f, dmg - armor * 0.35f);
            if (def.energy <= 0.5f)
            {
                dmg += 10f;
                ex.knockdown = true;
            }
            int idmg = Mathf.Max(1, Mathf.RoundToInt(dmg));
            def.hp = Mathf.Max(0, def.hp - idmg);
            def.energy = Mathf.Max(0f, def.energy - 3f);
            if (skill != null && skill.energyDamage > 0) def.energy = Mathf.Max(0f, def.energy - skill.energyDamage);
            ex.damage = idmg;

            float kd = skill != null ? skill.knockdown : 0f;
            if (idmg >= def.maxHp * 0.16f) kd += 0.12f;
            if (def.chin) kd *= 0.55f;
            if (!ex.knockdown && def.hp > 0 && Random.value < kd)
            {
                ex.knockdown = true;
                def.knockdowns++;
                def.energy = Mathf.Max(0f, def.energy - 12f);
                def.skippingTurn = true;
            }

            bool combo = skill != null && (skill.comboChance || atk.comboPerk) && Random.value < 0.28f;
            if (combo && def.hp > 0)
            {
                int extra = Mathf.Max(1, idmg / 2);
                def.hp = Mathf.Max(0, def.hp - extra);
                ex.damage += extra;
                ex.line = atk.name + " " + skill.name + " twice. " + extra + "+" + idmg + ".";
            }
            else
            {
                ex.line = atk.name + " lands " + (skill != null ? skill.name : "a punch") + " (" + idmg + ")" + (ex.knockdown ? " — DOWN." : ".");
            }

            if (skill != null && skill.comboChance && combo == false && Random.value < 0.15f)
            {
                atk.energy = Mathf.Max(0f, atk.energy - cost * 0.5f);
            }
            return ex;
        }
    }
}
