using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersonalPortfolio.Models
{
    public class BJHand : Hand
    {
        public BJHand() : base() { }

        public BJHand(Deck d, int numCards) : base(d, numCards) 
        { 
        }

        public int Score
        {
            get 
            {
                int score = 0;
                foreach (Card c in cards)
                {
                    if (c.IsFaceCard())
                        score += 10;
                    else
                        score += c.Value;
                }
                if (HasAce && score <= 11)
                    score += 10;

                return score;
            }
        }

        public bool IsWinner { get; set; }

        public bool HasAce
        {
            get 
            {
                foreach (Card c in cards)
                {
                    if (c.IsAce())
                        return true;
                }
                return false;
            }
        }

        public bool IsBusted
        {
            get 
            {
                if (Score > 21)
                    return true;
                else
                    return false;
            }
        }
    }
}
